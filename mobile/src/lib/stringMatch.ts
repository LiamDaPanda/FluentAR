function normalizedLevenshtein(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function checkAnswer(
  transcript: string,
  expected: string[],
  threshold = 0.6
): { score: number; matched: boolean; bestMatch: string | null } {
  const normalized = normalizeText(transcript);
  let bestScore = 0;
  let bestMatch: string | null = null;
  for (const exp of expected) {
    const score = normalizedLevenshtein(normalized, normalizeText(exp));
    if (score > bestScore) {
      bestScore = score;
      bestMatch = exp;
    }
  }
  return {
    score: Math.round(bestScore * 100) / 100,
    matched: bestScore >= threshold,
    bestMatch,
  };
}

export { normalizedLevenshtein, normalizeText, checkAnswer };