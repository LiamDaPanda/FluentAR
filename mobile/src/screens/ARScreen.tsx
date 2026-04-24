import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { CourseData } from "@fluentar/shared";
import ARSurface from "../components/ARSurface";
import type { FloatingItem } from "../components/FloatingObjects";
import { fetchCourse, postArSession, postProgress } from "../api/course";
import { useAppConfig } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useLessonProgress } from "../context/LessonProgressContext";
import { saveArHistoryEntry } from "../lib/arHistory";
import { checkAnswer } from "../lib/stringMatch";
import { createAsr, isAsrSupported, type ASRController } from "../lib/asr";
import type { RootStackParamList } from "../navigation/types";

const PRIMARY = "#2563eb";
const PRIMARY_MUTED = "#93c5fd";
const SUCCESS = "#10b981";
const DANGER = "#ef4444";

type Nav = NativeStackNavigationProp<RootStackParamList, "ARChallenge">;

type Line = { role: "tutor" | "you" | "system"; text: string };

function getCameraHint(theme: string | undefined, langName: string): string {
  const t = theme ?? "";
  if (t.includes("foundation") || t.includes("alphabet"))
    return `Look at letters around you and sound them out in ${langName}.`;
  if (t.includes("vocabulary") || t.includes("objects"))
    return `Point at objects and name them in ${langName}.`;
  if (t.includes("action") || t.includes("verb"))
    return `Describe what is happening around you in ${langName}.`;
  if (t.includes("shopping") || t.includes("finance"))
    return `Pretend the items in front of you are for sale — ask the prices in ${langName}.`;
  if (t.includes("travel"))
    return `Imagine you are in a hotel or airport. Greet the staff in ${langName}.`;
  return `Talk with your tutor in ${langName} about what you see.`;
}

function isTutorConversation(theme: string | undefined): boolean {
  const t = theme ?? "";
  return t.includes("conversation") || t.includes("tutor") || t === "" || !t;
}

