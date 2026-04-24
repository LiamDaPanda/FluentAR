export type LessonType = "vocabulary" | "grammar" | "speaking" | "ar_challenge";

export type LanguageCode = "en" | "ko" | "ja" | "fr" | "es" | "pl";

export interface Flashcard {
  term: string;
  hint: string;
  translation?: string;
  romanization?: string;
  audioUrl?: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  objective?: string;
  type: LessonType;
  description?: string;
  estimatedMinutes?: number;
  flashcards?: Flashcard[];
  quiz?: LessonQuiz;
}

export interface ArScenario {
  summary: string;
  tutorLines: string[];
  expectedLearnerResponses: string[];
}

export interface Module {
  id: string;
  title: string;
  theme: string;
  objective?: string;
  lessons: Lesson[];
  arScenario: ArScenario;
}

export interface Level {
  id: string;
  title: string;
  objective?: string;
  summary?: string;
  modules: Module[];
}

export interface CourseData {
  title: string;
  language: LanguageCode;
  bcp47: string;
  nativeName: string;
  flag: string;
  levels: Level[];
}

export const courseData: CourseData;
export const coursesByLanguage: Record<LanguageCode, CourseData>;
export const availableLanguages: LanguageCode[];
export function getCourse(lang: LanguageCode): CourseData;

declare const _default: {
  courseData: CourseData;
  coursesByLanguage: Record<LanguageCode, CourseData>;
  availableLanguages: LanguageCode[];
  getCourse: (lang: LanguageCode) => CourseData;
};
export default _default;
