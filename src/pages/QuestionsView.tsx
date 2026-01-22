import type { User } from "firebase/auth";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { QuestionAndChoicesItemView } from "../components/QuestionAndChoicesItemView";
import { TestExplanationPreference, TestExplanationView } from "../components/TestExplanationView";
import { useQuestionsViewModel, type QuestionViewMode } from "../hooks/useQuestionsViewModel";
import { getHomeworkDetailPath } from "../router/paths";

interface QuestionsViewProps {
	user: User;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4 },
	},
};

function QuestionsViewSkeleton() {
	return (
		<div className="login-bg min-h-screen">
			<div className="max-w-2xl mx-auto p-6 animate-pulse">
				{/* Header skeleton */}
				<div className="glass-card p-6 mb-6">
					<div className="flex items-center justify-between">
						<div className="h-6 w-32 bg-white/10 rounded" />
						<div className="h-5 w-16 bg-white/10 rounded" />
					</div>
				</div>

				{/* Question skeleton */}
				<div className="glass-card p-6">
					<div className="h-4 w-24 bg-white/10 rounded mb-4" />
					<div className="h-6 w-full bg-white/10 rounded mb-2" />
					<div className="h-6 w-3/4 bg-white/10 rounded mb-6" />
					<div className="space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-14 bg-white/10 rounded-xl" />
						))}
					</div>
					<div className="h-14 bg-white/10 rounded-xl mt-6" />
				</div>
			</div>
		</div>
	);
}

