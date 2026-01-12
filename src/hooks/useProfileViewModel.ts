import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { resultApi } from '../api/resultApi';
import { userApi } from '../api/userApi';
import type { ResultData, UserData } from '../types/models';

export interface AverageResultPerMonth {
	month: Date;
	averageScore: number;
}

export function useProfileViewModel(user: User) {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [results, setResults] = useState<ResultData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

	const loadUserData = useCallback(async () => {
		try {
			const data = await userApi.fetchUserData(user.uid);
			setUserData(data);
		} catch (err) {
			console.error('Failed to load user data:', err);
		}
	}, [user.uid]);

	const loadResults = useCallback(async () => {
		try {
			const data = await resultApi.fetchResults(user.uid);
			setResults(data);
		} catch (err) {
			// No results is not an error for this view
			setResults([]);
		}
	}, [user.uid]);

	const loadAll = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			await Promise.all([loadUserData(), loadResults()]);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
		} finally {
			setIsLoading(false);
		}
	}, [loadUserData, loadResults]);

	useEffect(() => {
		loadAll();
	}, [loadAll]);

	// Calculate average results per month for the current year
	const averageResultsPerMonth = useMemo((): AverageResultPerMonth[] => {
		const monthlyScores: Record<number, number[]> = {};

		results.forEach((result) => {
			const date = new Date(result.evaluated_at);
			if (date.getFullYear() !== currentYear) return;

			const month = date.getMonth();
			if (!monthlyScores[month]) {
				monthlyScores[month] = [];
			}
			monthlyScores[month].push(result.score);
		});

		return Object.entries(monthlyScores)
			.map(([month, scores]) => ({
				month: new Date(currentYear, parseInt(month), 1),
				averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
			}))
			.sort((a, b) => a.month.getTime() - b.month.getTime());
	}, [results, currentYear]);

	// Calculate overall average score
	const averageScoreOfAllResults = useMemo(() => {
		if (results.length === 0) return 0;
		const total = results.reduce((sum, r) => sum + r.score, 0);
		return Math.round(total / results.length);
	}, [results]);

	const goToPreviousYear = useCallback(() => {
		setCurrentYear((y) => y - 1);
	}, []);

	const goToNextYear = useCallback(() => {
		setCurrentYear((y) => y + 1);
	}, []);

	return {
		userData,
		results,
		isLoading,
		error,
		currentYear,
		averageResultsPerMonth,
		averageScoreOfAllResults,
		completedHomeworkCount: results.length,
		goToPreviousYear,
		goToNextYear,
		refresh: loadAll,
	};
}
