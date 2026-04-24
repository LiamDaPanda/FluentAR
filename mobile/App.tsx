import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { setAudioModeAsync } from "expo-audio";
import React, { Component, ErrorInfo, ReactNode, useEffect } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/context/AppContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { LessonProgressProvider } from "./src/context/LessonProgressContext";
import type { RootStackParamList } from "./src/navigation/types";
import ARScreen from "./src/screens/ARScreen";
import CourseMapScreen from "./src/screens/CourseMapScreen";
import JourneyScreen from "./src/screens/JourneyScreen";
import LanguageHubScreen from "./src/screens/LanguageHubScreen";
import LessonScreen from "./src/screens/LessonScreen";
import ModuleScreen from "./src/screens/ModuleScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import FlashcardsScreen from "./src/screens/FlashcardsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const THEME = {
  headerBg: "#ffffff",
  headerTint: "#111111",
  primary: "#2563eb",
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || this.state.error?.toString() || "An error occurred"}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              this.setState({ hasError: false, error: null });
              // Force fresh render
            }}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootNavigator() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="CourseMap"
        screenOptions={{
          headerStyle: { backgroundColor: THEME.headerBg },
          headerTintColor: THEME.headerTint,
          headerTitleStyle: { fontWeight: "700", color: THEME.headerTint },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="LanguageHub"
          component={LanguageHubScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CourseMap"
          component={CourseMapScreen}
          options={{ title: "FluentAR" }}
        />
        <Stack.Screen name="Module" component={ModuleScreen} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="ARChallenge" component={ARScreen} />
        <Stack.Screen name="Journey" component={JourneyScreen} />
        <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: false,
      interruptionMode: "mixWithOthers",
    }).catch((e) => console.warn("audio mode setup failed", e));
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <LanguageProvider>
            <LessonProgressProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </LessonProgressProvider>
          </LanguageProvider>
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#d00", marginBottom: 16 },
  errorText: { fontSize: 12, color: "#666", marginBottom: 16, textAlign: "center" },
  errorButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#2563eb" },
  errorButtonText: { color: "#fff", fontWeight: "600" },
});