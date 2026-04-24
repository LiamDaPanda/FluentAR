import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { CourseData, Lesson } from "@fluentar/shared";
import { fetchCourse } from "../api/course";
import { useAppConfig } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useLessonProgress } from "../context/LessonProgressContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "Module">;

const COLORS = {
  primary: "#2563eb",
  primaryMuted: "#93c5fd",
  softCard: "#eff6ff",
  text: "#111",
  textMuted: "#666",
  border: "#ddd",
  background: "#fff",
};

export default function ModuleScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: { params: { levelId: string; moduleId: string } };
}) {
  const { levelId, moduleId } = route.params;
  const { mockMode, apiBaseUrl } = useAppConfig();
  const { language } = useLanguage();
  const { isDone } = useLessonProgress();
  const [course, setCourse] = useState<CourseData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await fetchCourse(mockMode, apiBaseUrl, language ?? "en");
      if (!cancelled) setCourse(c);
    })();
    return () => { cancelled = true; };
  }, [mockMode, apiBaseUrl, language]);

  const mod = useMemo(() => {
    if (!course || !levelId || !moduleId) return null;
    try {
      const level = course.levels?.find((l) => l.id === levelId);
      return level?.modules?.find((m) => m.id === moduleId) ?? null;
    } catch {
      return null;
    }
  }, [course, levelId, moduleId]);

  const level = useMemo(() => {
    if (!course) return null;
    return course.levels.find((l) => l.id === levelId) ?? null;
  }, [course, levelId]);

  if (!course || !mod) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const moduleLessons = mod.lessons || [];
  const moduleComplete = moduleLessons.length > 0 && moduleLessons.every((l) => isDone(l.id));
  const arLesson = moduleLessons.find((l) => l.type === "ar_challenge");
  const arLessonId = arLesson?.id || `${mod.id}_ar`;
  const showArPracticeCard = Boolean(mod.arScenario) && !arLesson;

  const openLesson = (lesson: Lesson) => {
    if (lesson.type === "ar_challenge") {
      navigation.navigate("ARChallenge", { levelId, moduleId, lessonId: lesson.id });
    } else {
      navigation.navigate("Lesson", { levelId, moduleId, lessonId: lesson.id });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.header, { borderLeftColor: COLORS.primary }]}>
        <Text style={styles.moduleTheme}>{(mod.theme || "").toUpperCase()}</Text>
        <Text style={styles.moduleTitle}>{mod.title}</Text>
        {level && <Text style={styles.levelTitle}>{level.title}</Text>}
      </View>

      {mod.objective && (
        <View style={styles.objectiveCard}>
          <Text style={styles.objectiveTitle}>GOAL</Text>
          <Text style={styles.objectiveText}>{mod.objective}</Text>
        </View>
      )}

      <View style={styles.lessonsSection}>
        <Text style={styles.sectionTitle}>LESSONS</Text>
        
        {(mod.lessons || []).map((lesson, index) => {
          const done = isDone(lesson.id);
          const isFirst = index === 0;
          const lessonsArr = mod.lessons || [];
          const prevDone = index === 0 || isDone(lessonsArr[index - 1]?.id);
          const canAccess = isFirst || prevDone;

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonCard,
                done && styles.lessonDone,
                !canAccess && styles.lessonLocked,
              ]}
              onPress={() => canAccess && openLesson(lesson)}
              disabled={!canAccess}
              activeOpacity={0.7}
            >
              <View style={[styles.lessonNumber, done && styles.lessonNumberDone]}>
                {done ? <Text style={styles.checkmark}>✓</Text> : <Text style={styles.lessonNumberText}>{index + 1}</Text>}
              </View>
              <View style={styles.lessonContent}>
                <Text style={[styles.lessonTitle, done && styles.lessonTitleDone]}>{lesson.title}</Text>
                <View style={styles.lessonMeta}>
                  <Text style={styles.lessonTypeBadge}>
                    {lesson.type === "ar_challenge" ? "AR" : lesson.type}
                  </Text>
                  {lesson.estimatedMinutes && (
                    <Text style={styles.lessonTime}>{lesson.estimatedMinutes} min</Text>
                  )}
                </View>
                {lesson.description && (
                  <Text style={styles.lessonDesc}>{lesson.description}</Text>
                )}
              </View>
              {!done && !canAccess && <Text style={styles.lockIcon}>🔒</Text>}
              {done && <Text style={styles.doneLabel}>DONE</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {showArPracticeCard && (
        <View style={styles.arSection}>
          <Text style={styles.sectionTitle}>SPEAKING PRACTICE</Text>
          <View style={styles.arCard}>
            <Text style={styles.arTitle}>{mod.title} - Speaking Challenge</Text>
            <Text style={styles.arDesc}>{mod.arScenario.summary}</Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => navigation.navigate("ARChallenge", { levelId, moduleId, lessonId: arLessonId })}
            >
              <Text style={styles.startBtnText}>Start Practice</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>TIP</Text>
        <Text style={styles.tipText}>
          {moduleComplete 
            ? "Great work! You've completed this module."
            : "Complete lessons in order to unlock the next one."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: COLORS.background, padding: 14, borderLeftWidth: 3, marginBottom: 14 },
  moduleTheme: { fontSize: 11, color: COLORS.textMuted, fontWeight: "700", letterSpacing: 1 },
  moduleTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, marginTop: 4 },
  levelTitle: { fontSize: 11, color: "#999", marginTop: 4 },
  objectiveCard: { backgroundColor: COLORS.softCard, padding: 14, marginBottom: 14 },
  objectiveTitle: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, marginBottom: 4 },
  objectiveText: { fontSize: 13, color: "#333", lineHeight: 18 },
  lessonsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 1, marginBottom: 10 },
  lessonCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.background, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  lessonDone: { opacity: 0.5 },
  lessonLocked: { opacity: 0.4 },
  lessonNumber: { width: 26, height: 26, backgroundColor: COLORS.softCard, alignItems: "center", justifyContent: "center", marginRight: 10 },
  lessonNumberDone: { backgroundColor: "#dcfce7" },
  lessonNumberText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  checkmark: { fontSize: 12, fontWeight: "700", color: "#16a34a" },
  lessonContent: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  lessonTitleDone: { textDecorationLine: "line-through", color: "#999" },
  lessonMeta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  lessonTypeBadge: { fontSize: 10, color: COLORS.primary, fontWeight: "600", backgroundColor: COLORS.softCard, paddingHorizontal: 6, paddingVertical: 2 },
  lessonTime: { fontSize: 10, color: "#999", marginLeft: 6 },
  lessonDesc: { fontSize: 11, color: "#666", marginTop: 6, lineHeight: 16 },
  lockIcon: { fontSize: 12, marginLeft: 6 },
  doneLabel: { fontSize: 10, fontWeight: "700", color: "#16a34a", backgroundColor: "#dcfce7", paddingHorizontal: 6, paddingVertical: 2 },
  arSection: { marginBottom: 20 },
  arCard: { backgroundColor: COLORS.background, padding: 14, borderWidth: 2, borderColor: COLORS.primary, borderStyle: "dashed" },
  arTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  arDesc: { fontSize: 12, color: "#666", lineHeight: 18, marginBottom: 14 },
  startBtn: { paddingVertical: 12, backgroundColor: COLORS.primary, alignItems: "center" },
  startBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  tipCard: { backgroundColor: "#fefce8", padding: 12, borderWidth: 1, borderColor: "#eab308" },
  tipTitle: { fontSize: 11, fontWeight: "700", color: "#92400e", marginBottom: 4 },
  tipText: { fontSize: 12, color: "#78350f", lineHeight: 16 },
});