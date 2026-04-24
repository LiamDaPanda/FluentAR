import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { CourseData } from "@fluentar/shared";
import { fetchCourse } from "../api/course";
import { useAppConfig } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useLessonProgress, type SRSCard } from "../context/LessonProgressContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "Flashcards">;

const COLORS = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#e0e7ff",
  success: "#10b981",
  successLight: "#d1fae5",
  successBg: "#ecfdf5",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  dangerBg: "#fef2f2",
  dark: "#0f172a",
  darkMid: "#334155",
  gray: "#64748b",
  grayLight: "#f1f5f9",
  white: "#ffffff",
  cardBg: "#ffffff",
  border: "#e2e8f0",
};

export default function FlashcardsScreen({ navigation }: { navigation: Nav }) {
  const { mockMode, apiBaseUrl } = useAppConfig();
  const { language } = useLanguage();
  const { srsCards, addCardsForLesson, getDueCards, reviewCard } = useLessonProgress();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [mode, setMode] = useState<"review" | "browse">("review");
  const [showAnswer, setShowAnswer] = useState(false);

  const dueCards = getDueCards();
  const reviewCardData = dueCards.length > 0 ? dueCards[0] : null;

  useEffect(() => {
    (async () => {
      const c = await fetchCourse(mockMode, apiBaseUrl, language ?? "en");
      setCourse(c);
    })();
  }, [mockMode, apiBaseUrl, language]);

  const speak = (text: string) => {
    if (!text) return;
    try {
      Speech.stop();
      Speech.speak(text, {
        language: course?.bcp47 ?? course?.language ?? "en-US",
        rate: 0.9,
      });
    } catch {}
  };

  const handleAction = (know: boolean) => {
    if (!reviewCardData) return;
    reviewCard(reviewCardData.id, know ? 4 : 0);
    setShowAnswer(false);
  };

  const addAllCards = async () => {
    if (!course) return;
    for (const level of course.levels) {
      for (const mod of level.modules) {
        for (const lesson of mod.lessons) {
          if (lesson.flashcards?.length) {
            await addCardsForLesson(
              lesson.id,
              lesson.flashcards.map((f) => ({
                term: f.term,
                translation: f.translation || f.hint || "",
              }))
            );
          }
        }
      }
    }
  };

  const cardsByState = useMemo(() => {
    const byState = { new: 0, learning: 0, review: 0 };
    for (const card of srsCards) {
      if (card.state === "new") byState.new++;
      else if (card.state === "learning") byState.learning++;
      else byState.review++;
    }
    return byState;
  }, [srsCards]);

  const renderBrowseItem = ({ item }: { item: SRSCard }) => (
    <View style={styles.browseCard}>
      <Text style={styles.browseTerm}>{item.term}</Text>
      <Text style={styles.browseTrans}>{item.translation}</Text>
    </View>
  );

  if (!course) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === "review" && styles.tabActive]}
            onPress={() => setMode("review")}
          >
            <Text style={[styles.tabText, mode === "review" && styles.tabTextActive]}>
              Review
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === "browse" && styles.tabActive]}
            onPress={() => setMode("browse")}
          >
            <Text style={[styles.tabText, mode === "browse" && styles.tabTextActive]}>
              All ({srsCards.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: COLORS.primaryLight }]}>
            <Text style={[styles.statNum, { color: COLORS.primaryDark }]}>{cardsByState.new}</Text>
            <Text style={[styles.statLabel, { color: COLORS.primaryDark }]}>New</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: COLORS.dangerLight }]}>
            <Text style={[styles.statNum, { color: COLORS.danger }]}>{cardsByState.learning}</Text>
            <Text style={[styles.statLabel, { color: COLORS.danger }]}>Learning</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: COLORS.successLight }]}>
            <Text style={[styles.statNum, { color: COLORS.success }]}>{cardsByState.review}</Text>
            <Text style={[styles.statLabel, { color: COLORS.success }]}>Review</Text>
          </View>
        </View>
      </View>

      {mode === "review" ? (
        dueCards.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyEmoji}>🎉</Text>
            </View>
            <Text style={styles.emptyTitle}>All done!</Text>
            <Text style={styles.emptySub}>No cards to review right now.</Text>
            {srsCards.length === 0 && (
              <TouchableOpacity style={styles.emptyBtn} onPress={addAllCards}>
                <Text style={styles.emptyBtnText}>Add course cards</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.review}>
            <Text style={styles.reviewCount}>{dueCards.length} remaining</Text>

            <TouchableOpacity
              style={styles.card}
              onPress={() => setShowAnswer(!showAnswer)}
              activeOpacity={0.95}
            >
              {!showAnswer ? (
                <View style={styles.cardFront}>
                  <Text style={styles.cardTerm}>{reviewCardData?.term}</Text>
                  <Text style={styles.cardHint}>Tap to see answer</Text>
                </View>
              ) : (
                <View style={styles.cardBack}>
                  <Text style={styles.cardTermBack}>{reviewCardData?.term}</Text>
                  <View style={styles.cardDivide} />
                  <Text style={styles.cardTrans}>{reviewCardData?.translation}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.btns}>
              <TouchableOpacity
                style={[styles.btn, styles.btnNo]}
                onPress={() => handleAction(false)}
              >
                <Text style={styles.btnNoIcon}>✕</Text>
                <Text style={styles.btnNoText}>Don't know</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnYes]}
                onPress={() => handleAction(true)}
              >
                <Text style={styles.btnYesIcon}>✓</Text>
                <Text style={styles.btnYesText}>Know it</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      ) : (
        <FlatList
          data={srsCards}
          keyExtractor={(item) => item.id}
          renderItem={renderBrowseItem}
          contentContainerStyle={styles.browseList}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptySub}>No flashcards yet.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={addAllCards}>
                <Text style={styles.emptyBtnText}>Add course cards</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayLight },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.grayLight },
  header: { padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", backgroundColor: COLORS.grayLight, borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: "700", color: COLORS.gray },
  tabTextActive: { color: COLORS.white },
  statsRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.successLight, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: COLORS.dark, marginBottom: 4 },
  emptySub: { fontSize: 14, color: COLORS.gray },
  emptyBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: COLORS.primary, borderRadius: 10 },
  emptyBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
  review: { flex: 1, padding: 16 },
  reviewCount: { fontSize: 13, color: COLORS.gray, fontWeight: "600", textAlign: "center", marginBottom: 16 },
  card: { flex: 1, maxHeight: 280, marginBottom: 16 },
  cardFront: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardBack: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 16, padding: 24, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardTerm: { fontSize: 36, fontWeight: "800", color: COLORS.dark, textAlign: "center" },
  cardTermBack: { fontSize: 20, fontWeight: "700", color: COLORS.white, textAlign: "center", opacity: 0.9 },
  cardDivide: { height: 1, width: "60%", backgroundColor: COLORS.white, opacity: 0.4, marginVertical: 12 },
  cardTrans: { fontSize: 28, fontWeight: "700", color: COLORS.white, textAlign: "center" },
  cardHint: { fontSize: 13, color: COLORS.primary, marginTop: 16, fontWeight: "600" },
  btns: { flexDirection: "row", gap: 12, paddingBottom: 16 },
  btn: { flex: 1, paddingVertical: 18, alignItems: "center", borderRadius: 12, borderWidth: 0 },
  btnNo: { backgroundColor: COLORS.dangerBg, borderColor: COLORS.danger },
  btnYes: { backgroundColor: COLORS.successBg, borderColor: COLORS.success },
  btnNoIcon: { fontSize: 28, color: COLORS.danger, fontWeight: "700" },
  btnNoText: { fontSize: 13, color: COLORS.danger, fontWeight: "700", marginTop: 4 },
  btnYesIcon: { fontSize: 28, color: COLORS.success, fontWeight: "700" },
  btnYesText: { fontSize: 13, color: COLORS.success, fontWeight: "700", marginTop: 4 },
  browseList: { padding: 16 },
  browseCard: { backgroundColor: COLORS.white, padding: 14, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  browseTerm: { fontSize: 16, fontWeight: "700", color: COLORS.dark },
  browseTrans: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
});