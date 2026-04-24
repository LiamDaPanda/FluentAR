import mocks from "@fluentar/mocks";

type Mocks = {
  transcribe: (text: string) => { transcript: string; confidence: number; mock: boolean };
  nextTutorReply: (
    moduleId: string,
    learnerMessageIndex: number
  ) => {
    reply: string;
    turnIndex: number;
    totalTurns: number;
    done: boolean;
    mock: boolean;
  };
  learnerHints: (moduleId: string) => string[];
};

const m = mocks as Mocks;

export function mockTranscribe(text: string) {
  return m.transcribe(text);
}

export function mockTutorReply(moduleId: string, turnIndex: number) {
  return m.nextTutorReply(moduleId, turnIndex);
}

export function mockLearnerHints(moduleId: string) {
  return m.learnerHints(moduleId);
}
