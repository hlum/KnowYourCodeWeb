import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { HomeworkWithStatus, Class } from '../types/models';
import type { HomeworkFilterOption } from './useHomeworkListViewModel';
import { homeworkApi } from '../api/homeworkApi';
import { classApi } from '../api/classApi';

export function useClassHomeworkViewModel(user: User, classId: string) {
	const [classInfo, setClassInfo] = useState<Class | null>(null);
	const [allHomeworks, setAllHomeworks] = useState<HomeworkWithStatus[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedFilter, setSelectedFilter] = useState<HomeworkFilterOption>('all');

	// Load class info and homeworks
	const loadData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [classResult, homeworksResult] = await Promise.all([
				classApi.fetchById(classId),
				homeworkApi.fetchHomeworksFromClass(classId, user.uid),
			]);
			setClassInfo(classResult);
			setAllHomeworks(homeworksResult);
		} catch (err) {
			console.error('Failed to load class homeworks:', err);
			setError('課題一覧の取得に失敗しました。');
		} finally {
			setIsLoading(false);
		}
	}, [classId, user.uid]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Filter homeworks
	const filteredHomeworks = useMemo(() => {
		let result = [...allHomeworks];

		// Apply filter
		if (selectedFilter !== 'all') {
			result = result.filter((h) => h.submission_state === selectedFilter);

			// Sort by due date for notAssigned (earliest first, null last)
			if (selectedFilter === 'notAssigned') {
				result.sort((a, b) => {
					if (!a.due_date && !b.due_date) return 0;
					if (!a.due_date) return 1;
					if (!b.due_date) return -1;
					return a.due_date.localeCompare(b.due_date);
				});
			}
		} else {
			// Sort by created_at for "all" filter (newest first)
			result.sort((a, b) => b.created_at.localeCompare(a.created_at));
		}

		return result;
	}, [allHomeworks, selectedFilter]);

	return {
		classInfo,
		allHomeworks,
		filteredHomeworks,
		isLoading,
		error,
		selectedFilter,
		setSelectedFilter,
		refresh: loadData,
	};
}
