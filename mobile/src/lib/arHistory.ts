import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "fluentar_ar_history";
const MAX_ENTRIES = 30;

export type ArHistoryLine = { role: "tutor" | "you" | "system"; text: string };

export type ArHistoryEntry = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  finishedAt: string;
  lines: ArHistoryLine[];
};

export async function listArHistory(): Promise<ArHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as ArHistoryEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveArHistoryEntry(
  entry: Omit<ArHistoryEntry, "id">
): Promise<ArHistoryEntry> {
  const prev = await listArHistory();
  const full: ArHistoryEntry = {
    ...entry,
    id: `${entry.moduleId}-${Date.now()}`,
  };
  const next = [full, ...prev].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return full;
}

export async function clearArHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
