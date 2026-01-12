import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { HomeworkWithStatus, HomeworkState } from '../types/models';
import { homeworkApi } from '../api/homeworkApi';

export type HomeworkFilterOption = 'all' | HomeworkState;

export const FILTER_OPTIONS: { value: HomeworkFilterOption; label: string }[] = [
	{ value: 'all', label: 'すべて' },
	{ value: 'notAssigned', label: '未提出' },
	{ value: 'generatingQuestions', label: '問題生成中' },
	{ value: 'questionGenerated', label: '問題生成完了' },
	{ value: 'completed', label: '提出完了' },
	{ value: 'failed', label: '生成失敗' },
];

// Normalize text for search (remove spaces, punctuation, normalize width)
function normalizeText(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKC') // Normalize full-width to half-width
		.replace(/[\s\p{P}]/gu, ''); // Remove spaces and punctuation
}

export function useHomeworkListViewModel(user: User) {
	const [allHomeworks, setAllHomeworks] = useState<HomeworkWithStatus[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchText, setSearchText] = useState('');
	const [selectedFilter, setSelectedFilter] = useState<HomeworkFilterOption>('all');
	const [debouncedSearchText, setDebouncedSearchText] = useState('');

	// Debounce search text
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchText(searchText);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchText]);

	// Load homeworks
	const loadHomeworks = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const homeworks = await homeworkApi.fetchHomeworks(user.uid);
			setAllHomeworks(homeworks);
		} catch (err) {
			console.error('Failed to load homeworks:', err);
			setError('課題一覧の取得に失敗しました。');
		} finally {
			setIsLoading(false);
		}
	}, [user.uid]);

	useEffect(() => {
		loadHomeworks();
	}, [loadHomeworks]);

	// Filter and search homeworks
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

		// Apply search
		if (debouncedSearchText.trim()) {
			const normalizedSearch = normalizeText(debouncedSearchText);
			result = result.filter((h) => {
				const normalizedTitle = normalizeText(h.title);
				const normalizedDescription = normalizeText(h.description || '');
				return normalizedTitle.includes(normalizedSearch) || normalizedDescription.includes(normalizedSearch);
			});
		}

		return result;
	}, [allHomeworks, selectedFilter, debouncedSearchText]);

	return {
		allHomeworks,
		filteredHomeworks,
		isLoading,
		error,
		searchText,
		setSearchText,
		selectedFilter,
		setSelectedFilter,
		refresh: loadHomeworks,
	};
}
