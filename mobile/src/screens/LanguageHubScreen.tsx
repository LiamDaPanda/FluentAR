import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "LanguageHub">;

const FLAG_MAP: Record<string, string> = {
  en: "🇺🇸",
  ko: "🇰🇷",
  ja: "🇯🇵",
  fr: "🇫🇷",
  es: "🇪🇸",
  pl: "🇵🇱",
};

export default function LanguageHubScreen({ navigation }: { navigation: Nav }) {
  const { catalog, language, setLanguage } = useLanguage();

  const choose = async (code: typeof catalog[number]["code"]) => {
    await setLanguage(code);
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>
          Each course is a complete learning path
        </Text>
      </View>

      <FlatList
        data={catalog}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const active = language === item.code;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                active && styles.cardActive,
              ]}
              onPress={() => choose(item.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{FLAG_MAP[item.code] || "🌐"}</Text>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                  {item.nativeName}
                </Text>
                <Text style={styles.cardSubtitle}>{item.title}</Text>
              </View>
              {active && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Change language anytime in Settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 50 },
  header: { padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  title: { fontSize: 24, fontWeight: "800", color: "#111" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4 },
  list: { padding: 16 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, marginBottom: 8, borderWidth: 1, borderColor: "#ddd" },
  cardActive: { borderColor: "#2563eb", borderWidth: 2 },
  flag: { fontSize: 32, marginRight: 14 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  cardTitleActive: { color: "#2563eb" },
  cardSubtitle: { fontSize: 12, color: "#666", marginTop: 2 },
  checkBadge: { width: 24, height: 24, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  checkText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  footer: { padding: 20, alignItems: "center" },
  footerText: { fontSize: 11, color: "#999" },
});