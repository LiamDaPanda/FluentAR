import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { CourseData } from "@fluentar/shared";
import { fetchCourse } from "../api/course";
import { useAppConfig } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useLessonProgress } from "../context/LessonProgressContext";
import {
  clearArHistory,
  listArHistory,
  type ArHistoryEntry,
} from "../lib/arHistory";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "Journey">;

const COLORS = {
  primary: "#2563eb",
  primaryMuted: "#93c5fd",
  softCard: "#eff6ff",
  white: "#ffffff",
  border: "#e2e8f0",
  success: "#10b981",
  successLight: "#ecfdf5",
  danger: "#ef4444",
  dangerLight: "#fef2f2",
};

export default function JourneyScreen({ navigation: _navigation }: { navigation: Nav }) {
  const { mockMode, apiBaseUrl } = useAppConfig();
  const { language } = useLanguage();
  const { done, weeklyStats } = useLessonProgress();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [history, setHistory] = useState<ArHistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [c, h] = await Promise.all([
      fetchCourse(mockMode, apiBaseUrl, language ?? "en"),
      listArHistory(),
    ]);
    setCourse(c);
    setHistory(h);
  }, [mockMode, apiBaseUrl, language]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const completedLessons = useMemo(() => {
    if (!course || !course.levels) return [];
    const out: { id: string; title: string; module: string }[] = [];
    try {
      for (const level of course.levels || []) {
        for (const mod of level.modules || []) {
          for (const lesson of mod.lessons || []) {
            if (done.has(lesson.id)) {
              out.push({ id: lesson.id, title: lesson.title || lesson.id, module: mod.title || mod.id });
            }
          }
        }
      }
    } catch {}
    return out;
  }, [course, done]);

  const totalLessons = useMemo(() => {
    if (!course || !course.levels) return 0;
    try {
      return course.levels.reduce(
        (acc, l) => acc + (l.modules || []).reduce((m, mod) => m + (mod.lessons || []).length, 0),
        0
      );
    } catch {
      return 0;
    }
  }, [course]);

  if (!course) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const pct = totalLessons === 0
    ? 0
    : Math.round((completedLessons.length / totalLessons) * 100);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <Text style={styles.title}>My Journey</Text>
      <Text style={styles.subtitle}>
        Your personal learning log
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{pct}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
          <Text style={styles.statSub}>{completedLessons.length}/{totalLessons}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{weeklyStats.daysActiveThisWeek}</Text>
          <Text style={styles.statLabel}>Active Days</Text>
          <Text style={styles.statSub}>this week</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>AR Sessions</Text>
          <Text style={styles.statSub}>saved</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>AR CONVERSATIONS</Text>
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Complete AR challenges to see your conversations here.
          </Text>
        </View>
      ) : (
        history.map((h) => {
          const open = expanded === h.id;
          const turns = h.lines.filter((l) => l.role !== "system");
          return (
            <TouchableOpacity
              key={h.id}
              style={styles.histCard}
              activeOpacity={0.7}
              onPress={() => setExpanded(open ? null : h.id)}
            >
              <View style={styles.histHeader}>
                <Text style={styles.histTitle}>{h.moduleTitle}</Text>
                <Text style={styles.histTurns}>{turns.length} turns</Text>
              </View>
              <Text style={styles.histDate}>
                {new Date(h.finishedAt).toLocaleDateString()}
              </Text>
              {open ? (
                <View style={styles.thread}>
                  {h.lines.map((l, i) => {
                    if (l.role === "system") {
                      return (
                        <Text key={i} style={styles.systemLine}>{l.text}</Text>
                      );
                    }
                    return (
                      <Text key={i} style={l.role === "tutor" ? styles.tutorLine : styles.youLine}>
                        <Text style={styles.role}>{l.role === "tutor" ? "Tutor" : "You"}: </Text>
                        {l.text}
                      </Text>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.expandHint}>Tap to read</Text>
              )}
            </TouchableOpacity>
          );
        })
      )}

      <Text style={styles.sectionTitle}>COMPLETED LESSONS</Text>
      {completedLessons.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Finish lessons to track your progress.
          </Text>
        </View>
      ) : (
        completedLessons.map((l) => (
          <View key={l.id} style={styles.lessonRow}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonRowTitle}>{l.title}</Text>
              <Text style={styles.lessonRowMeta}>{l.module}</Text>
            </View>
          </View>
        ))
      )}

      {history.length > 0 ? (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={async () => {
            await clearArHistory();
            setHistory([]);
            setExpanded(null);
          }}
        >
          <Text style={styles.clearBtnText}>Clear AR History</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#111" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  stat: { flex: 1, padding: 16, backgroundColor: COLORS.white, alignItems: "center", borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: "800", color: COLORS.primary },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#666", marginTop: 4 },
  statSub: { fontSize: 10, color: "#999", marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#666", letterSpacing: 1, marginBottom: 10, marginTop: 10 },
  empty: { padding: 20, backgroundColor: COLORS.white, borderRadius: 12, alignItems: "center" },
  emptyText: { color: "#666", fontSize: 13, textAlign: "center" },
  histCard: { backgroundColor: COLORS.white, padding: 14, marginBottom: 10, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  histHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  histTitle: { fontSize: 14, fontWeight: "600", color: "#111" },
  histTurns: { fontSize: 10, fontWeight: "700", color: COLORS.primary, backgroundColor: COLORS.softCard, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  histDate: { fontSize: 11, color: "#666", marginTop: 6 },
  expandHint: { fontSize: 11, color: COLORS.primary, marginTop: 8, fontWeight: "600" },
  thread: { marginTop: 12, padding: 12, backgroundColor: "#f8f8f8", borderRadius: 8 },
  tutorLine: { marginBottom: 8, color: "#222", fontSize: 13 },
  youLine: { marginBottom: 8, color: "#333", fontSize: 13 },
  systemLine: { marginTop: 6, color: COLORS.success, fontSize: 12, fontStyle: "italic" },
  role: { fontWeight: "700", color: "#111" },
  lessonRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, backgroundColor: COLORS.white, paddingHorizontal: 12, marginBottom: 6, borderRadius: 10 },
  dot: { width: 8, height: 8, backgroundColor: COLORS.success, borderRadius: 4, marginRight: 12 },
  lessonRowTitle: { fontSize: 13, fontWeight: "600", color: "#111" },
  lessonRowMeta: { fontSize: 11, color: "#666", marginTop: 2 },
  clearBtn: { marginTop: 20, padding: 14, alignItems: "center", borderWidth: 1, borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight, borderRadius: 10 },
  clearBtnText: { color: COLORS.danger, fontSize: 13, fontWeight: "600" },
});