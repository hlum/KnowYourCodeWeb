import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { QuestionWithChoices, Choice } from '../types/models';
import type { QuestionViewMode } from '../hooks/useQuestionsViewModel';

interface QuestionAndChoicesItemViewProps {
	questionAndChoices: QuestionWithChoices;
	mode: QuestionViewMode;
	isLastQuestion?: boolean;
	onClickNext?: (selectedChoiceId: string | null) => void;
	selectedChoiceIdFromServer?: string | null; // for review mode
}

const MAIN_TIMER_DURATION = 20; // seconds for main timer
const ARC_TIMER_DURATION = 10; // seconds for arc timer button

// Arc Timer Button Component - uses requestAnimationFrame for smooth animation
interface ArcTimerButtonProps {
	duration: number;
	size?: number;
	lineWidth?: number;
	label?: string;
	accentColor?: string;
	warningColor?: string;
	warningThreshold?: number;
	onComplete?: () => void;
	resetTrigger?: number;
}

function ArcTimerButton({
	duration,
	size = 70,
	lineWidth = 10,
	label = "PUSH",
	accentColor = '#8b5cf6',
	warningColor = '#ef4444',
	warningThreshold = 3,
	onComplete,
	resetTrigger = 0,
}: ArcTimerButtonProps) {
	const [progress, setProgress] = useState(0);
	const rafRef = useRef<number>(0);
	const startTimeRef = useRef<number>(Date.now());
	const onCompleteRef = useRef(onComplete);
	const hasCompletedRef = useRef(false);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	const remainingSeconds = Math.max(0, Math.ceil((1 - progress) * duration));
	const isWarning = remainingSeconds <= warningThreshold && remainingSeconds > 0;
	const currentColor = isWarning ? warningColor : accentColor;

	// Animation loop using requestAnimationFrame
	useEffect(() => {
		startTimeRef.current = Date.now();
		hasCompletedRef.current = false;
		setProgress(0);

		const animate = () => {
			const elapsed = (Date.now() - startTimeRef.current) / 1000;
			const newProgress = Math.min(1, elapsed / duration);
			setProgress(newProgress);

			if (newProgress >= 1 && !hasCompletedRef.current) {
				hasCompletedRef.current = true;
				onCompleteRef.current?.();
				// Restart after completion
				startTimeRef.current = Date.now();
				hasCompletedRef.current = false;
			}

			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(rafRef.current);
	}, [duration, resetTrigger]);

	const handleClick = () => {
		// Full reset - restart from beginning
		startTimeRef.current = Date.now();
		hasCompletedRef.current = false;
		setProgress(0);
	};

	const radius = (size - lineWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference * progress;

	return (
		<motion.button
			onClick={handleClick}
			animate={{ scale: [1, 1.05, 1] }}
			transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<svg width={size} height={size} className="transform -rotate-90">
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={currentColor}
					strokeOpacity={0.15}
					strokeWidth={lineWidth}
					strokeLinecap="round"
				/>
				{/* Progress arc */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={currentColor}
					strokeWidth={lineWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span 
					className="text-sm font-semibold"
					style={{ color: isWarning ? warningColor : 'white' }}
				>
					{label}
				</span>
			</div>
		</motion.button>
	);
}

export function QuestionAndChoicesItemView({
	questionAndChoices,
	mode,
	isLastQuestion = false,
	onClickNext,
	selectedChoiceIdFromServer,
}: QuestionAndChoicesItemViewProps) {
	const [remainingTime, setRemainingTime] = useState(MAIN_TIMER_DURATION);
	const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const [arcTimerReset, setArcTimerReset] = useState(0);
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

	// Main Timer logic for answering mode
	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const restartTimer = useCallback(() => {
		stopTimer();
		setRemainingTime(MAIN_TIMER_DURATION);
		setSelectedChoiceId(null);
		setSubmitted(false);
		setArcTimerReset((prev) => prev + 1);
		
		timerRef.current = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current!);
					timerRef.current = null;
					// Time's up - auto submit with null and go to next
					setTimeout(() => {
						onClickNextRef.current?.(null);
					}, 0);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [stopTimer]);

	const startTimer = useCallback(() => {
		stopTimer();
		setRemainingTime(MAIN_TIMER_DURATION);
		timerRef.current = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current!);
					timerRef.current = null;
					// Time's up - auto submit with null and go to next
					setTimeout(() => {
						onClickNextRef.current?.(null);
					}, 0);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [stopTimer]);

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
			setRemainingTime(MAIN_TIMER_DURATION);
			setArcTimerReset((prev) => prev + 1);
		}
	}, [questionAndChoices.question_id, mode]);

	const handleChoiceClick = (choiceId: string) => {
		if (mode === 'answering' && !submitted) {
			setSelectedChoiceId(choiceId);
		}
	};

	const handleSubmit = () => {
		if (!submitted) {
			// Submit answer - show correct/incorrect
			setSubmitted(true);
		} else {
			// Go to next question
			onClickNext?.(selectedChoiceId);
			if (!isLastQuestion) {
				restartTimer();
			}
		}
	};

	// Arc timer complete - go to next question with null
	const handleArcTimerComplete = useCallback(() => {
		onClickNextRef.current?.(null);
		if (!isLastQuestion) {
			setRemainingTime(MAIN_TIMER_DURATION);
			setSelectedChoiceId(null);
			setSubmitted(false);
		}
	}, [isLastQuestion]);

	const isChoiceSelected = (choice: Choice) => {
		if (mode === 'answering') {
			return selectedChoiceId === choice.choice_id;
		}
		return selectedChoiceIdFromServer === choice.choice_id;
	};

	const isSubmitted = mode === 'review' || submitted;

	const buttonLabel = !submitted ? '回答を送信' : isLastQuestion ? '完了' : '次へ';

	const buttonColor = !submitted
		? 'btn-gradient'
		: isLastQuestion
			? 'bg-green-500 hover:bg-green-600'
			: 'bg-orange-500 hover:bg-orange-600';

	const isWarning = remainingTime <= 5;

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="glass-card p-6">
				{/* Timer for answering mode */}
				{mode === 'answering' && (
					<motion.p
						className={`text-sm font-semibold mb-4 ${isWarning ? 'text-red-400' : 'text-red-400/70'}`}
						animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
						transition={{ duration: 0.5, repeat: isWarning ? Infinity : 0 }}
					>
						残り時間: {remainingTime}秒
					</motion.p>
				)}

				{/* Unanswered label for review mode */}
				{mode === 'review' && !selectedChoiceIdFromServer && (
					<p className="text-red-400 text-sm font-semibold mb-4">未回答</p>
				)}

				{/* Question text */}
				<h3 className="text-lg font-bold text-white mb-6 leading-relaxed">
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
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleSubmit}
						disabled={!selectedChoiceId && !submitted}
						className={`w-full py-4 font-semibold rounded-xl text-white transition-all ${
							!selectedChoiceId && !submitted
								? 'bg-white/10 cursor-not-allowed opacity-60'
								: buttonColor
						}`}
					>
						{buttonLabel}
					</motion.button>
				)}
			</div>

			{/* Arc Timer Button - always visible in answering mode */}
			{mode === 'answering' && (
				<div className="flex justify-center mt-6">
					<ArcTimerButton
						duration={ARC_TIMER_DURATION}
						size={70}
						lineWidth={10}
						label="PUSH"
						accentColor="#8b5cf6"
						warningColor="#ef4444"
						warningThreshold={3}
						onComplete={handleArcTimerComplete}
						resetTrigger={arcTimerReset}
					/>
				</div>
			)}
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
					<svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
					</svg>
				);
			} else if (isSelected) {
				return (
					<svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
					</svg>
				);
			}
			return null;
		}

		if (isSelected) {
			return (
				<svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" />
				</svg>
			);
		}

		return null;
	};

	// Determine background based on state
	const getBackgroundClass = () => {
		if (submitted) {
			if (choice.is_correct) {
				return 'bg-green-500/20 border-green-500/50';
			} else if (isSelected) {
				return 'bg-red-500/20 border-red-500/50';
			}
			return 'bg-white/5 border-white/10';
		}
		if (isSelected) {
			return 'bg-purple-500/20 border-purple-500/50';
		}
		return 'bg-white/5 border-white/10 hover:bg-white/10';
	};

	return (
		<motion.button
			whileHover={!disabled ? { scale: 1.01 } : {}}
			whileTap={!disabled ? { scale: 0.99 } : {}}
			onClick={onClick}
			disabled={disabled}
			className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all border-2 ${getBackgroundClass()} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
		>
			<span className="text-white flex-1 pr-4">{choice.choice_text}</span>
			<span className="flex-shrink-0">{getIcon()}</span>
		</motion.button>
	);
}
