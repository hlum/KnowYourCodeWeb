import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { classApi, homeworkApi, userApi } from '../api';
import type { Class, HomeworkWithStatus, UserData } from '../types/models';

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
      // Sort by due date and filter for upcoming ones
      const sorted = data
        .filter((h) => h.due_date)
        .sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        })
        .slice(0, 5); // Show only 5 upcoming
      setHomeworks(sorted);
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
