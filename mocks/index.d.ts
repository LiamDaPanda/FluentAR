export interface AsrResult {
  transcript: string;
  confidence: number;
  mock: boolean;
}

export interface TutorTurn {
  role: "tutor" | "learner_hint";
  text: string;
}

export interface TutorScript {
  moduleId: string;
  turns: TutorTurn[];
  mock?: boolean;
  fallback?: boolean;
}

export interface TutorReply {
  reply: string;
  turnIndex: number;
  totalTurns: number;
  done: boolean;
  script: TutorScript;
  mock: boolean;
}

export function transcribe(simulatedUtterance: string): AsrResult;
export function getTutorTurns(moduleId: string): TutorScript;
export function nextTutorReply(
  moduleId: string,
  learnerMessageIndex: number
): TutorReply;
export function learnerHints(moduleId: string): string[];

declare const _default: {
  transcribe: typeof transcribe;
  getTutorTurns: typeof getTutorTurns;
  nextTutorReply: typeof nextTutorReply;
  learnerHints: typeof learnerHints;
};
export default _default;
