import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

export type FloatingItem = {
  id: string;
  term: string;
  translation?: string;
};

type Props = {
  items: FloatingItem[];
  onTap: (item: FloatingItem) => void;
  highlightId?: string | null;
};

const SLOTS: { left: string; top: string }[] = [
  { left: "8%", top: "12%" },
  { left: "58%", top: "8%" },
  { left: "30%", top: "42%" },
  { left: "70%", top: "48%" },
  { left: "10%", top: "70%" },
  { left: "55%", top: "75%" },
];

export default function FloatingObjects({ items, onTap, highlightId }: Props) {
  if (!items || items.length === 0) return null;
  const limited = items.slice(0, SLOTS.length);
  return (
    <View style={styles.layer} pointerEvents="box-none">
      {limited.map((item, i) => (
        <FloatingBubble
          key={item.id}
          item={item}
          slot={SLOTS[i]}
          delay={i * 220}
          highlighted={item.id === highlightId}
          onTap={onTap}
        />
      ))}
    </View>
  );
}

function FloatingBubble({
  item,
  slot,
  delay,
  highlighted,
  onTap,
}: {
  item: FloatingItem;
  slot: { left: string; top: string };
  delay: number;
  highlighted: boolean;
  onTap: (item: FloatingItem) => void;
}) {
  const float = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const period = 2200 + Math.floor(Math.random() * 900);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: period,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: period,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, float]);

  useEffect(() => {
    if (!highlighted) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [highlighted, pulse]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.65] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  return (
    <Animated.View
      style={[
        styles.bubbleWrap,
        slot as any,
        { transform: [{ translateY }, { scale: press }] },
      ]}
    >
      {highlighted ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />
      ) : null}
      <Pressable
        onPressIn={() =>
          Animated.spring(press, {
            toValue: 0.92,
            useNativeDriver: true,
            speed: 30,
            bounciness: 6,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(press, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start()
        }
        onPress={() => onTap(item)}
        style={[styles.bubble, highlighted && styles.bubbleHighlight]}
      >
        <Text style={styles.term} numberOfLines={1}>
          {item.term}
        </Text>
        {item.translation ? (
          <Text style={styles.translation} numberOfLines={1}>
            {item.translation}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    elevation: 3,
  },
  bubbleWrap: {
    position: "absolute",
  },
  bubble: {
    backgroundColor: "rgba(37,99,235,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    minWidth: 56,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  bubbleHighlight: {
    backgroundColor: "rgba(22,163,74,0.95)",
    borderColor: "#fff",
  },
  ring: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  term: { color: "#fff", fontWeight: "800", fontSize: 16, lineHeight: 20 },
  translation: { color: "rgba(255,255,255,0.85)", fontSize: 10, marginTop: 2 },
});
