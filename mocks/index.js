// Mock services for FluentAR. Designed to run in BOTH Node (backend) and
// React Native / Metro (mobile), so it must not use Node-only APIs like
// `fs` or `path`. JSON dialogue files are bundled via static `require` —
// Metro and Node both support that natively.

const airport = require("./claude_responses/airport.json");
const cafe = require("./claude_responses/cafe.json");
const doctor = require("./claude_responses/doctor.json");
const interview = require("./claude_responses/interview.json");
const ko_greetings = require("./claude_responses/ko_greetings.json");
const ko_cafe = require("./claude_responses/ko_cafe.json");
const ja_greetings = require("./claude_responses/ja_greetings.json");
const ja_konbini = require("./claude_responses/ja_konbini.json");
const fr_greetings = require("./claude_responses/fr_greetings.json");
const fr_cafe = require("./claude_responses/fr_cafe.json");
const es_greetings = require("./claude_responses/es_greetings.json");
const es_cafe = require("./claude_responses/es_cafe.json");

const SCRIPTS = {
  airport,
  cafe,
  doctor,
  interview,
  ko_greetings,
  ko_cafe,
  ja_greetings,
  ja_konbini,
  fr_greetings,
  fr_cafe,
  es_greetings,
  es_cafe,
};

/**
 * Mock ASR: treat `simulatedUtterance` as the transcript of what the learner "said".
 */
function transcribe(simulatedUtterance) {
  const text = (simulatedUtterance ?? "").trim();
  return {
    transcript: text,
    confidence: text.length > 0 ? 0.97 : 0,
    mock: true,
  };
}

/**
 * Mock Claude: return scripted tutor dialogue for a module.
 * Falls back to a generic script if the module is unknown.
 */
function getTutorTurns(moduleId) {
  const script = SCRIPTS[moduleId];
  if (script) return script;
  return {
    moduleId,
    turns: [
      { role: "tutor", text: "Welcome to your AR speaking challenge. I'm your tutor." },
      { role: "tutor", text: "Say your answer clearly when you're ready." },
    ],
    mock: true,
    fallback: true,
  };
}

/**
 * Scripted reply that walks tutor lines based on learner input count.
 *
 * Returns `done: true` once the script is exhausted so callers can close the
 * conversation gracefully instead of looping the final line forever.
 */
function nextTutorReply(moduleId, learnerMessageIndex) {
  const script = getTutorTurns(moduleId);
  const tutorLines = (script.turns || [])
    .filter((t) => t.role === "tutor")
    .map((t) => t.text);
  const total = tutorLines.length;
  const done = total === 0 || learnerMessageIndex >= total;
  const reply = done
    ? "Nice work — that wraps the scenario. Tap 'Complete module exam' when you're ready."
    : tutorLines[learnerMessageIndex];
  return {
    reply,
    turnIndex: Math.min(learnerMessageIndex, Math.max(0, total - 1)),
    totalTurns: total,
    done,
    script,
    mock: true,
  };
}

/**
 * Pull the optional `learner_hint` lines so the UI can surface "Try saying…"
 * chips beneath the input field.
 */
function learnerHints(moduleId) {
  const script = getTutorTurns(moduleId);
  return (script.turns || [])
    .filter((t) => t.role === "learner_hint")
    .map((t) => t.text);
}

module.exports = {
  transcribe,
  getTutorTurns,
  nextTutorReply,
  learnerHints,
};
