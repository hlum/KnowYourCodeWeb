import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QuestionViewMode } from "../hooks/useQuestionsViewModel";
import { remoteConfigManager } from "../managers/remoteConfigManager";
import type { Choice, QuestionWithChoices } from "../types/models";

interface QuestionAndChoicesItemViewProps {
	questionAndChoices: QuestionWithChoices;
	mode: QuestionViewMode;
	isLastQuestion?: boolean;
	onSubmitAnswer?: (selectedChoiceId: string | null) => Promise<void>; // Submit answer to API
	onClickNext?: () => void; // Navigate to next question
	selectedChoiceIdFromServer?: string | null; // for review mode
	correctChoiceId?: string | null; // correct choice ID from server
}

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
	paused?: boolean;
}

function ArcTimerButton({
	duration,
	size = 70,
	lineWidth = 10,
	label = "PUSH",
	accentColor = "#8b5cf6",
	warningColor = "#ef4444",
	warningThreshold = 3,
	onComplete,
	resetTrigger = 0,
	paused = false,
}: ArcTimerButtonProps) {
	const [progress, setProgress] = useState(0);
	const rafRef = useRef<number>(0);
	const startTimeRef = useRef<number>(Date.now());
	const pausedElapsedRef = useRef<number>(0);
	const isPausedRef = useRef(false);
	const onCompleteRef = useRef(onComplete);
	const hasCompletedRef = useRef(false);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	// Handle pause/resume by adjusting start time
	useEffect(() => {
		if (paused && !isPausedRef.current) {
			// Pausing: save the current elapsed time
			pausedElapsedRef.current = (Date.now() - startTimeRef.current) / 1000;
			isPausedRef.current = true;
		} else if (!paused && isPausedRef.current) {
			// Resuming: adjust start time to account for the pause
			startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
			isPausedRef.current = false;
		}
	}, [paused]);

	const remainingSeconds = Math.max(0, Math.ceil((1 - progress) * duration));
	const isWarning = remainingSeconds <= warningThreshold && remainingSeconds > 0;
	const currentColor = isWarning ? warningColor : accentColor;

	// Animation loop using requestAnimationFrame
	useEffect(() => {
		startTimeRef.current = Date.now();
		hasCompletedRef.current = false;
		pausedElapsedRef.current = 0;
		isPausedRef.current = paused;
		setProgress(0);

		const animate = () => {
			if (isPausedRef.current) {
				// When paused, keep requesting frames but don't update progress
				rafRef.current = requestAnimationFrame(animate);
				return;
			}

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
			transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<svg width={size} height={size} className="transform -rotate-90">
				{/* Background circle */}
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={currentColor} strokeOpacity={0.15} strokeWidth={lineWidth} strokeLinecap="round" />
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
				<span className="text-sm font-semibold" style={{ color: isWarning ? warningColor : "white" }}>
					{label}
				</span>
			</div>
		</motion.button>
	);
}

export function QuestionAndChoicesItemView({ questionAndChoices, mode, isLastQuestion = false, onSubmitAnswer, onClickNext, selectedChoiceIdFromServer, correctChoiceId }: QuestionAndChoicesItemViewProps) {
	// Get timer durations from Remote Config
	const MAIN_TIMER_DURATION = remoteConfigManager.mainTimerDuration;
	const ARC_TIMER_DURATION = remoteConfigManager.arcTimerDuration;

	const [remainingTime, setRemainingTime] = useState(MAIN_TIMER_DURATION);
	const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [arcTimerReset, setArcTimerReset] = useState(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const onSubmitAnswerRef = useRef(onSubmitAnswer);

	// Keep onSubmitAnswer ref updated
	useEffect(() => {
		onSubmitAnswerRef.current = onSubmitAnswer;
	}, [onSubmitAnswer]);

	// Initialize for review mode
	useEffect(() => {
		if (mode === "review") {
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
					// Time's up - auto submit with null
					setTimeout(async () => {
						try {
							await onSubmitAnswerRef.current?.(null);
						} catch (error) {
							console.error('Failed to auto-submit answer:', error);
						}
					}, 0);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [stopTimer, MAIN_TIMER_DURATION]);

	const startTimer = useCallback(() => {
		stopTimer();
		setRemainingTime(MAIN_TIMER_DURATION);
		timerRef.current = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current!);
					timerRef.current = null;
					// Time's up - auto submit with null
					setTimeout(async () => {
						try {
							await onSubmitAnswerRef.current?.(null);
						} catch (error) {
							console.error('Failed to auto-submit answer:', error);
						}
					}, 0);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [stopTimer, MAIN_TIMER_DURATION]);

	useEffect(() => {
		if (mode === "answering") {
			startTimer();
		}
		return () => stopTimer();
	}, [mode, questionAndChoices.question_id, startTimer, stopTimer]);

	// Stop timer when answer is submitted
	useEffect(() => {
		if (submitted && mode === "answering") {
			stopTimer();
		}
	}, [submitted, mode, stopTimer]);

	// Reset state when question changes
	useEffect(() => {
		if (mode === "answering") {
			setSelectedChoiceId(null);
			setSubmitted(false);
			setRemainingTime(MAIN_TIMER_DURATION);
			setArcTimerReset((prev) => prev + 1);
		}
	}, [questionAndChoices.question_id, mode, MAIN_TIMER_DURATION]);

	const handleChoiceClick = (choiceId: string) => {
		if (mode === "answering" && !submitted) {
			setSelectedChoiceId(choiceId);
		}
	};

	const handleSubmit = async () => {
		if (!submitted && !isSubmitting) {
			// First click: Submit answer to API
			setIsSubmitting(true);
			try {
				await onSubmitAnswer?.(selectedChoiceId);
				// After successful API response, mark as submitted to show feedback
				setSubmitted(true);
			} catch (error) {
				console.error('Failed to submit answer:', error);
				// On error, allow retry
			} finally {
				setIsSubmitting(false);
			}
		} else if (submitted && !isSubmitting) {
			// Second click: Navigate to next question
			onClickNext?.();
			if (!isLastQuestion) {
				restartTimer();
			}
		}
	};

	// Arc timer complete - auto submit with null answer
	const handleArcTimerComplete = useCallback(async () => {
		if (!submitted) {
			try {
				await onSubmitAnswer?.(null);
			} catch (error) {
				console.error('Failed to auto-submit answer:', error);
			}
		}
	}, [submitted, onSubmitAnswer]);

	const isChoiceSelected = (choice: Choice) => {
		if (mode === "answering") {
			return selectedChoiceId === choice.choice_id;
		}
		return selectedChoiceIdFromServer === choice.choice_id;
	};

	const isSubmitted = mode === "review" || submitted;

	const buttonLabel = !submitted ? "回答を送信" : isLastQuestion ? "完了" : "次へ";

	const buttonColor = !submitted ? "btn-gradient" : isLastQuestion ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600";

	const isWarning = remainingTime <= 5;

	return (
		<div className="w-full max-w-2xl mx-auto select-none">
			<div className="glass-card p-6">
				{/* Timer for answering mode */}
				{mode === "answering" && (
					<motion.p
						className={`text-sm font-semibold mb-4 ${isWarning ? "text-red-400" : "text-red-400/70"}`}
						animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
						transition={{ duration: 0.5, repeat: isWarning ? Infinity : 0 }}
					>
						残り時間: {remainingTime}秒
					</motion.p>
				)}

				{/* Unanswered label for review mode */}
				{mode === "review" && !selectedChoiceIdFromServer && <p className="text-red-400 text-sm font-semibold mb-4">未回答</p>}

				{/* Question text */}
				<h3 className="text-lg font-bold text-white mb-6 leading-relaxed">{questionAndChoices.question_text}</h3>

				{/* Choices */}
				<div className="space-y-3 mb-6">
					{questionAndChoices.choices.map((choice) => (
						<ChoiceButton
							key={choice.choice_id}
							choice={choice}
							isSelected={isChoiceSelected(choice)}
							submitted={isSubmitted}
							onClick={() => handleChoiceClick(choice.choice_id)}
							disabled={mode === "review" || submitted}
					correctChoiceId={correctChoiceId}
						/>
					))}
				</div>

				{/* Submit/Next button for answering mode */}
				{mode === "answering" && (
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleSubmit}
						disabled={(!selectedChoiceId && !submitted) || isSubmitting}
						className={`w-full py-4 font-semibold rounded-xl text-white transition-all ${(!selectedChoiceId && !submitted) || isSubmitting ? "bg-white/10 cursor-not-allowed opacity-60" : buttonColor}`}
					>
						{isSubmitting ? (
					<div className="flex items-center justify-center gap-2">
						<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>送信中...</span>
					</div>
				) : (
					buttonLabel
				)}
					</motion.button>
				)}
			</div>

			{/* Arc Timer Button - always visible in answering mode */}
			{mode === "answering" && (
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
					paused={submitted}
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
	correctChoiceId?: string | null;
}

function ChoiceButton({ choice, isSelected, submitted, onClick, disabled, correctChoiceId }: ChoiceButtonProps) {
	const getIcon = () => {
		if (submitted && correctChoiceId) {
			if (choice.choice_id === correctChoiceId) {
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
		if (submitted && correctChoiceId) {
			if (choice.choice_id === correctChoiceId) {
				return "bg-green-500/20 border-green-500/50";
			} else if (isSelected) {
				return "bg-red-500/20 border-red-500/50";
			}
			return "bg-white/5 border-white/10";
		}
		if (isSelected) {
			return "bg-purple-500/20 border-purple-500/50";
		}
		return "bg-white/5 border-white/10 hover:bg-white/10";
	};

	return (
		<motion.button
			whileHover={!disabled ? { scale: 1.01 } : {}}
			whileTap={!disabled ? { scale: 0.99 } : {}}
			onClick={onClick}
			disabled={disabled}
			className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all border-2 ${getBackgroundClass()} ${disabled ? "cursor-default" : "cursor-pointer"}`}
		>
			<span className="text-white flex-1 pr-4">{choice.choice_text}</span>
			<span className="shrink-0">{getIcon()}</span>
		</motion.button>
	);
}
