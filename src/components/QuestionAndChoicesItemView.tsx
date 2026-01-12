import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuestionWithChoices, Choice } from '../types/models';
import type { QuestionViewMode } from '../hooks/useQuestionsViewModel';

interface QuestionAndChoicesItemViewProps {
	questionAndChoices: QuestionWithChoices;
	mode: QuestionViewMode;
	isLastQuestion?: boolean;
	onClickNext?: (selectedChoiceId: string | null) => void;
	selectedChoiceIdFromServer?: string | null; // for review mode
}

const TIMER_DURATION = 20; // seconds

export function QuestionAndChoicesItemView({
	questionAndChoices,
	mode,
	isLastQuestion = false,
	onClickNext,
	selectedChoiceIdFromServer,
}: QuestionAndChoicesItemViewProps) {
	const [remainingTime, setRemainingTime] = useState(TIMER_DURATION);
	const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const onClickNextRef = useRef(onClickNext);

	// Keep onClickNext ref updated
	useEffect(() => {
		onClickNextRef.current = onClickNext;
	}, [onClickNext]);

	// Initialize for review mode
	useEffect(() => {
		if (mode === 'review') {
			setSubmitted(true);
			setSelectedChoiceId(selectedChoiceIdFromServer ?? null);
		}
	}, [mode, selectedChoiceIdFromServer]);

	// Timer logic for answering mode
	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const startTimer = useCallback(() => {
		stopTimer();
		setRemainingTime(TIMER_DURATION);
		timerRef.current = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev <= 1) {
					// Time's up - auto submit with no answer
					clearInterval(timerRef.current!);
					timerRef.current = null;
					// Use ref to avoid stale closure
					onClickNextRef.current?.(null);
					return TIMER_DURATION;
				}
				return prev - 1;
			});
		}, 1000);
	}, [stopTimer]);

	const restartTimer = useCallback(() => {
		setRemainingTime(TIMER_DURATION);
		setSelectedChoiceId(null);
		setSubmitted(false);
		startTimer();
	}, [startTimer]);

	useEffect(() => {
		if (mode === 'answering') {
			startTimer();
		}
		return () => stopTimer();
	}, [mode, questionAndChoices.question_id, startTimer, stopTimer]);

	// Reset state when question changes
	useEffect(() => {
		if (mode === 'answering') {
			setSelectedChoiceId(null);
			setSubmitted(false);
			setRemainingTime(TIMER_DURATION);
		}
	}, [questionAndChoices.question_id, mode]);

	const handleChoiceClick = (choiceId: string) => {
		if (mode === 'answering' && !submitted) {
			setSelectedChoiceId(choiceId);
		}
	};

	const handleSubmit = () => {
		if (!submitted) {
			// Submit answer
			setSubmitted(true);
			stopTimer();
		} else {
			// Go to next question
			onClickNext?.(selectedChoiceId);
			if (!isLastQuestion) {
				restartTimer();
			}
		}
	};

	const isChoiceSelected = (choice: Choice) => {
		if (mode === 'answering') {
			return selectedChoiceId === choice.choice_id;
		}
		return selectedChoiceIdFromServer === choice.choice_id;
	};

	const isSubmitted = mode === 'review' || submitted;

	const buttonLabel = !submitted ? '回答を送信' : isLastQuestion ? '完了' : '次へ';

	const buttonColor = !submitted
		? 'bg-blue-500 hover:bg-blue-600'
		: isLastQuestion
			? 'bg-green-500 hover:bg-green-600'
			: 'bg-orange-500 hover:bg-orange-600';

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
				{/* Timer for answering mode */}
				{mode === 'answering' && (
					<p className={`text-sm font-semibold mb-4 ${remainingTime <= 5 ? 'text-red-500' : 'text-red-400'}`}>
						残り時間: {remainingTime}秒
					</p>
				)}

				{/* Unanswered label for review mode */}
				{mode === 'review' && !selectedChoiceIdFromServer && (
					<p className="text-red-500 text-sm font-semibold mb-4">未回答</p>
				)}

				{/* Question text */}
				<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
					{questionAndChoices.question_text}
				</h3>

				{/* Choices */}
				<div className="space-y-3 mb-6">
					{questionAndChoices.choices.map((choice) => (
						<ChoiceButton
							key={choice.choice_id}
							choice={choice}
							isSelected={isChoiceSelected(choice)}
							submitted={isSubmitted}
							onClick={() => handleChoiceClick(choice.choice_id)}
							disabled={mode === 'review' || submitted}
						/>
					))}
				</div>

				{/* Submit/Next button for answering mode */}
				{mode === 'answering' && (
					<button
						onClick={handleSubmit}
						disabled={!selectedChoiceId && !submitted}
						className={`w-full py-4 font-semibold rounded-xl text-white transition-colors ${
							!selectedChoiceId && !submitted
								? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60'
								: buttonColor
						}`}
					>
						{buttonLabel}
					</button>
				)}
			</div>
		</div>
	);
}

// Choice Button Component
interface ChoiceButtonProps {
	choice: Choice;
	isSelected: boolean;
	submitted: boolean;
	onClick: () => void;
	disabled: boolean;
}

function ChoiceButton({ choice, isSelected, submitted, onClick, disabled }: ChoiceButtonProps) {
	const getIcon = () => {
		if (submitted) {
			if (choice.is_correct) {
				return (
					<svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
					</svg>
				);
			} else if (isSelected) {
				return (
					<svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
					</svg>
				);
			}
			return null;
		}

		if (isSelected) {
			return (
				<svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" />
				</svg>
			);
		}

		return null;
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
				isSelected
					? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
					: 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
			} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
		>
			<span className="text-gray-900 dark:text-white flex-1 pr-4">{choice.choice_text}</span>
			<span className="flex-shrink-0">{getIcon()}</span>
		</button>
	);
}
