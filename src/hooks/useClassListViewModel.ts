import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { Class } from '../types/models';
import { classApi } from '../api/classApi';
import { LollipopError } from '../api/errors';

export function useClassListViewModel(user: User) {
	const [classes, setClasses] = useState<Class[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Add optional class state
	const [showAddClassModal, setShowAddClassModal] = useState(false);
	const [classCode, setClassCode] = useState('');
	const [classCodeError, setClassCodeError] = useState('');
	const [isAddingClass, setIsAddingClass] = useState(false);

	// Load classes
	const loadClasses = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await classApi.fetchAll(user.uid);
			setClasses(result);
		} catch (err) {
			if (err instanceof LollipopError && err.type === 'not_found_error') {
				// No classes found is not an error, just empty
				setClasses([]);
			} else {
				console.error('Failed to load classes:', err);
				setError('科目一覧の取得に失敗しました。');
			}
		} finally {
			setIsLoading(false);
		}
	}, [user.uid]);

	useEffect(() => {
		loadClasses();
	}, [loadClasses]);

	// Add optional class
	const addOptionalClass = useCallback(async () => {
		if (!classCode.trim()) return;

		setIsAddingClass(true);
		setClassCodeError('');

		try {
			await classApi.addOptionalClass(classCode.trim(), user.uid);
			setShowAddClassModal(false);
			setClassCode('');
			// Reload classes after adding
			await loadClasses();
		} catch (err) {
			if (err instanceof LollipopError) {
				switch (err.type) {
					case 'not_found_error':
						setClassCodeError('科目コードが見つかりません。');
						break;
					case 'validation_error':
						setClassCodeError('既にこの科目に登録されています。');
						break;
					default:
						setClassCodeError(err.message || '科目の追加に失敗しました。');
				}
			} else {
				setClassCodeError('科目の追加に失敗しました。');
			}
		} finally {
			setIsAddingClass(false);
		}
	}, [classCode, user.uid, loadClasses]);

	const openAddClassModal = useCallback(() => {
		setClassCode('');
		setClassCodeError('');
		setShowAddClassModal(true);
	}, []);

	const closeAddClassModal = useCallback(() => {
		setShowAddClassModal(false);
		setClassCode('');
		setClassCodeError('');
	}, []);

	return {
		classes,
		isLoading,
		error,
		refresh: loadClasses,
		// Add class modal
		showAddClassModal,
		openAddClassModal,
		closeAddClassModal,
		classCode,
		setClassCode,
		classCodeError,
		isAddingClass,
		addOptionalClass,
	};
}
