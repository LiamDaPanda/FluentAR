import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_MOCK = "fluentar_mock_mode";
const STORAGE_API = "fluentar_api_base";

const defaultApi = __DEV__ ? "http://localhost:4000" : "https://api.example.com";

type AppContextValue = {
  mockMode: boolean;
  setMockMode: (v: boolean) => void;
  apiBaseUrl: string;
  setApiBaseUrl: (v: string) => void;
  studentId: string;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mockMode, setMockModeState] = useState(true);
  const [apiBaseUrl, setApiBaseUrlState] = useState(defaultApi);
  const studentId = "local-student";

  useEffect(() => {
    (async () => {
      try {
        const m = await AsyncStorage.getItem(STORAGE_MOCK);
        const a = await AsyncStorage.getItem(STORAGE_API);
        if (m !== null) setMockModeState(m === "1");
        if (a) setApiBaseUrlState(a);
      } catch {}
    })();
  }, []);

  const setMockMode = useCallback(async (v: boolean) => {
    setMockModeState(v);
    try {
      await AsyncStorage.setItem(STORAGE_MOCK, v ? "1" : "0");
    } catch {
      // ignore storage errors
    }
  }, []);

  const setApiBaseUrl = useCallback(async (v: string) => {
    setApiBaseUrlState(v);
    try {
      await AsyncStorage.setItem(STORAGE_API, v);
    } catch {
      // ignore storage errors
    }
  }, []);

  const value = useMemo(
    () => ({
      mockMode,
      setMockMode,
      apiBaseUrl,
      setApiBaseUrl,
      studentId,
    }),
    [mockMode, setMockMode, apiBaseUrl, setApiBaseUrl, studentId]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppConfig() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppProvider missing");
  return ctx;
}
