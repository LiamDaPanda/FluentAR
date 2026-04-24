import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { CourseData } from "@fluentar/shared";
import { fetchCourse } from "../api/course";
import { useAppConfig } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useLessonProgress } from "../context/LessonProgressContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "CourseMap">;

export default function CourseMapScreen({ navigation }: { navigation: Nav }) {
  const { mockMode, apiBaseUrl } = useAppConfig();
  const { language, t } = useLanguage();
  const { isDone, weeklyStats } = useLessonProgress();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  const PRIMARY = "#2563eb";

  const loadCourse = useCallback(async () => {
    setErr(null);
    try {
      const c = await fetchCourse(mockMode, apiBaseUrl, language ?? "en");
      setCourse(c);
    } catch (e) {
      setErr(String(e));
    }
  }, [mockMode, apiBaseUrl, language]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCourse();
    setRefreshing(false);
  }, [loadCourse]);

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const totalLessons = (course?.levels || []).reduce((acc, l) => acc + (l.modules || []).reduce((m, mod) => m + (mod.lessons || []).length, 0), 0);
  const completedLessons = (course?.levels || []).reduce((acc, l) => acc + (l.modules || []).reduce((m, mod) => m + (mod.lessons || []).filter((les) => isDone(les.id)).length, 0), 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const findNextLesson = () => {
    if (!course) return null;
    for (const level of course.levels || []) {
      for (const mod of level.modules || []) {
        for (const lesson of mod.lessons || []) {
          if (!isDone(lesson.id)) return { levelId: level.id, moduleId: mod.id, lessonId: lesson.id, title: lesson.title };
        }
      }
    }
    return null;
  };

  const next = findNextLesson();

  const handleContinue = () => {
    if (!next) return;
    const lessonType = course?.levels.find(l => l.id === next.levelId)?.modules.find(m => m.id === next.moduleId)?.lessons.find(l => l.id === next.lessonId)?.type;
    if (lessonType === "ar_challenge") {
      navigation.navigate("ARChallenge", { levelId: next.levelId, moduleId: next.moduleId, lessonId: next.lessonId });
    } else {
      navigation.navigate("Lesson", { levelId: next.levelId, moduleId: next.moduleId, lessonId: next.lessonId });
    }
  };

  if (err) return (<View style={styles.centered}><Text style={styles.errorTitle}>Error</Text><Text style={styles.errorText}>{err}</Text><TouchableOpacity style={styles.btn} onPress={loadCourse}><Text style={styles.btnText}>Retry</Text></TouchableOpacity></View>);
  if (!course) return (<View style={styles.centered}><ActivityIndicator size="large" color={PRIMARY} /><Text style={styles.loadingText}>Loading...</Text></View>);

  const renderModule = (levelId: string, mod: CourseData["levels"][0]["modules"][0], levelIndex: number) => {
    const lessons = mod.lessons || [];
    const total = lessons.length;
    const completed = lessons.filter((l) => isDone(l.id)).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = pct === 100;
    return (
      <View key={`${levelId}-${mod.id}`} style={styles.moduleCard}>
        <TouchableOpacity style={styles.moduleHeader} onPress={() => navigation.navigate("Module", { levelId, moduleId: mod.id })} activeOpacity={0.7}>
          <View style={styles.moduleIcon}><Text style={styles.moduleIconText}>{isComplete ? "✓" : levelIndex + 1}</Text></View>
          <View style={styles.moduleInfo}><Text style={styles.moduleTitle}>{mod.title}</Text><Text style={styles.moduleTheme}>{mod.theme}</Text></View>
          <View style={styles.moduleProgress}><Text style={[styles.progressPct, isComplete && styles.progressComplete]}>{pct}%</Text><Text style={styles.progressLabel}>{completed}/{total}</Text></View>
        </TouchableOpacity>
        <View style={styles.lessonsList}>
          {(mod.lessons || []).map((lesson) => {
            const done = isDone(lesson.id);
            return (
              <TouchableOpacity key={lesson.id} style={[styles.lessonRow, done && styles.lessonDone]} onPress={() => navigation.navigate(lesson.type === "ar_challenge" ? "ARChallenge" : "Lesson", { levelId, moduleId: mod.id, lessonId: lesson.id })} activeOpacity={0.7}>
                <View style={[styles.lessonDot, done && styles.lessonDotDone]} />
                <View style={styles.lessonInfo}><Text style={[styles.lessonTitle, done && styles.lessonTitleDone]}>{lesson.title}</Text><Text style={styles.lessonType}>{lesson.type === "ar_challenge" ? "AR" : lesson.type}</Text></View>
                <Text style={styles.lessonChev}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLevel = ({ item: level }: { item: CourseData["levels"][0] }) => {
    const levelIndex = (course.levels || []).findIndex((l) => l.id === level.id);
    const isExpanded = expandedLevels[level.id] !== false;
    const modules = level.modules || [];
    const total = modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    const completed = modules.reduce((acc, m) => acc + (m.lessons || []).filter((l) => isDone(l.id)).length, 0);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
      <View style={styles.levelCard}>
        <TouchableOpacity style={styles.levelHeader} onPress={() => toggleLevel(level.id)} activeOpacity={0.7}>
          <View style={styles.levelHeaderLeft}>
            <View style={[styles.levelBadge, { backgroundColor: PRIMARY }]}><Text style={styles.levelBadgeText}>{levelIndex + 1}</Text></View>
            <View style={styles.levelInfo}><Text style={styles.levelTitle}>{level.title}</Text><Text style={styles.levelMeta}>{completed}/{total} lessons</Text></View>
          </View>
          <View style={styles.levelHeaderRight}><Text style={[styles.levelProgress, pct === 100 && styles.levelComplete]}>{pct}%</Text><Text style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</Text></View>
        </TouchableOpacity>
        {isExpanded && (<View style={styles.levelContent}>{level.objective && <Text style={styles.levelObjective}>Goal: {level.objective}</Text>}{modules.map((mod) => renderModule(level.id, mod, levelIndex))}</View>)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}><Text style={styles.title}>{course.title}</Text><Text style={styles.langBadge}>{course.flag}</Text></View>
        <View style={styles.progressSection}><View style={styles.progressBarWrap}><View style={[styles.progressFill, { width: `${overallProgress}%` }]} /></View><View style={styles.progressMeta}><Text style={styles.progressLabel}>{overallProgress}% complete</Text><Text style={styles.progressLabel}>{completedLessons}/{totalLessons} lessons</Text></View></View>
        {next ? (<TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}><Text style={styles.continueBtnText}>Continue: {next.title}</Text><Text style={styles.continueBtnArrow}>→</Text></TouchableOpacity>) : (<View style={styles.allDoneBanner}><Text style={styles.allDoneText}>All caught up!</Text></View>)}
        <View style={styles.statsRow}><View style={styles.statItem}><Text style={styles.statValue}>{weeklyStats.daysActiveThisWeek}</Text><Text style={styles.statLabel}>Active days</Text></View><View style={styles.statDivider} /><View style={styles.statItem}><Text style={styles.statValue}>{weeklyStats.lessonsThisWeek}</Text><Text style={styles.statLabel}>This week</Text></View></View>
      </View>
      <FlatList data={course.levels} keyExtractor={(item) => item.id} renderItem={renderLevel} contentContainerStyle={[styles.list, styles.centeredContent]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />} showsVerticalScrollIndicator={false} ListFooterComponent={<View style={styles.footer}><TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate("Flashcards")}><Text style={styles.footerBtnText}>Flashcards</Text></TouchableOpacity><TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate("Journey")}><Text style={styles.footerBtnText}>{t("myJourney")}</Text></TouchableOpacity><TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate("Settings")}><Text style={styles.footerBtnText}>{t("settings")}</Text></TouchableOpacity></View>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header: { padding: 16, paddingTop: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e5e5", maxWidth: 600, alignSelf: "center", width: "100%" },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#111", flex: 1 },
  langBadge: { fontSize: 20, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#f5f5f5" },
  progressSection: { marginBottom: 12 },
  progressBarWrap: { height: 8, backgroundColor: "#e5e5e5", borderRadius: 4, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", backgroundColor: "#2563eb", borderRadius: 4 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11, color: "#888" },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#2563eb", padding: 14, borderRadius: 10, marginBottom: 12 },
  continueBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", flex: 1 },
  continueBtnArrow: { color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  allDoneBanner: { backgroundColor: "#ecfdf5", padding: 14, borderRadius: 10, marginBottom: 12, alignItems: "center" },
  allDoneText: { color: "#10b981", fontSize: 14, fontWeight: "700" },
  statsRow: { flexDirection: "row", backgroundColor: "#f9f9f9", borderRadius: 10, padding: 12 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: "#2563eb" },
  statLabel: { fontSize: 10, color: "#888", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#e5e5e5" },
  list: { padding: 12, paddingBottom: 100 },
  centeredContent: { maxWidth: 600, alignSelf: "center", width: "100%" },
  levelCard: { backgroundColor: "#fff", marginBottom: 10, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  levelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  levelHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  levelBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  levelBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  levelInfo: { marginLeft: 10, flex: 1 },
  levelTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
  levelMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  levelHeaderRight: { flexDirection: "row", alignItems: "center" },
  levelProgress: { fontSize: 14, fontWeight: "700", color: "#888", marginRight: 8 },
  levelComplete: { color: "#10b981" },
  expandIcon: { fontSize: 10, color: "#ccc" },
  levelContent: { padding: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  levelObjective: { fontSize: 12, color: "#555", marginBottom: 10, fontStyle: "italic" },
  moduleCard: { backgroundColor: "#f8f8f8", marginBottom: 8, borderRadius: 8, overflow: "hidden" },
  moduleHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  moduleIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  moduleIconText: { fontSize: 11, fontWeight: "700", color: "#555" },
  moduleInfo: { marginLeft: 10, flex: 1 },
  moduleTitle: { fontSize: 13, fontWeight: "600", color: "#222" },
  moduleTheme: { fontSize: 10, color: "#888", marginTop: 2, textTransform: "uppercase" },
  moduleProgress: { alignItems: "flex-end" },
  progressPct: { fontSize: 12, fontWeight: "700", color: "#888" },
  progressComplete: { color: "#10b981" },
  moduleProgressLabel: { fontSize: 9, color: "#aaa", marginTop: 2 },
  lessonsList: { paddingHorizontal: 10, paddingBottom: 8 },
  lessonRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8, marginBottom: 4, backgroundColor: "#fff", borderRadius: 8 },
  lessonDone: { opacity: 0.5 },
  lessonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ccc", marginRight: 10 },
  lessonDotDone: { backgroundColor: "#10b981" },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 12, fontWeight: "500", color: "#333" },
  lessonTitleDone: { textDecorationLine: "line-through", color: "#aaa" },
  lessonType: { fontSize: 9, color: "#888", marginTop: 2 },
  lessonChev: { fontSize: 14, color: "#ccc" },
  footer: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 30, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e5e5", position: "absolute", bottom: 0, left: 0, right: 0 },
  footerBtn: { flex: 1, padding: 14, alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 10 },
  footerBtnText: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  loadingText: { marginTop: 10, fontSize: 12, color: "#666" },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#d00", marginBottom: 8 },
  errorText: { color: "#666", marginBottom: 16 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#2563eb" },
  btnText: { color: "#fff", fontWeight: "600" },
});