export default function ARScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: { params: { levelId: string; moduleId: string; lessonId: string } };
}) {
  const { levelId, moduleId, lessonId } = route.params;
  const { mockMode, apiBaseUrl, studentId } = useAppConfig();
  const { language, catalog } = useLanguage();
  const { markComplete } = useLessonProgress();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [utterance, setUtterance] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [turn, setTurn] = useState(0);
  const [done, setDone] = useState(false);
  const [lastScore, setLastScore] = useState<{ score: number; matched: boolean; bestMatch: string | null } | null>(null);
  const [turnScores, setTurnScores] = useState<number[]>([]);
  const [listening, setListening] = useState(false);
  const [asrError, setAsrError] = useState<string | null>(null);
  const asrRef = useRef<ASRController | null>(null);
  const asrSupported = isAsrSupported();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await fetchCourse(mockMode, apiBaseUrl, language ?? "en");
      if (!cancelled) setCourse(c);
    })();
    return () => {
      cancelled = true;
    };
  }, [mockMode, apiBaseUrl, language]);

  useEffect(() => {
    return () => {
      Speech.stop();
      asrRef.current?.stop();
    };
  }, []);

  const bcp47 = course?.bcp47 ?? course?.language ?? "en-US";

  const speakTutor = (text: string) => {
    if (!text) return;
    try {
      Speech.stop();
      Speech.speak(text, { language: bcp47, rate: 0.9 });
    } catch {}
  };

  const mod = useMemo(() => {
    if (!course) return null;
    const level = course.levels?.find((l) => l.id === levelId);
    return level?.modules?.find((m) => m.id === moduleId) ?? null;
  }, [course, levelId, moduleId]);

  const langName = useMemo(
    () => catalog.find((l) => l.code === language)?.nativeName ?? "your target language",
    [catalog, language]
  );

  const cameraHint = useMemo(() => getCameraHint(mod?.theme, langName), [mod, langName]);
  const tutorMode = useMemo(() => isTutorConversation(mod?.theme), [mod]);

  const tutorTurns = useMemo<string[]>(
    () => (mod?.arScenario?.tutorLines ?? []).filter(Boolean),
    [mod]
  );
  const totalTurns = tutorTurns.length;

  const promptChips = useMemo<string[]>(
    () => mod?.arScenario?.expectedLearnerResponses ?? [],
    [mod]
  );

  const floatingItems = useMemo<FloatingItem[]>(() => {
    if (!mod) return [];
    const seen = new Set<string>();
    const out: FloatingItem[] = [];
    for (const lesson of mod.lessons ?? []) {
      for (const card of lesson.flashcards ?? []) {
        const term = (card.term ?? "").trim();
        if (!term || seen.has(term)) continue;
        seen.add(term);
        out.push({
          id: `${lesson.id}-${term}`,
          term,
          translation: card.translation,
        });
        if (out.length >= 6) break;
      }
      if (out.length >= 6) break;
    }
    if (out.length === 0) {
      for (const r of promptChips.slice(0, 6)) {
        out.push({ id: r, term: r });
      }
    }
    return out;
  }, [mod, promptChips]);

  const highlightedItemId = useMemo<string | null>(() => {
    if (done) return null;
    const expected = (promptChips[turn] ?? "").trim();
    if (!expected) return null;
    const match = floatingItems.find(
      (it) => it.term === expected || expected.includes(it.term)
    );
    return match?.id ?? null;
  }, [done, promptChips, turn, floatingItems]);

  const placeholder = useMemo(() => {
    if (promptChips[0]) return `Try: "${promptChips[0]}"`;
    return `Speak in ${langName}…`;
  }, [promptChips, langName]);

  useEffect(() => {
    if (!mod) return;
    const first = tutorTurns[0] ?? `Welcome. Let's practice ${langName}.`;
    setLines([{ role: "tutor", text: first }]);
    setTurn(0);
    setDone(false);
    setUtterance("");
    setTurnScores([]);
    setLastScore(null);
    speakTutor(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod, moduleId]);

  if (!course || !mod) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const stopListening = () => {
    asrRef.current?.stop();
    asrRef.current = null;
    setListening(false);
  };

  const startListening = () => {
    setAsrError(null);
    if (!asrSupported) {
      setAsrError("Live ASR isn't available here — type your reply.");
      return;
    }
    Speech.stop();
    const ctrl = createAsr(
      bcp47,
      (transcript, isFinal) => {
        setUtterance(transcript);
        if (isFinal && transcript.trim()) {
          stopListening();
          processResponse(transcript.trim());
          setUtterance("");
        }
      },
      (err) => {
        setAsrError(err);
        setListening(false);
      },
      () => setListening(false)
    );
    if (!ctrl) {
      setAsrError("Live ASR isn't available here — type your reply below.");
      return;
    }
    asrRef.current = ctrl;
    ctrl.start();
    setListening(true);
  };

  const send = () => {
    if (done) return;
    stopListening();
    const said = utterance.trim();
    setUtterance("");
    if (!said) return;
    processResponse(said);
  };

  const processResponse = (said: string) => {
    const result = checkAnswer(said, promptChips, 0.6);
    setLastScore(result);
    const newScores = [...turnScores, result.score];
    setTurnScores(newScores);
    const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length * 100);
    const nextTurn = turn + 1;
    const nextTutor = tutorTurns[nextTurn];
    const isDone = nextTurn >= totalTurns;
    const scoreLine: Line = {
      role: "system",
      text: result.matched
        ? `✅ Perfect! "${result.bestMatch}"`
        : `📝 Say: "${result.bestMatch}"`,
    };
    setLines((prev) => {
      const youLine: Line = { role: "you", text: said };
      if (isDone) {
        return [...prev, youLine, scoreLine, { role: "system", text: `--- Complete! Avg: ${avgScore}% (${newScores.filter(s => s >= 0.6).length}/${newScores.length})` }];
      }
      return [...prev, youLine, scoreLine, { role: "tutor", text: nextTutor }];
    });
    setTurn(nextTurn);
    if (isDone) {
      setDone(true);
    } else {
      speakTutor(nextTutor);
    }
  };

  const pickResponse = (choice: string) => {
    if (done) return;
    processResponse(choice);
  };

  const finish = async () => {
    stopListening();
    const transcript = { lines, moduleId, lessonId, mock: mockMode };
    await markComplete(lessonId);
    await saveArHistoryEntry({
      moduleId,
      moduleTitle: mod.title,
      lessonId,
      finishedAt: new Date().toISOString(),
      lines,
    });
    await postProgress(mockMode, apiBaseUrl, {
      studentId,
      lessonId,
      completed: true,
      score: 0.85,
    });
    await postArSession(mockMode, apiBaseUrl, {
      studentId,
      moduleId,
      transcript,
      performanceScore: 0.85,
    });
    navigation.goBack();
  };

  const turnLabel = totalTurns > 0
    ? `Turn ${Math.min(turn + 1, totalTurns)} / ${totalTurns}`
    : "Conversation";

  const handlePressIn = () => startListening();
  const handlePressOut = () => {
    if (listening) stopListening();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>AR challenge</Text>
      <Text style={styles.title}>{mod.title}</Text>
      <Text style={styles.sub}>{mod.arScenario?.summary ?? "Practice speaking with the tutor."}</Text>

      <View style={styles.cameraWrap}>
        <ARSurface
          hint={cameraHint}
          theme={mod?.theme}
          items={!done ? floatingItems : []}
          highlightId={highlightedItemId}
          onTap={(item) => {
            setUtterance(item.term);
            speakTutor(item.term);
          }}
        />
      </View>

      <View style={styles.turnBar}>
        <Text style={styles.section}>Conversation</Text>
        <View style={styles.turnBarRight}>
          {lines.length > 0 && (
            <TouchableOpacity
              style={styles.replayBtn}
              onPress={() => {
                const lastTutor = [...lines].reverse().find((l) => l.role === "tutor");
                if (lastTutor) speakTutor(lastTutor.text);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.replayBtnText}>🔊 Replay</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.turnPill, done && styles.turnPillDone]}>
            {done ? "Done" : turnLabel}
          </Text>
        </View>
      </View>

      <View style={styles.thread}>
        {lines.map((l, i) => {
          if (l.role === "system") {
            return (
              <Text key={i} style={styles.systemLine}>{l.text}</Text>
            );
          }
          return (
            <Text
              key={i}
              style={l.role === "tutor" ? styles.tutorLine : styles.youLine}
            >
              <Text style={styles.role}>{l.role === "tutor" ? "Tutor" : "You"}: </Text>
              {l.text}
            </Text>
          );
        })}
      </View>

      {lastScore ? (
        <View style={styles.scoreBar}>
          <View
            style={[
              styles.scoreFill,
              {
                width: `${lastScore.score * 100}%`,
                backgroundColor: lastScore.matched ? SUCCESS : DANGER,
              },
            ]}
          />
          <Text style={styles.scoreText}>
            {lastScore.matched ? "✓ Match!" : `Try again (${Math.round(lastScore.score * 100)}%)`}
          </Text>
        </View>
      ) : null}

      {!done && promptChips.length > 0 ? (
        <View style={styles.hintRow}>
          <Text style={styles.hint}>
            {asrSupported
              ? "Tap a suggestion below, or hold 🎤 to speak"
              : "Tap a suggestion below to reply"}
          </Text>
        </View>
      ) : null}

      {done && turnScores.length > 0 ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Session Summary</Text>
          <Text style={styles.summaryScore}>
            {Math.round(turnScores.reduce((a, b) => a + b, 0) / turnScores.length * 100)}%
          </Text>
          <Text style={styles.summaryDetail}>
            {turnScores.filter((s) => s >= 0.6).length}/{turnScores.length} correct
          </Text>
          <View style={styles.dotsRow}>
            {turnScores.map((s, i) => (
              <View key={i} style={styles.turnDot}>
                <View style={[styles.dot, { backgroundColor: s >= 0.6 ? SUCCESS : DANGER }]} />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {!done ? (
        <>
          <View style={styles.chips}>
            {promptChips.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.chipAction}
                onPress={() => pickResponse(p)}
                disabled={done}
                activeOpacity={0.85}
              >
                <Text style={styles.chipActionText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {asrSupported && (
            <View style={styles.micSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.micBtn,
                  listening && styles.micBtnActive,
                  pressed && styles.micBtnPressed,
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={done}
              >
                {({ pressed }) => (
                  <View style={styles.micBtnContent}>
                    <Text style={styles.micIcon}>{pressed ? "🔊" : "🎤"}</Text>
                    <Text style={styles.micLabel}>
                      {listening ? "Release to send" : "Hold to speak"}
                    </Text>
                  </View>
                )}
              </Pressable>
              {listening && (
                <Text style={styles.listeningText}>
                  {`Listening… speak in ${langName}`}
                </Text>
              )}
            </View>
          )}
        </>
      ) : null}

      {asrError ? <Text style={styles.errorText}>{asrError}</Text> : null}

      <TouchableOpacity
        style={[
          styles.finish,
          { borderColor: done ? "#94a3b8" : SUCCESS },
          done && styles.finishDisabled,
        ]}
        onPress={finish}
        disabled={done}
      >
        <Text style={[styles.finishText, done && styles.finishTextDisabled]}>
          {done ? "Completed ✓" : "Complete module"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  kicker: { color: "#6366f1", fontWeight: "700", fontSize: 12, letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginTop: 4 },
  sub: { marginTop: 8, color: "#64748b", lineHeight: 20 },
  cameraWrap: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 280,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#0f172a",
  },
  turnBar: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  turnBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  replayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  replayBtnText: { fontSize: 11, fontWeight: "700", color: "#4338ca" },
  section: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  turnPill: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  turnPillDone: {
    color: "#166534",
    backgroundColor: "#dcfce7",
  },
  hintRow: { marginBottom: 12 },
  hint: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  thread: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tutorLine: { marginBottom: 8, color: "#1e293b", lineHeight: 20 },
  youLine: { marginBottom: 8, color: "#334155", lineHeight: 20 },
  systemLine: {
    marginTop: 4,
    color: "#15803d",
    fontStyle: "italic",
    lineHeight: 20,
  },
  role: { fontWeight: "700", color: "#0f172a" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: PRIMARY,
  },
  chipActionText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  scoreBar: {
    marginTop: 8,
    height: 32,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  scoreFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  scoreText: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    lineHeight: 32,
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  micSection: { alignItems: "center", marginTop: 16, gap: 8 },
  micBtn: {
    width: 160,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnActive: { backgroundColor: SUCCESS },
  micBtnPressed: { backgroundColor: "#0d9488", transform: [{ scale: 0.96 }] },
  micBtnContent: { alignItems: "center" },
  micIcon: { fontSize: 24 },
  micLabel: { fontSize: 12, fontWeight: "600", color: "#fff", marginTop: 2 },
  listeningText: { color: SUCCESS, fontSize: 13, fontWeight: "600" },
  errorText: { marginTop: 6, color: "#b91c1c", fontSize: 12 },
  finish: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  finishDisabled: { borderColor: "#e2e8f0", opacity: 0.6 },
  finishText: { color: SUCCESS, fontSize: 16, fontWeight: "700" },
  finishTextDisabled: { color: "#94a3b8" },
  summaryCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SUCCESS,
    alignItems: "center",
  },
  summaryTitle: { fontSize: 14, fontWeight: "700", color: "#166534" },
  summaryScore: { fontSize: 36, fontWeight: "800", color: SUCCESS, marginVertical: 8 },
  summaryDetail: { fontSize: 13, color: "#15803d", marginBottom: 12 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  turnDot: {},
  dot: { width: 16, height: 16, borderRadius: 8 },
});
