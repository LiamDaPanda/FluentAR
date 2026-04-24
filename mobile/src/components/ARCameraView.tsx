import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  hint?: string;
};

export default function ARCameraView({ hint }: Props) {
  if (Platform.OS === "web") return <WebCamera hint={hint} />;
  return <NativeCamera hint={hint} />;
}

function NativeCamera({ hint }: Props) {
  const Camera = require("expo-camera");
  const { CameraView, useCameraPermissions } = Camera;
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={[styles.fill, styles.placeholder]}>
        <Text style={styles.placeholderText}>Loading camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fill, styles.placeholder]}>
        <Text style={styles.placeholderTitle}>Camera permission needed</Text>
        <Text style={styles.placeholderText}>
          FluentAR uses your camera so you can practice talking about what you see.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView style={styles.fill} facing="back" />
      <View style={styles.scrim} pointerEvents="none" />
      {hint ? (
        <View style={styles.hintBar} pointerEvents="none">
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

function WebCamera({ hint }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setGranted(true);
    } catch (e: any) {
      setError(e?.message || "Camera unavailable");
    }
  };

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (!granted) {
    return (
      <View style={[styles.fill, styles.placeholder]}>
        <Text style={styles.placeholderTitle}>Camera permission needed</Text>
        <Text style={styles.placeholderText}>
          FluentAR uses your camera so you can practice talking about what you see.
        </Text>
        {error ? <Text style={styles.placeholderError}>{error}</Text> : null}
        <TouchableOpacity style={styles.permBtn} onPress={start}>
          <Text style={styles.permBtnText}>Allow camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: "#000" }}
      />
      <View style={styles.scrim} pointerEvents="none" />
      {hint ? (
        <View style={styles.hintBar} pointerEvents="none">
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: "100%", height: "100%" },
  placeholder: {
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  placeholderTitle: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  placeholderText: { color: "#cbd5e1", fontSize: 12, textAlign: "center", lineHeight: 18 },
  placeholderError: { color: "#fca5a5", fontSize: 11, marginTop: 8 },
  permBtn: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.18)",
    zIndex: 1,
    elevation: 1,
  },
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
    elevation: 2,
  },
  hintText: { color: "#fff", fontSize: 13, fontWeight: "600", lineHeight: 18 },
});
