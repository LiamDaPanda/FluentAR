import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { CourseData, Flashcard, LessonQuiz } from "@fluentar/shared";
import { fetchCourse, postProgress } from "../api/course";
import { useAppConfig } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useLessonProgress } from "../context/LessonProgressContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "Lesson">;

const COLORS = {
  primary: "#6366f1",
  primaryLight: "#e0e7ff",
  success: "#10b981",
  successLight: "#d1fae5",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  dark: "#1e293b",
  gray: "#64748b",
  grayLight: "#f1f5f9",
  white: "#ffffff",
};

export default function LessonScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: { params: { levelId: string; moduleId: string; lessonId: string } };
}) {
  const { levelId, moduleId, lessonId } = route.params;
  const { mockMode, apiBaseUrl, studentId } = useAppConfig();
  const { language } = useLanguage();
  const { markComplete, isDone, addCardsForLesson } = useLessonProgress();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [step, setStep] = useState<"cards" | "quiz">("cards");
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [remainingCards, setRemainingCards] = useState<Flashcard[]>([]);

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

  const lesson = useMemo(() => {
    if (!course) return null;
    const level = course.levels?.find((l) => l.id === levelId);
    const mod = level?.modules?.find((m) => m.id === moduleId);
    return mod?.lessons?.find((x) => x.id === lessonId) ?? null;
  }, [course, levelId, moduleId, lessonId]);

  const quiz = lesson?.quiz;

  const allCards = useMemo(() => {
    if (lesson?.flashcards?.length) return lesson.flashcards;
    return [];
  }, [lesson]);

  useEffect(() => {
    setRemainingCards([...allCards]);
    setCardIdx(0);
    setFlipped(false);
    setStep("cards");
    setSelected(null);
    setShowResult(false);
  }, [lesson?.id]);

  useEffect(() => {
    Speech.stop();
  }, [cardIdx, lessonId]);

  if (!course || !lesson) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const speak = (text: string) => {
    if (!text) return;
    try {
      Speech.stop();
      Speech.speak(text, {
        language: course.bcp47 ?? course.language,
        rate: 0.9,
      });
    } catch {}
  };

  const handleKnow = async () => {
    if (remainingCards.length === 0) return;
    const newCount = remainingCards.length - 1;
    const wasLast = newCount === 0;
    setRemainingCards((prev) => prev.filter((_, i) => i !== cardIdx));
    setFlipped(false);
    if (newCount === 0) {
      await markComplete(lessonId);
      if (quiz) {
        setStep("quiz");
      } else {
        await postProgress(mockMode, apiBaseUrl, {
          studentId,
          lessonId,
          completed: true,
          score: 1,
        });
        navigation.goBack();
      }
    } else {
      setCardIdx((i) => Math.min(i, newCount - 1));
    }
  };

  const handleDontKnow = async () => {
    if (remainingCards.length === 0) return;
    const currentCard = remainingCards[cardIdx];
    const newCount = remainingCards.length - 1;
    if (currentCard) {
      await addCardsForLesson(lessonId, [{
        term: currentCard.term,
        translation: currentCard.translation || currentCard.hint || ""
      }]);
    }
    setRemainingCards((prev) => prev.filter((_, i) => i !== cardIdx));
    setFlipped(false);
    if (newCount === 0) {
      await markComplete(lessonId);
      if (quiz) {
        setStep("quiz");
      } else {
        await postProgress(mockMode, apiBaseUrl, {
          studentId,
          lessonId,
          completed: true,
          score: 1,
        });
        navigation.goBack();
      }
    } else {
      setCardIdx((i) => Math.min(i, newCount - 1));
    }
  };

  const onFinishQuiz = async () => {
    if (!quiz || selected === null) return;
    const correct = selected === quiz.answerIndex;
    setShowResult(true);
    if (correct) {
      await markComplete(lessonId);
      await postProgress(mockMode, apiBaseUrl, {
        studentId,
        lessonId,
        completed: true,
        score: 1,
      });
      navigation.goBack();
    }
  };

  const currentCard = remainingCards[cardIdx];
  const cards = remainingCards;
  const label = lesson.type === "vocabulary" ? "Flashcards" : "Patterns";

  if (step === "cards") {
    if (!currentCard) {
      return (
        <View style={styles.container}>
          <View style={styles.finishedState}>
            <Text style={styles.finishedTitle}>Lesson Complete!</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => {
                if (quiz) setStep("quiz");
                else navigation.goBack();
              }}
            >
              <Text style={styles.primaryBtnText}>
                {quiz ? "Continue to Quiz" : "Finish"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{label}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.progress}>
            Card {cardIdx + 1} of {cards.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.flashcard}
          onPress={() => setFlipped(!flipped)}
          activeOpacity={0.95}
        >
          <Text style={styles.cardLabel}>
            {flipped ? "Translation" : "Term"}
          </Text>
          {!flipped ? (
            <>
              <Text style={styles.cardTerm}>{currentCard.term}</Text>
              {currentCard.romanization && (
                <Text style={styles.cardRoman}>{currentCard.romanization}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.cardTerm, styles.cardTermBack]}>
                {currentCard.translation || currentCard.hint || ""}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.speakBtn}
          onPress={() => speak(currentCard.term)}
        >
          <Text style={styles.speakBtnText}>🔊 Tap to hear</Text>
        </TouchableOpacity>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnNo]}
            onPress={handleDontKnow}
          >
            <Text style={styles.actionBtnNoText}>✕</Text>
            <Text style={styles.actionBtnLabel}>Don't Know</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnYes]}
            onPress={handleKnow}
          >
            <Text style={styles.actionBtnYesText}>✓</Text>
            <Text style={styles.actionBtnLabel}>Know It</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => {
              setFlipped(false);
              setCardIdx((i) => (i - 1 + cards.length) % cards.length);
            }}
          >
            <Text style={styles.navBtnText}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => {
              setFlipped(false);
              setCardIdx((i) => (i + 1) % cards.length);
            }}
          >
            <Text style={styles.navBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: COLORS.primary }]}
          onPress={async () => {
            await markComplete(lessonId);
            await postProgress(mockMode, apiBaseUrl, {
              studentId,
              lessonId,
              completed: true,
              score: 1,
            });
            navigation.goBack();
          }}
        >
          <Text style={styles.primaryBtnText}>Mark Complete</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Quick Check</Text>
      <Text style={styles.quizQuestion}>{quiz.question}</Text>
      {(quiz.options || []).map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.optionBtn,
            selected === i && styles.optionBtnSel,
          ]}
          onPress={() => {
            setSelected(i);
            setShowResult(false);
          }}
        >
          <Text style={[
            styles.optionText,
            selected === i && styles.optionTextSel,
          ]}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {showResult ? (
        <Text style={styles.resultText}>
          {selected === quiz.answerIndex ? "✓ Correct!" : "✕ Try again"}
        </Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: COLORS.primary },
          selected === null && { opacity: 0.5 },
        ]}
        onPress={onFinishQuiz}
        disabled={selected === null}
      >
        <Text style={styles.primaryBtnText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  kicker: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.dark,
    marginTop: 4,
  },
  progress: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  flashcard: {
    flex: 1,
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 16,
  },
  cardTerm: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
  },
  cardTermBack: {
    color: COLORS.primary,
    fontSize: 28,
  },
  cardRoman: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 8,
    fontStyle: "italic",
  },
  speakBtn: {
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  speakBtnText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  actionBtns: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  actionBtnNo: {
    backgroundColor: COLORS.dangerLight,
    borderColor: COLORS.danger,
  },
  actionBtnYes: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  actionBtnNoText: {
    fontSize: 24,
    color: COLORS.danger,
    fontWeight: "700",
  },
  actionBtnYesText: {
    fontSize: 24,
    color: COLORS.success,
    fontWeight: "700",
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  navRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  navBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: "center",
  },
  navBtnText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "600",
  },
  finishedState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.success,
    marginBottom: 24,
  },
  primaryBtn: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  quizQuestion: {
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: "600",
    padding: 20,
    textAlign: "center",
  },
  optionBtn: {
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  optionBtnSel: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  optionTextSel: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 12,
    color: COLORS.success,
  },
});