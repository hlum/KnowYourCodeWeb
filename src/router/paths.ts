export const Paths = {
  HOME: '/' as const,
  LOGIN: '/login' as const,
  CLASSES: '/classes' as const,
  CLASS_HOMEWORKS: '/classes/:classId' as const,
  HOMEWORKS: '/homeworks' as const,
  HOMEWORK_DETAIL: '/homeworks/:homeworkId' as const,
  HOMEWORK_QUESTIONS: '/homeworks/:homeworkId/questions' as const,
  PROFILE: '/profile' as const,
  DETAIL_AVERAGE_SCORE: '/profile/stats' as const,
} as const;

export function getClassHomeworksPath(classId: string): string {
  return `/classes/${classId}`;
}

export function getHomeworkDetailPath(homeworkId: string): string {
  return `/homeworks/${homeworkId}`;
}

export function getHomeworkQuestionsPath(homeworkId: string, mode?: 'review'): string {
  const base = `/homeworks/${homeworkId}/questions`;
  return mode ? `${base}?mode=${mode}` : base;
}
