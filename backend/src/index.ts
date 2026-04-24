import cors from "cors";
import express from "express";
import type { CourseData, LanguageCode } from "@fluentar/shared";
import shared from "@fluentar/shared";
import mocks from "@fluentar/mocks";
import {
  getProgress,
  insertArSession,
  listArSessions,
  upsertProgress,
} from "./db.js";

const { coursesByLanguage } = shared as {
  coursesByLanguage: Record<LanguageCode, CourseData>;
};
const { transcribe, nextTutorReply } = mocks as {
  transcribe: (text: string) => unknown;
  nextTutorReply: (moduleId: string, turnIndex: number) => unknown;
};

function pickCourse(langParam: unknown): CourseData {
  const lang = typeof langParam === "string" ? (langParam as LanguageCode) : "en";
  return coursesByLanguage[lang] ?? coursesByLanguage.en;
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

/**
 * Personal cloud sync for FluentAR. Single-learner, JSON-file backed.
 * The mobile app works fully on-device by default — pointing it at this
 * server adds optional cross-device sync of progress + AR transcripts.
 */

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "fluentar-backend",
    version: "0.4.0",
    uptimeSec: Math.round(process.uptime()),
  });
});

app.get("/api/course", (req, res) => {
  res.json(pickCourse(req.query.lang));
});

app.get("/api/languages", (_req, res) => {
  res.json({
    languages: Object.keys(coursesByLanguage).map((code) => {
      const c = coursesByLanguage[code as LanguageCode];
      return {
        code,
        title: c.title,
        nativeName: c.nativeName,
        flag: c.flag,
      };
    }),
  });
});

app.get("/api/progress/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ userId, lessons: getProgress(userId) });
});

app.post("/api/progress", (req, res) => {
  const { studentId, userId, lessonId, completed, score } = req.body ?? {};
  const owner = userId ?? studentId;
  if (!owner || !lessonId) {
    res.status(400).json({ error: "userId and lessonId are required" });
    return;
  }
  upsertProgress({
    userId: owner,
    lessonId,
    completed: Boolean(completed),
    score: score ?? null,
  });
  res.json({ ok: true });
});

app.get("/api/ar-sessions", (req, res) => {
  const userId =
    typeof req.query.userId === "string"
      ? req.query.userId
      : typeof req.query.studentId === "string"
        ? req.query.studentId
        : null;
  res.json({ sessions: listArSessions(userId) });
});

app.post("/api/ar-sessions", (req, res) => {
  const { studentId, userId, moduleId, transcript, performanceScore } =
    req.body ?? {};
  const owner = userId ?? studentId;
  if (!owner || !moduleId) {
    res.status(400).json({ error: "userId and moduleId are required" });
    return;
  }
  const id = insertArSession({
    userId: owner,
    moduleId,
    transcript,
    performanceScore: performanceScore ?? null,
  });
  res.json({ ok: true, id });
});

/** Demo endpoints that exercise mock ASR + mock Claude (same logic as mobile mocks). */
app.post("/api/mock/asr", (req, res) => {
  const { text } = req.body ?? {};
  res.json(transcribe(String(text ?? "")));
});

app.post("/api/mock/tutor", (req, res) => {
  const { moduleId, turnIndex } = req.body ?? {};
  if (!moduleId) {
    res.status(400).json({ error: "moduleId is required" });
    return;
  }
  const idx = Number.isFinite(Number(turnIndex)) ? Number(turnIndex) : 0;
  res.json(nextTutorReply(String(moduleId), idx));
});

app.listen(PORT, () => {
  console.log(`FluentAR backend listening on http://localhost:${PORT}`);
});
