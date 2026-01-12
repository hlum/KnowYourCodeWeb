import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { averageScoreApi } from '../api/averageScoreApi';
import type { AverageScorePerClass } from '../types/models';

export function useDetailAverageScoreViewModel(user: User) {
	const [averageScoresPerClass, setAverageScoresPerClass] = useState<AverageScorePerClass[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadAverageScoresPerClass = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await averageScoreApi.fetch(user.uid);
			setAverageScoresPerClass(data);
		} catch (err) {
			// No data is acceptable
			setAverageScoresPerClass([]);
		} finally {
			setIsLoading(false);
		}
	}, [user.uid]);

	useEffect(() => {
		loadAverageScoresPerClass();
	}, [loadAverageScoresPerClass]);

	return {
		averageScoresPerClass,
		isLoading,
		error,
		refresh: loadAverageScoresPerClass,
	};
}
