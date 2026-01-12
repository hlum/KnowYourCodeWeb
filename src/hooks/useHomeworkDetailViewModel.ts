import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { HomeworkWithStatus, Class, ResultData } from '../types/models';
import { homeworkApi } from '../api/homeworkApi';
import { classApi } from '../api/classApi';
import { projectApi } from '../api/projectApi';
import { resultApi } from '../api/resultApi';
import { LollipopError } from '../api/errors';

export function useHomeworkDetailViewModel(user: User, homeworkId: string) {
	const [homework, setHomework] = useState<HomeworkWithStatus | null>(null);
	const [classDetail, setClassDetail] = useState<Class | null>(null);
	const [result, setResult] = useState<ResultData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Submit form state
	const [homeworkLinkTxt, setHomeworkLinkTxt] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [inputErrorMessage, setInputErrorMessage] = useState('');

	// Load homework info
	const loadHomeworkInfo = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const homeworkData = await homeworkApi.fetchHomework(homeworkId, user.uid);
			if (homeworkData) {
				setHomework(homeworkData);
				// Load class detail
				try {
					const classData = await classApi.fetchById(homeworkData.class_id);
					setClassDetail(classData);
				} catch {
					// Class detail is optional
				}
			} else {
				setError('課題が見つかりません。');
			}
		} catch (err) {
			console.error('Failed to load homework:', err);
			setError('課題の取得に失敗しました。');
		} finally {
			setIsLoading(false);
		}
	}, [homeworkId, user.uid]);

	// Load result
	const loadResult = useCallback(async () => {
		try {
			const resultData = await resultApi.fetchResult(user.uid, homeworkId);
			setResult(resultData);
		} catch {
			// Result may not exist yet
			setResult(null);
		}
	}, [homeworkId, user.uid]);

	useEffect(() => {
		loadHomeworkInfo();
		loadResult();
	}, [loadHomeworkInfo, loadResult]);

	// Refresh
	const refresh = useCallback(async () => {
		await loadHomeworkInfo();
		await loadResult();
	}, [loadHomeworkInfo, loadResult]);

	// Upload project (submit homework)
	const uploadProject = useCallback(async () => {
		if (!homeworkLinkTxt.trim()) return;

		setIsSubmitting(true);
		setInputErrorMessage('');

		try {
			await projectApi.uploadProject(user.uid, homeworkId, homeworkLinkTxt.trim());
			setHomeworkLinkTxt('');
			await loadHomeworkInfo();
		} catch (err) {
			if (err instanceof LollipopError) {
				switch (err.type) {
					case 'validation_error':
						setInputErrorMessage('無効なURLです。GitHubまたはGoogle DriveのURLを入力してください。');
						break;
					case 'unsupported_repo_url':
						setInputErrorMessage('サポートされていないURLです。');
						break;
					default:
						setInputErrorMessage(err.message || '提出に失敗しました。');
				}
			} else {
				setInputErrorMessage('提出に失敗しました。');
			}
		} finally {
			setIsSubmitting(false);
		}
	}, [homeworkLinkTxt, user.uid, homeworkId, loadHomeworkInfo]);

	// Retry question generation
	const retryQuestionGeneration = useCallback(async () => {
		try {
			await homeworkApi.retryQuestionGeneration(homeworkId, user.uid);
			await loadHomeworkInfo();
		} catch (err) {
			console.error('Failed to retry question generation:', err);
			setError('再生成に失敗しました。');
		}
	}, [homeworkId, user.uid, loadHomeworkInfo]);

	// Cancel homework submission
	const cancelHomeworkSubmission = useCallback(async () => {
		try {
			await homeworkApi.cancelHomeworkSubmission(homeworkId, user.uid);
			await loadHomeworkInfo();
		} catch (err) {
			console.error('Failed to cancel submission:', err);
			setError('提出の取り消しに失敗しました。');
		}
	}, [homeworkId, user.uid, loadHomeworkInfo]);

	return {
		homework,
		classDetail,
		result,
		isLoading,
		error,
		refresh,
		// Submit form
		homeworkLinkTxt,
		setHomeworkLinkTxt,
		isSubmitting,
		inputErrorMessage,
		uploadProject,
		// Actions
		retryQuestionGeneration,
		cancelHomeworkSubmission,
	};
}