export function QuestionsView({ user }: QuestionsViewProps) {
	const { homeworkId } = useParams<{ homeworkId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const mode: QuestionViewMode = searchParams.get("mode") === "review" ? "review" : "answering";

	// Check if we should show explanation (only for answering mode)
	const [showExplanation, setShowExplanation] = useState(mode === "answering" && TestExplanationPreference.shouldShowExplanation());

	// Store correct choice IDs for review mode
	const [correctChoiceIds, setCorrectChoiceIds] = useState<Record<string, string>>({});

	const {
		questionsWithChoices,
		currentQuestion,
		currentIndex,
		isLastQuestion,
		isLoading,
		error,
		isAlreadyCompleted,
		questionIdAndSelectedChoiceId,
		correctChoiceId,
		postAnswer,
		goToNext,
		loadCorrectChoice,
	} = useQuestionsViewModel(user, homeworkId || "", mode);

	// Redirect if quiz is already completed (prevent retaking)
	useEffect(() => {
		if (mode === "answering" && isAlreadyCompleted && homeworkId) {
			navigate(getHomeworkDetailPath(homeworkId), { replace: true });
		}
	}, [mode, isAlreadyCompleted, homeworkId, navigate]);

	// Prevent back navigation during answering mode (but allow during explanation)
	useEffect(() => {
		if (mode === "answering" && !isAlreadyCompleted && !showExplanation) {
			const handlePopState = (e: PopStateEvent) => {
				e.preventDefault();
				// Push state back to prevent navigation
				window.history.pushState(null, "", window.location.href);
			};

			// Push initial state
			window.history.pushState(null, "", window.location.href);
			window.addEventListener("popstate", handlePopState);

			return () => {
				window.removeEventListener("popstate", handlePopState);
			};
		}
	}, [mode, isAlreadyCompleted, showExplanation]);

	// Post initial empty answer ONCE when starting to answer (to record that answering has started)
	// Only after explanation is dismissed
	const hasPostedInitialAnswer = useRef(false);
	useEffect(() => {
		if (mode === "answering" && currentQuestion && !showExplanation && !hasPostedInitialAnswer.current) {
			postAnswer(currentQuestion.question_id, null);
			hasPostedInitialAnswer.current = true;
		}
	}, [mode, currentQuestion, postAnswer, showExplanation]);

	// Load correct choices for all questions in review mode
	useEffect(() => {
		if (mode === "review" && questionsWithChoices.length > 0) {
			const loadAllCorrectChoices = async () => {
				const correctChoices: Record<string, string> = {};
				for (const question of questionsWithChoices) {
					const choiceId = await loadCorrectChoice(question.question_id);
					if (choiceId) {
						correctChoices[question.question_id] = choiceId;
					}
				}
				setCorrectChoiceIds(correctChoices);
			};
			loadAllCorrectChoices();
		}
	}, [mode, questionsWithChoices, loadCorrectChoice]);

	// Submit answer to API (first step)
	const handleSubmitAnswer = useCallback(
		async (selectedChoiceId: string | null) => {
			if (!currentQuestion || !homeworkId) return;

			// Post the answer - this will set correctChoiceId in the viewModel
			await postAnswer(currentQuestion.question_id, selectedChoiceId);
		},
		[currentQuestion, homeworkId, postAnswer],
	);

	// Navigate to next question (second step)
	const handleNext = useCallback(() => {
		if (!homeworkId) return;

		if (isLastQuestion) {
			// Quiz finished, navigate to homework detail (replace to prevent going back)
			navigate(getHomeworkDetailPath(homeworkId), { replace: true });
		} else {
			// Go to next question
			goToNext();
		}
	}, [homeworkId, isLastQuestion, goToNext, navigate]);

	// Show explanation view if needed
	if (showExplanation) {
		return (
			<TestExplanationView
				onDismiss={() => {
					if (homeworkId) {
						navigate(getHomeworkDetailPath(homeworkId), { replace: true });
					}
				}}
				onStartTest={() => {
					setShowExplanation(false);
				}}
			/>
		);
	}

	if (!homeworkId) {
		return (
			<div className="login-bg min-h-screen flex items-center justify-center">
				<p className="text-gray-400">課題が見つかりません</p>
			</div>
		);
	}

	if (isLoading || questionsWithChoices.length === 0) {
		return <QuestionsViewSkeleton />;
	}

	return (
		<div className="login-bg min-h-screen pb-24">
			{/* Background effects */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
				<div className="absolute bottom-1/3 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
			</div>

			<motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-2xl mx-auto p-6">
				{/* Header */}
				<motion.header variants={itemVariants} className="glass-card p-6 mb-6">
					<div className="flex items-center justify-between">
						<h1 className="text-xl font-bold text-white">{mode === "answering" ? "質問一覧" : "回答履歴"}</h1>
						{mode === "answering" && (
							<span className="text-gray-400 bg-white/10 px-3 py-1 rounded-full text-sm">
								{currentIndex + 1} / {questionsWithChoices.length}
							</span>
						)}
					</div>
				</motion.header>

				{/* Error message */}
				{error && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 glass-card border-red-500/30">
						<span className="text-red-400">{error}</span>
					</motion.div>
				)}

				{/* Questions */}
				<motion.div variants={itemVariants}>
					{mode === "answering" ? (
						// Answering mode - show one question at a time
						currentQuestion && (
							<motion.div key={currentQuestion.question_id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
								<QuestionAndChoicesItemView
									questionAndChoices={currentQuestion}
									mode={mode}
									isLastQuestion={isLastQuestion}
									onSubmitAnswer={handleSubmitAnswer}
									onClickNext={handleNext}
									correctChoiceId={correctChoiceId}
								/>
							</motion.div>
						)
					) : (
						// Review mode - show all questions in a scrollable list
						<div className="space-y-6">
							{questionsWithChoices.map((question, index) => (
								<motion.div key={question.question_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
									<p className="text-sm text-gray-400 mb-2">
										問題 {index + 1} / {questionsWithChoices.length}
									</p>
									<QuestionAndChoicesItemView
										questionAndChoices={question}
										mode={mode}
										selectedChoiceIdFromServer={questionIdAndSelectedChoiceId[question.question_id]}
										correctChoiceId={correctChoiceIds[question.question_id]}
									/>
								</motion.div>
							))}
						</div>
					)}
				</motion.div>
			</motion.div>
		</div>
	);
}
