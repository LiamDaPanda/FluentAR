import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const KEY = "fluentar_completed_lessons";
const LOG_KEY = "fluentar_activity_log";
const MAX_LOG = 400;
const SRS_KEY = "fluentar_srs_cards";

export type ActivityEntry = { lessonId: string; at: string };

export type CardState = "new" | "learning" | "review";

export interface SRSCard {
  id: string;
  lessonId: string;
  term: string;
  translation: string;
  state: CardState;
  interval: number;
  ease: number;
  due: string;
  lapses: number;
  reviews: number;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

const DEFAULT_INTERVALS = [1, 3, 7, 14, 30, 60, 120];

function calcNextReview(state: CardState, ease: number, interval: number, rating: number): { interval: number; ease: number; state: CardState } {
  let newInterval = interval;
  let newEase = ease;
  let newState: CardState = state;

  if (rating < 2) {
    newInterval = 1;
    newEase = Math.max(1.3, ease - 0.2);
    newState = "learning";
  } else {
    if (state === "new") {
      newInterval = 1;
      newState = "learning";
    } else if (state === "learning") {
      newInterval = 3;
      newState = "review";
    } else {
      newInterval = Math.round(interval * ease);
      const maxInterval = DEFAULT_INTERVALS[DEFAULT_INTERVALS.length - 1] || 365;
      if (newInterval > maxInterval) newInterval = maxInterval;
    }
    newEase = ease + (rating === 4 ? 0.1 : rating === 3 ? 0 : -0.1);
    if (newEase < 1.3) newEase = 1.3;
  }

  return { interval: newInterval, ease: newEase, state: newState };
}

type LessonProgressValue = {
  done: Set<string>;
  markComplete: (lessonId: string) => Promise<void>;
  isDone: (lessonId: string) => boolean;
  refresh: () => Promise<void>;
  weeklyStats: {
    lessonsThisWeek: number;
    daysActiveThisWeek: number;
    totalEvents: number;
  };
  srsCards: SRSCard[];
  addCardsForLesson: (lessonId: string, cards: { term: string; translation: string }[]) => Promise<void>;
  getDueCards: () => SRSCard[];
  reviewCard: (cardId: string, rating: number) => Promise<void>;
  resetSRS: () => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;
};

const LessonProgressContext = createContext<LessonProgressValue | null>(null);

export function LessonProgressProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [srsCards, setSrsCards] = useState<SRSCard[]>([]);

const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        setDone(new Set());
      } else {
        const arr = JSON.parse(raw) as string[];
        setDone(new Set(arr));
      }
    } catch {
      setDone(new Set());
    }

    try {
      const rawLog = await AsyncStorage.getItem(LOG_KEY);
      if (!rawLog) {
        setActivityLog([]);
      } else {
        const arr = JSON.parse(rawLog) as ActivityEntry[];
        setActivityLog(Array.isArray(arr) ? arr : []);
      }
    } catch {
      setActivityLog([]);
    }

    try {
      const rawSrs = await AsyncStorage.getItem(SRS_KEY);
      if (!rawSrs) {
        setSrsCards([]);
      } else {
        const arr = JSON.parse(rawSrs) as SRSCard[];
        setSrsCards(Array.isArray(arr) ? arr : []);
      }
    } catch {
      setSrsCards([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markComplete = useCallback(async (lessonId: string) => {
    let nextArr: string[] = [];
    setDone((prev) => {
      const next = new Set(prev);
      next.add(lessonId);
      nextArr = [...next];
      return next;
    });
    try { await AsyncStorage.setItem(KEY, JSON.stringify(nextArr)); } catch {}

    let prev: ActivityEntry[] = [];
    try {
      const rawLog = await AsyncStorage.getItem(LOG_KEY);
      if (rawLog) {
        try {
          prev = JSON.parse(rawLog) as ActivityEntry[];
          if (!Array.isArray(prev)) prev = [];
        } catch { prev = []; }
      }
    } catch { prev = []; }
    const entry: ActivityEntry = { lessonId, at: new Date().toISOString() };
    const nextLog = [...prev, entry].slice(-MAX_LOG);
    setActivityLog(nextLog);
    try { await AsyncStorage.setItem(LOG_KEY, JSON.stringify(nextLog)); } catch {}
  }, []);

  const isDone = useCallback((lessonId: string) => done.has(lessonId), [done]);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const weekEnd = new Date(start);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let lessonsThisWeek = 0;
    const days = new Set<string>();
    for (const e of activityLog) {
      const t = new Date(e.at);
      if (t >= start && t < weekEnd) {
        lessonsThisWeek += 1;
        days.add(t.toDateString());
      }
    }
    return {
      lessonsThisWeek,
      daysActiveThisWeek: days.size,
      totalEvents: activityLog.length,
    };
  }, [activityLog]);

  const addCardsForLesson = useCallback(async (lessonId: string, cards: { term: string; translation: string }[]) => {
    const now = new Date().toISOString();
    const newCards: SRSCard[] = cards.map((c) => ({
      id: `${lessonId}_${c.term.replace(/\s+/g, "_")}`,
      lessonId,
      term: c.term,
      translation: c.translation,
      state: "new",
      interval: 0,
      ease: 2.5,
      due: now,
      lapses: 0,
      reviews: 0,
    }));

    setSrsCards((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const toAdd = newCards.filter((c) => !existingIds.has(c.id));
      const next = [...prev, ...toAdd];
      AsyncStorage.setItem(SRS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getDueCards = useCallback(() => {
    const now = new Date();
    return srsCards.filter((c) => new Date(c.due) <= now);
  }, [srsCards]);

  const reviewCard = useCallback(async (cardId: string, rating: number) => {
    setSrsCards((prev) => {
      const card = prev.find((c) => c.id === cardId);
      if (!card) return prev;

      const { interval, ease, state } = calcNextReview(card.state, card.ease, card.interval, rating);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + interval);

      const updated: SRSCard = {
        ...card,
        interval,
        ease,
        state,
        due: dueDate.toISOString(),
        lapses: rating < 2 ? card.lapses + 1 : card.lapses,
        reviews: card.reviews + 1,
      };

      const next = prev.map((c) => (c.id === cardId ? updated : c));
      AsyncStorage.setItem(SRS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSRS = useCallback(async () => {
    setSrsCards([]);
    await AsyncStorage.setItem(SRS_KEY, JSON.stringify([]));
  }, []);

  const removeCard = useCallback(async (cardId: string) => {
    setSrsCards((prev) => {
      const next = prev.filter((c) => c.id !== cardId);
      AsyncStorage.setItem(SRS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      done,
      markComplete,
      isDone,
      refresh,
      weeklyStats,
      srsCards,
      addCardsForLesson,
      getDueCards,
      reviewCard,
      resetSRS,
      removeCard,
    }),
    [done, markComplete, isDone, refresh, weeklyStats, srsCards, addCardsForLesson, getDueCards, reviewCard, resetSRS, removeCard]
  );

  return (
    <LessonProgressContext.Provider value={value}>{children}</LessonProgressContext.Provider>
  );
}

export function useLessonProgress() {
  const ctx = useContext(LessonProgressContext);
  if (!ctx) throw new Error("LessonProgressProvider missing");
  return ctx;
}
