import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import shared from "@fluentar/shared";
import type { CourseData, LanguageCode } from "@fluentar/shared";

const KEY_LANG = "fluentar_language";
const KEY_IMMERSIVE = "fluentar_immersive";
const KEY_STARTER = "fluentar_starter";

const { coursesByLanguage } = shared as {
  coursesByLanguage: Record<LanguageCode, CourseData>;
};

const DEFAULT_LANGUAGE: LanguageCode = "en";
const VALID_CODES: LanguageCode[] = ["en", "ko", "ja", "fr", "es", "pl"];

const TRANS: Record<LanguageCode, Record<string, string>> = {
  en: {
    welcome: "Welcome",
    progress: "PROGRESS",
    myJourney: "My Journey",
    settings: "Settings",
    flashcards: "Flashcards",
    activeDays: "Active Days",
    thisWeek: "This Week",
    totalDone: "Total Done",
    continueToQuiz: "Continue to quick quiz",
    previous: "Previous",
    nextCard: "Next card",
    markComplete: "Mark complete & back",
    retry: "Retry",
    backToModule: "Back to module",
    speakIt: "Hear it",
    allCaughtUp: "All caught up!",
    tapToReveal: "Tap to see answer",
    tapToHear: "Tap to hear",
  },
  es: {
    welcome: "Bienvenido",
    progress: "PROGRESO",
    myJourney: "Mi Camino",
    settings: "Ajustes",
    flashcards: "Tarjetas",
    activeDays: "Días Activos",
    thisWeek: "Esta Semana",
    totalDone: "Total Hecho",
    continueToQuiz: "Continuar al cuestionario",
    previous: "Anterior",
    nextCard: "Siguiente tarjeta",
    markComplete: "Marcar completo y volver",
    retry: "Reintentar",
    backToModule: "Volver al módulo",
    speakIt: "Escuchar",
    allCaughtUp: "¡Todo listo!",
    tapToReveal: "Toca para ver la respuesta",
    tapToHear: "Toca para escuchar",
  },
  fr: {
    welcome: "Bienvenue",
    progress: "PROGRÈS",
    myJourney: "Mon Parcours",
    settings: "Paramètres",
    flashcards: "Cartes",
    activeDays: "Jours Actifs",
    thisWeek: "Cette Semaine",
    totalDone: "Total Fait",
    continueToQuiz: "Continuer au quiz",
    previous: "Précédent",
    nextCard: "Carte suivante",
    markComplete: "Marquer terminé et revenir",
    retry: "Réessayer",
    backToModule: "Retour au module",
    speakIt: "Écouter",
    allCaughtUp: "Tout est prêt !",
    tapToReveal: "Appuyez pour voir la réponse",
    tapToHear: "Appuyez pour écouter",
  },
  ja: {
    welcome: "ようこそ",
    progress: "進捗",
    myJourney: "マイジャーナー",
    settings: "設定",
    flashcards: "単語帳",
    activeDays: "アクティブ",
    thisWeek: "今週",
    totalDone: "完了",
    continueToQuiz: "クイズへ",
    previous: "前へ",
    nextCard: "次のカード",
    markComplete: "完了して戻る",
    retry: "再試行",
    backToModule: "モジュールへ戻る",
    speakIt: "聞く",
    allCaughtUp: "全て完了！",
    tapToReveal: "タップして答えを見る",
    tapToHear: "タップして聞く",
  },
  ko: {
    welcome: "환영",
    progress: "진행",
    myJourney: "내 여정",
    settings: "설정",
    flashcards: "플래시카드",
    activeDays: "활동일",
    thisWeek: "이번 주",
    totalDone: "완료",
    continueToQuiz: "퀴즈로 계속",
    previous: "이전",
    nextCard: "다음 카드",
    markComplete: "완료하고 돌아가기",
    retry: "다시 시도",
    backToModule: "모듈로 돌아가기",
    speakIt: "듣기",
    allCaughtUp: "모두 완료!",
    tapToReveal: "탭하여 답 보기",
    tapToHear: "탭하여 듣기",
  },
  pl: {
    welcome: "Witaj",
    progress: "POSTĘP",
    myJourney: "Moja Droga",
    settings: "Ustawienia",
    flashcards: "Fiszki",
    activeDays: "Aktywne Dni",
    thisWeek: "Ten Tydzień",
    totalDone: "Łącznie",
    continueToQuiz: "Kontynuuj do quizu",
    previous: "Poprzednia",
    nextCard: "Następna karta",
    markComplete: "Oznacz ukończone i wróć",
    retry: "Spróbuj ponownie",
    backToModule: "Wróć do modułu",
    speakIt: "Posłuchaj",
    allCaughtUp: "Wszystko zrobione!",
    tapToReveal: "Stuknij, aby zobaczyć odpowiedź",
    tapToHear: "Stuknij, aby usłyszeć",
  },
};

