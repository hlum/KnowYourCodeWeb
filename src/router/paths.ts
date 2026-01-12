export const Paths = {
  HOME: '/' as const,
  LOGIN: '/login' as const,
  CLASSES: '/classes' as const,
  CLASS_HOMEWORKS: '/classes/:classId' as const,
  HOMEWORKS: '/homeworks' as const,
  PROFILE: '/profile' as const,
} as const;

export function getClassHomeworksPath(classId: string): string {
  return `/classes/${classId}`;
}
