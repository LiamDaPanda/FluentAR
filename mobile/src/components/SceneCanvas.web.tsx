import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { View, Text, StyleSheet } from "react-native";
import CafeScene from "./scenes/CafeScene";
import ClassroomScene from "./scenes/ClassroomScene";
import MarketScene from "./scenes/MarketScene";

type SceneKind = "cafe" | "classroom" | "market";

function pickScene(theme: string | undefined): SceneKind {
  const t = (theme ?? "").toLowerCase();
  if (t.includes("foundation") || t.includes("alphabet") || t.includes("grammar")) return "classroom";
  if (
    t.includes("shopping") ||
    t.includes("finance") ||
    t.includes("travel") ||
    t.includes("vocabulary") ||
    t.includes("objects") ||
    t.includes("action") ||
    t.includes("verb") ||
    t.includes("food")
  )
    return "market";
  return "cafe";
}

const CAMERA: Record<SceneKind, { position: [number, number, number]; target: [number, number, number]; fov: number }> = {
  cafe: { position: [0, 1.55, 3.6], target: [0, 1.4, 0], fov: 42 },
  classroom: { position: [0, 1.7, 3.4], target: [0, 1.55, -0.5], fov: 44 },
  market: { position: [0, 1.6, 3.6], target: [0, 1.4, 0], fov: 42 },
};

type Props = {
  theme?: string;
  hint?: string;
};

export default function SceneCanvas({ theme, hint }: Props) {
  const kind = pickScene(theme);
  const cam = CAMERA[kind];
  return (
    <View style={styles.fill}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: cam.position, fov: cam.fov, near: 0.1, far: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", display: "block" } as any}
      >
        <color attach="background" args={[kind === "classroom" ? "#fff7ed" : kind === "market" ? "#fde68a" : "#1c1410"]} />
        <fog attach="fog" args={[kind === "classroom" ? "#fff7ed" : kind === "market" ? "#fde68a" : "#1c1410", 6, 18]} />
        <Suspense fallback={null}>
          {kind === "cafe" && <CafeScene />}
          {kind === "classroom" && <ClassroomScene />}
          {kind === "market" && <MarketScene />}
        </Suspense>
      </Canvas>
      {hint ? (
        <View style={styles.hintBar} pointerEvents="none">
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: "100%", height: "100%", position: "relative" },
  hintBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(15,23,42,0.85)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    zIndex: 2,
  },
  hintText: { color: "#fff", fontSize: 13, fontWeight: "600", lineHeight: 18 },
});