type LanguageContextValue = {
  language: LanguageCode;
  starterLanguage: LanguageCode;
  setLanguage: (l: LanguageCode) => Promise<void>;
  setStarterLanguage: (l: LanguageCode) => Promise<void>;
  course: CourseData;
  catalog: Array<{
    code: LanguageCode;
    title: string;
    nativeName: string;
    flag: string;
  }>;
  immersive: boolean;
  setImmersive: (v: boolean) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [starterLanguage, setStarterLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [immersive, setImmersiveState] = useState(false);

  // Read the saved choice in the background; fall back to DEFAULT_LANGUAGE.
  // Never block the render tree — a stalled AsyncStorage call (common on web)
  // would otherwise leave the whole app blank.
  useEffect(() => {
    AsyncStorage.getItem(KEY_LANG)
      .then((stored) => {
        if (stored && (VALID_CODES as string[]).includes(stored)) {
          setLanguageState(stored as LanguageCode);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(KEY_STARTER)
      .then((stored) => {
        if (stored && (VALID_CODES as string[]).includes(stored)) {
          setStarterLanguageState(stored as LanguageCode);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(KEY_IMMERSIVE)
      .then((stored) => {
        if (stored === "1") setImmersiveState(true);
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback(async (l: LanguageCode) => {
    setLanguageState(l);
    try {
      await AsyncStorage.setItem(KEY_LANG, l);
    } catch {
      // ignore storage errors
    }
  }, []);

  const setStarterLanguage = useCallback(async (l: LanguageCode) => {
    setStarterLanguageState(l);
    try {
      await AsyncStorage.setItem(KEY_STARTER, l);
    } catch {
      // ignore storage errors
    }
  }, []);

  const setImmersive = useCallback(async (v: boolean) => {
    setImmersiveState(v);
    try {
      await AsyncStorage.setItem(KEY_IMMERSIVE, v ? "1" : "0");
    } catch {
      // ignore storage errors
    }
  }, []);

  const course = coursesByLanguage[language] ?? coursesByLanguage[DEFAULT_LANGUAGE];

  const catalog = useMemo(
    () =>
      (Object.keys(coursesByLanguage) as LanguageCode[]).map((code) => ({
        code,
        title: coursesByLanguage[code].title,
        nativeName: coursesByLanguage[code].nativeName,
        flag: coursesByLanguage[code].flag,
      })),
    []
  );

  const t = useCallback(
    (key: string): string => {
      if (immersive) {
        return TRANS[language]?.[key] ?? TRANS.en[key] ?? key;
      }
      return TRANS.en[key] ?? key;
    },
    [language, immersive]
  );

  const value = useMemo(
    () => ({ language, starterLanguage, setLanguage, setStarterLanguage, course, catalog, immersive, setImmersive, t }),
    [language, starterLanguage, setLanguage, setStarterLanguage, course, catalog, immersive, setImmersive, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("LanguageProvider missing");
  return ctx;
}
