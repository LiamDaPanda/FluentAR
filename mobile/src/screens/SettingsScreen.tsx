import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppConfig } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useLessonProgress } from "../context/LessonProgressContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "Settings">;

const KEYS_TO_BACKUP = [
  "fluentar_completed_lessons",
  "fluentar_activity_log",
  "fluentar_srs_cards",
];

export default function SettingsScreen({ navigation }: { navigation: Nav }) {
  const { mockMode, setMockMode, apiBaseUrl, setApiBaseUrl } = useAppConfig();
  const { language, catalog, immersive, setImmersive, starterLanguage, setStarterLanguage, t } = useLanguage();
  const { weeklyStats, refresh, resetSRS, srsCards } = useLessonProgress();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentLang = catalog.find((l) => l.code === language);

  const handleResetProgress = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    await AsyncStorage.setItem("fluentar_completed_lessons", "[]");
    await AsyncStorage.setItem("fluentar_activity_log", "[]");
    await resetSRS();
    await refresh();
    setShowResetConfirm(false);
    Alert.alert("Done", "All progress has been reset.");
  };

  const handleExport = async () => {
    const data: Record<string, string> = {};
    for (const key of KEYS_TO_BACKUP) {
      const val = await AsyncStorage.getItem(key);
      if (val) data[key] = val;
    }
    const json = JSON.stringify(data, null, 2);
    await Share.share({ message: json, title: "FluentAR Backup" });
  };

  const handleImport = () => {
    Alert.alert(
      "Import Backup",
      "To import, paste your backup JSON into the text field in Settings → paste your backup data.",
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("LanguageHub")}
        activeOpacity={0.7}
      >
        <Text style={styles.cardLabel}>Current Language</Text>
        <Text style={styles.cardValue}>{currentLang?.nativeName}</Text>
        <Text style={styles.cardLink}>Change →</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          const codes = ["en", "es", "fr", "ja", "ko", "pl"];
          const currentIdx = codes.indexOf(starterLanguage);
          const nextIdx = (currentIdx + 1) % codes.length;
          setStarterLanguage(codes[nextIdx] as any);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.cardLabel}>Translation Language</Text>
        <Text style={styles.cardValue}>{catalog.find(c => c.code === starterLanguage)?.nativeName || "English"}</Text>
        <Text style={styles.cardLink}>Tap to change →</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YOUR STATS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{weeklyStats.daysActiveThisWeek}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{weeklyStats.lessonsThisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA STORAGE</Text>
        <TouchableOpacity
          style={[styles.card, styles.cardToggle]}
          onPress={() => setMockMode(!mockMode)}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>On-device only</Text>
              <Text style={styles.rowDesc}>Store all progress locally on this device</Text>
            </View>
            <View style={[styles.toggle, mockMode && styles.toggleOn]}>
              <Text style={[styles.toggleText, mockMode && styles.toggleTextOn]}>{mockMode ? "ON" : "OFF"}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {!mockMode && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Backend URL</Text>
            <TextInput
              style={styles.input}
              value={apiBaseUrl}
              onChangeText={setApiBaseUrl}
              placeholder="http://localhost:4000"
              autoCapitalize="none"
            />
          </View>
        )}

<Text style={styles.helpText}>
          Enable cloud sync to store progress on your own backend server (optional).
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IMMERSIVE MODE</Text>
        <TouchableOpacity
          style={[styles.card, styles.cardToggle]}
          onPress={() => setImmersive(!immersive)}
        >
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Immersive Mode</Text>
              <Text style={styles.rowDesc}>
                All app text appears in {currentLang?.nativeName}. Guide you in your target language.
              </Text>
            </View>
            <View style={[styles.toggle, immersive && styles.toggleOn]}>
              <Text style={[styles.toggleText, immersive && styles.toggleTextOn]}>{immersive ? "ON" : "OFF"}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <TouchableOpacity style={styles.btn} onPress={handleExport}>
          <Text style={styles.btnText}>Export Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleImport}>
          <Text style={styles.btnText}>Import Progress</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RESET</Text>
        <TouchableOpacity
          style={[styles.btn, styles.btnDanger]}
          onPress={handleResetProgress}
        >
          <Text style={[styles.btnText, styles.btnDangerText]}>
            {showResetConfirm ? "Confirm Reset" : "Reset All Progress"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <Text style={styles.aboutTitle}>FluentAR</Text>
          <Text style={styles.aboutVersion}>Version 1.1.0</Text>
          <Text style={styles.aboutDesc}>
            Immersion-first language course. Learn vocabulary, grammar, and practice with AR speaking challenges.
          </Text>
          <Text style={styles.aboutDesc}>
            All features are free and open.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 10, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  cardLabel: { fontSize: 11, color: "#666", fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: "700", color: "#111" },
  cardLink: { fontSize: 13, color: "#2563eb", fontWeight: "600", marginTop: 4 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#666", letterSpacing: 1, marginBottom: 10 },
  statsGrid: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, backgroundColor: "#fff", padding: 16, alignItems: "center", borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: "800", color: "#2563eb" },
  statLabel: { fontSize: 11, color: "#666", marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: "600", color: "#111" },
  rowDesc: { fontSize: 11, color: "#666", marginTop: 2 },
  toggle: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#eee", borderRadius: 6 },
  toggleText: { fontSize: 12, fontWeight: "700", color: "#333" },
  toggleTextOn: { color: "#fff" },
  input: { fontSize: 14, color: "#111", borderWidth: 1, borderColor: "#e2e8f0", padding: 10, marginTop: 8, borderRadius: 8, backgroundColor: "#f9f9f9" },
  cardToggle: {},
  toggleOn: { backgroundColor: "#2563eb" },
  helpText: { fontSize: 11, color: "#999", marginTop: 8, lineHeight: 16 },
 aboutTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  aboutVersion: { fontSize: 12, color: "#666", marginTop: 2 },
  aboutDesc: { fontSize: 12, color: "#666", marginTop: 10, lineHeight: 18 },
  btn: { backgroundColor: "#2563eb", padding: 14, alignItems: "center", marginBottom: 8, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnDanger: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#ef4444", borderRadius: 10 },
  btnDangerText: { color: "#ef4444" },
});
