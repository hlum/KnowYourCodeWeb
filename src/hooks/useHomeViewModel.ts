import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { classApi, homeworkApi, userApi } from '../api';
import type { Class, HomeworkWithStatus, UserData, HomeworkState } from '../types/models';

// Priority for submission states (lower = higher priority)
const submissionStatePriority: Record<HomeworkState, number> = {
  notAssigned: 0,
  failed: 1,
  questionGenerated: 2,
  generatingQuestions: 3,
  completed: 4,
};

export function useHomeViewModel(user: User) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [homeworks, setHomeworks] = useState<HomeworkWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      const data = await userApi.fetchUserData(user.uid);
      setUserData(data);
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
  }, [user.uid]);

  const loadClasses = useCallback(async () => {
    try {
      const data = await classApi.fetchAll(user.uid);
      setClasses(data);
    } catch (e) {
      console.error('Failed to load classes:', e);
      setClasses([]);
    }
  }, [user.uid]);

  const loadHomeworks = useCallback(async () => {
    try {
      const data = await homeworkApi.fetchHomeworks(user.uid);
      
      // 1. Filter out completed homeworks
      const filtered = data.filter((h) => h.submission_state !== 'completed');
      
      // 2. Sort by due date (ascending), then by submission state priority
      const sorted = filtered.sort((a, b) => {
        const aDate = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        
        if (aDate !== bDate) {
          return aDate - bDate;
        }
        
        // Same due date, sort by submission state priority
        const aPriority = submissionStatePriority[a.submission_state] ?? 999;
        const bPriority = submissionStatePriority[b.submission_state] ?? 999;
        return aPriority - bPriority;
      });
      
      // 3. Return top 10
      setHomeworks(sorted.slice(0, 10));
    } catch (e) {
      console.error('Failed to load homeworks:', e);
      setHomeworks([]);
    }
  }, [user.uid]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([loadUserData(), loadClasses(), loadHomeworks()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [loadUserData, loadClasses, loadHomeworks]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    userData,
    classes,
    homeworks,
    isLoading,
    error,
    refresh: loadAll,
  };
}
