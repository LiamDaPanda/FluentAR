import fs from "node:fs";
import path from "node:path";

/**
 * Tiny JSON-file store for personal sync. No native deps, never breaks on
 * Node upgrades. Single learner, low write volume — fine to read/write the
 * whole file each time.
 */

export type LessonProgressRow = {
  user_id: string;
  lesson_id: string;
  completed: 0 | 1;
  score: number | null;
  updated_at: string;
};

export type ArSessionRow = {
  id: number;
  user_id: string;
  module_id: string;
  transcript: unknown;
  performance_score: number | null;
  created_at: string;
};

type Shape = {
  lessonProgress: LessonProgressRow[];
  arSessions: ArSessionRow[];
  nextArSessionId: number;
};

const DEFAULT: Shape = {
  lessonProgress: [],
  arSessions: [],
  nextArSessionId: 1,
};

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "fluentar.json");

function readState(): Shape {
  if (!fs.existsSync(dbPath)) return { ...DEFAULT };
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Shape>;
    return {
      lessonProgress: parsed.lessonProgress ?? [],
      arSessions: parsed.arSessions ?? [],
      nextArSessionId: parsed.nextArSessionId ?? 1,
    };
  } catch {
    return { ...DEFAULT };
  }
}

function writeState(state: Shape) {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

export function getProgress(userId: string): LessonProgressRow[] {
  return readState().lessonProgress.filter((r) => r.user_id === userId);
}

export function upsertProgress(input: {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number | null;
}): void {
  const state = readState();
  const updatedAt = new Date().toISOString();
  const idx = state.lessonProgress.findIndex(
    (r) => r.user_id === input.userId && r.lesson_id === input.lessonId
  );
  const row: LessonProgressRow = {
    user_id: input.userId,
    lesson_id: input.lessonId,
    completed: input.completed ? 1 : 0,
    score: input.score,
    updated_at: updatedAt,
  };
  if (idx >= 0) state.lessonProgress[idx] = row;
  else state.lessonProgress.push(row);
  writeState(state);
}

export function listArSessions(userId: string | null): ArSessionRow[] {
  const all = readState().arSessions;
  const filtered = userId ? all.filter((s) => s.user_id === userId) : all;
  return [...filtered].sort((a, b) => b.id - a.id).slice(0, 200);
}

export function insertArSession(input: {
  userId: string;
  moduleId: string;
  transcript: unknown;
  performanceScore: number | null;
}): number {
  const state = readState();
  const id = state.nextArSessionId++;
  const row: ArSessionRow = {
    id,
    user_id: input.userId,
    module_id: input.moduleId,
    transcript: input.transcript,
    performance_score: input.performanceScore,
    created_at: new Date().toISOString(),
  };
  state.arSessions.push(row);
  writeState(state);
  return id;
}
