import React from "react";
import { StyleSheet, View, Text } from "react-native";
import type { FloatingItem } from "./FloatingObjects";

type Props = {
  items: FloatingItem[];
  highlightId?: string | null;
  onTap: (item: FloatingItem) => void;
};

export default function ViroFloatingScene({ items, highlightId, onTap }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AR not available</Text>
      <Text style={styles.subtext}>Use web or Expo Go for now</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
  subtext: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
});
