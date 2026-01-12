import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { QuestionWithChoices, Answer } from '../types/models';
import { questionsApi } from '../api/questionsApi';
import { answerApi } from '../api/answerApi';

export type QuestionViewMode = 'answering' | 'review';

export function useQuestionsViewModel(user: User, homeworkId: string, mode: QuestionViewMode) {
	const [questionsWithChoices, setQuestionsWithChoices] = useState<QuestionWithChoices[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// For review mode: map of questionId -> selectedChoiceId
	const [questionIdAndSelectedChoiceId, setQuestionIdAndSelectedChoiceId] = useState<Record<string, string | null>>({});

	// Load all questions with choices
	const loadQuestions = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const questions = await questionsApi.fetchAll(homeworkId, user.uid);
			setQuestionsWithChoices(questions);
		} catch (err) {
			console.error('Failed to load questions:', err);
			setError('問題の取得に失敗しました。');
		} finally {
			setIsLoading(false);
		}
	}, [homeworkId, user.uid]);

	// Load answers for review mode
	const loadAnswersForReview = useCallback(async () => {
		try {
			const answers = await answerApi.fetchAnswers(homeworkId, user.uid);
			const answerMap: Record<string, string | null> = {};
			answers.forEach((answer: Answer) => {
				answerMap[answer.question_id] = answer.selected_choice_id ?? null;
			});
			setQuestionIdAndSelectedChoiceId(answerMap);
		} catch {
			// No answers found is okay
		}
	}, [homeworkId, user.uid]);

	useEffect(() => {
		loadQuestions();
	}, [loadQuestions]);

	useEffect(() => {
		if (mode === 'review' && questionsWithChoices.length > 0) {
			loadAnswersForReview();
		}
	}, [mode, questionsWithChoices.length, loadAnswersForReview]);

	// Post answer
	const postAnswer = useCallback(async (questionId: string, selectedChoiceId: string | null) => {
		try {
			await answerApi.postAnswer({
				questionId,
				homeworkId,
				userId: user.uid,
				selectedChoiceId,
				totalQuestions: questionsWithChoices.length,
			});
		} catch (err) {
			console.error('Failed to post answer:', err);
		}
	}, [homeworkId, user.uid, questionsWithChoices.length]);

	// Go to next question
	const goToNext = useCallback(() => {
		if (currentIndex < questionsWithChoices.length - 1) {
			setCurrentIndex((prev) => prev + 1);
		}
	}, [currentIndex, questionsWithChoices.length]);

	// Check if current question is the last one
	const isLastQuestion = currentIndex === questionsWithChoices.length - 1;

	// Current question
	const currentQuestion = questionsWithChoices[currentIndex] ?? null;

	return {
		questionsWithChoices,
		currentQuestion,
		currentIndex,
		isLastQuestion,
		isLoading,
		error,
		questionIdAndSelectedChoiceId,
		postAnswer,
		goToNext,
		setCurrentIndex,
	};
}
