import type { CourseData, LanguageCode } from "@fluentar/shared";
import shared from "@fluentar/shared";

const { coursesByLanguage } = shared as {
  coursesByLanguage: Record<LanguageCode, CourseData>;
};

export async function fetchCourse(
  mockMode: boolean,
  apiBaseUrl: string,
  language: LanguageCode
): Promise<CourseData> {
  if (mockMode) {
    const course = coursesByLanguage[language] ?? coursesByLanguage.en;
    return course;
  }
  try {
    const url = `${apiBaseUrl.replace(/\/$/, "")}/api/course?lang=${encodeURIComponent(language)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load course");
    return await res.json();
  } catch (e) {
    // Fallback to local on error
    return coursesByLanguage[language] ?? coursesByLanguage.en;
  }
}

export async function postProgress(
  mockMode: boolean,
  apiBaseUrl: string,
  body: {
    studentId: string;
    lessonId: string;
    completed: boolean;
    score?: number;
  }
) {
  if (mockMode) return;
  await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function postArSession(
  mockMode: boolean,
  apiBaseUrl: string,
  body: {
    studentId: string;
    moduleId: string;
    transcript: unknown;
    performanceScore?: number;
  }
) {
  if (mockMode) return;
  await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/ar-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
