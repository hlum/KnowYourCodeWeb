import { useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestionsViewModel, type QuestionViewMode } from '../hooks/useQuestionsViewModel';
import { QuestionAndChoicesItemView } from '../components/QuestionAndChoicesItemView';
import { getHomeworkDetailPath } from '../router/paths';

interface QuestionsViewProps {
	user: User;
}

function QuestionsViewSkeleton() {
	return (
		<div className="page-bg min-h-screen animate-pulse">
			<div className="max-w-2xl mx-auto p-6">
				<div className="flex items-center gap-4 mb-6">
					<div className="w-10 h-10 bg-gray-300 rounded-lg" />
					<div className="h-8 w-32 bg-gray-300 rounded" />
				</div>
				<div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-6">
					<div className="h-4 w-24 bg-gray-300 rounded mb-4" />
					<div className="h-6 w-full bg-gray-300 rounded mb-2" />
					<div className="h-6 w-3/4 bg-gray-300 rounded mb-6" />
					<div className="space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-14 bg-gray-300 rounded-xl" />
						))}
					</div>
					<div className="h-14 bg-gray-300 rounded-xl mt-6" />
				</div>
			</div>
		</div>
	);
}

export function QuestionsView({ user }: QuestionsViewProps) {
	const { homeworkId } = useParams<{ homeworkId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const mode: QuestionViewMode = searchParams.get('mode') === 'review' ? 'review' : 'answering';

	const {
		questionsWithChoices,
		currentQuestion,
		currentIndex,
		isLastQuestion,
		isLoading,
		error,
		isAlreadyCompleted,
		questionIdAndSelectedChoiceId,
		postAnswer,
		goToNext,
	} = useQuestionsViewModel(user, homeworkId || '', mode);

	// Redirect if quiz is already completed (prevent retaking)
	useEffect(() => {
		if (mode === 'answering' && isAlreadyCompleted && homeworkId) {
			navigate(getHomeworkDetailPath(homeworkId), { replace: true });
		}
	}, [mode, isAlreadyCompleted, homeworkId, navigate]);

	// Prevent back navigation during answering mode
	useEffect(() => {
		if (mode === 'answering' && !isAlreadyCompleted) {
			const handlePopState = (e: PopStateEvent) => {
				e.preventDefault();
				// Push state back to prevent navigation
				window.history.pushState(null, '', window.location.href);
			};

			// Push initial state
			window.history.pushState(null, '', window.location.href);
			window.addEventListener('popstate', handlePopState);

			return () => {
				window.removeEventListener('popstate', handlePopState);
			};
		}
	}, [mode, isAlreadyCompleted]);

	// Post initial empty answer when starting to answer (to record that answering has started)
	useEffect(() => {
		if (mode === 'answering' && currentQuestion) {
			postAnswer(currentQuestion.question_id, null);
		}
	}, [mode, currentQuestion?.question_id, postAnswer]);

	const handleNext = useCallback(async (selectedChoiceId: string | null) => {
		if (!currentQuestion || !homeworkId) return;

		// Post the answer
		await postAnswer(currentQuestion.question_id, selectedChoiceId);

		if (isLastQuestion) {
			// Quiz finished, navigate to homework detail (replace to prevent going back)
			navigate(getHomeworkDetailPath(homeworkId), { replace: true });
		} else {
			// Go to next question
			goToNext();
		}
	}, [currentQuestion, homeworkId, isLastQuestion, postAnswer, goToNext, navigate]);

	if (!homeworkId) {
		return (
			<div className="page-bg min-h-screen flex items-center justify-center">
				<p className="text-gray-500">課題が見つかりません</p>
			</div>
		);
	}

	if (isLoading || questionsWithChoices.length === 0) {
		return <QuestionsViewSkeleton />;
	}

	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-2xl mx-auto p-6">
				{/* Header */}
				<header className="flex items-center justify-between mb-6">
					<h1 className="text-xl font-bold text-gray-900 dark:text-white">
						{mode === 'answering' ? '質問一覧' : '回答履歴'}
					</h1>
					{mode === 'answering' && (
						<span className="text-gray-500 dark:text-gray-400">
							{currentIndex + 1} / {questionsWithChoices.length}
						</span>
					)}
				</header>

				{/* Error message */}
				{error && (
					<div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
						{error}
					</div>
				)}

				{/* Questions */}
				{mode === 'answering' ? (
					// Answering mode - show one question at a time
					currentQuestion && (
						<QuestionAndChoicesItemView
							key={currentQuestion.question_id}
							questionAndChoices={currentQuestion}
							mode={mode}
							isLastQuestion={isLastQuestion}
							onClickNext={handleNext}
						/>
					)
				) : (
					// Review mode - show all questions in a scrollable list
					<div className="space-y-6">
						{questionsWithChoices.map((question, index) => (
							<div key={question.question_id}>
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
									問題 {index + 1} / {questionsWithChoices.length}
								</p>
								<QuestionAndChoicesItemView
									questionAndChoices={question}
									mode={mode}
									selectedChoiceIdFromServer={questionIdAndSelectedChoiceId[question.question_id]}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
