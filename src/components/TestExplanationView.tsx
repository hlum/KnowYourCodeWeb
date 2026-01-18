import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { remoteConfigManager } from '../managers/remoteConfigManager';

interface TestExplanationViewProps {
	onDismiss: () => void;
	onStartTest: () => void;
}

// Arc Timer Button Component (simplified for explanation)
interface ArcTimerButtonProps {
	duration: number;
	size?: number;
	lineWidth?: number;
	label?: string;
	accentColor?: string;
	warningColor?: string;
	disabled?: boolean;
}

function ArcTimerButton({
	duration,
	size = 80,
	lineWidth = 10,
	label = 'PUSH',
	accentColor = '#3b82f6',
	warningColor = '#ef4444',
	disabled = false,
}: ArcTimerButtonProps) {
	const [progress, setProgress] = useState(0);
	const rafRef = useRef<number>(0);
	const startTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		if (disabled) return;

		startTimeRef.current = Date.now();
		setProgress(0);

		const animate = () => {
			const elapsed = (Date.now() - startTimeRef.current) / 1000;
			const newProgress = Math.min(1, elapsed / duration);
			setProgress(newProgress);

			if (newProgress >= 1) {
				startTimeRef.current = Date.now();
			}

			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(rafRef.current);
	}, [duration, disabled]);

	const handleClick = () => {
		// Full reset - restart from beginning
		startTimeRef.current = Date.now();
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
			className="relative flex items-center justify-center cursor-pointer"
			style={{ width: size, height: size }}
		>
			<svg width={size} height={size} className="transform -rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={accentColor}
					strokeOpacity={0.15}
					strokeWidth={lineWidth}
					strokeLinecap="round"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={accentColor}
					strokeWidth={lineWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-sm font-semibold text-white">{label}</span>
			</div>
		</motion.button>
	);
}

export function TestExplanationView({ onDismiss, onStartTest }: TestExplanationViewProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [dontShowAgain, setDontShowAgain] = useState(false);
	const [animatedTimerValue, setAnimatedTimerValue] = useState(60);
	const totalSteps = 5;

	// Animated timer for step 1
	useEffect(() => {
		if (currentStep === 0) {
			const interval = setInterval(() => {
				setAnimatedTimerValue((prev) => (prev > 0 ? prev - 1 : 60));
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [currentStep]);

	const handleNext = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			if (dontShowAgain) {
				localStorage.setItem('dontShowTestExplanation', 'true');
			}
			onStartTest();
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 shadow-2xl"
			>
				{/* Header */}
				<div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
					<div className="flex items-center justify-between p-6">
						<button
							onClick={onDismiss}
							className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
							</svg>
							<span className="font-semibold">キャンセル</span>
						</button>
					</div>

					<div className="px-6 pb-6">
						<h1 className="text-3xl font-bold text-white mb-3">テストの説明</h1>
						<p className="text-sm text-gray-400">
							始める前に重要な情報を確認してください
						</p>
					</div>

					{/* Progress Indicator */}
					<div className="flex gap-2 px-10 pb-6">
						{Array.from({ length: totalSteps }).map((_, index) => (
							<div
								key={index}
								className={`h-1 flex-1 rounded-full transition-all duration-300 ${
									index <= currentStep ? 'bg-purple-500' : 'bg-gray-700'
								}`}
							/>
						))}
					</div>
				</div>

				{/* Content */}
				<div className="overflow-y-auto max-h-[calc(90vh-280px)] p-8">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
						>
							{currentStep === 0 && <StepMainTimer animatedTimerValue={animatedTimerValue} />}
							{currentStep === 1 && <StepArcTimer />}
							{currentStep === 2 && <StepArcTimerAction />}
							{currentStep === 3 && <StepNoReturn />}
							{currentStep === 4 && <StepFinalConfirmation />}
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Bottom Controls */}
				<div className="border-t border-white/10 bg-black/20 backdrop-blur-sm p-6">
					{/* Don't show again toggle */}
					{currentStep === totalSteps - 1 && (
						<div className="flex items-center gap-3 mb-4">
							<input
								type="checkbox"
								id="dontShowAgain"
								checked={dontShowAgain}
								onChange={(e) => setDontShowAgain(e.target.checked)}
								className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-2 focus:ring-purple-500"
							/>
							<label htmlFor="dontShowAgain" className="text-sm text-gray-300 cursor-pointer">
								次回から表示しない
							</label>
						</div>
					)}

					{/* Navigation Buttons */}
					<div className="flex gap-4">
						{currentStep > 0 && (
							<button
								onClick={handleBack}
								className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-purple-500 text-purple-400 font-semibold hover:bg-purple-500/10 transition-all"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
								</svg>
								戻る
							</button>
						)}
						<button
							onClick={handleNext}
							className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
								currentStep === totalSteps - 1
									? 'bg-green-500 hover:bg-green-600'
									: 'bg-purple-500 hover:bg-purple-600'
							}`}
						>
							{currentStep < totalSteps - 1 ? '次へ' : 'テストを開始'}
							{currentStep < totalSteps - 1 && (
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
								</svg>
							)}
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

// Step Components
function StepMainTimer({ animatedTimerValue }: { animatedTimerValue: number }) {
	return (
		<div className="space-y-6">
			{/* Illustration */}
			<div className="glass-card p-6 h-32 flex items-start">
				<div className="inline-flex items-center px-4 py-3 rounded-xl bg-red-500/10 border-2 border-red-500">
					<span className="font-bold text-red-500">残り時間: {animatedTimerValue}秒</span>
				</div>
			</div>

			{/* Explanation */}
			<div className="glass-card p-6 bg-blue-500/5">
				<div className="flex gap-4">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
							1
						</div>
					</div>
					<div className="space-y-3">
						<h3 className="text-xl font-bold text-white">メインタイマー</h3>
						<p className="text-gray-300">左上の赤いタイマーは質問ごとの制限時間です。</p>
						<p className="text-gray-300">時間切れになると自動的に次の質問に進みます。</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function StepArcTimer() {
	return (
		<div className="space-y-6">
			{/* Illustration */}
			<div className="glass-card p-8 flex flex-col items-center gap-8">
				<p className="text-sm text-gray-400">画面下部</p>
				<ArcTimerButton
					duration={10}
					size={80}
					lineWidth={10}
					label="PUSH"
					accentColor="#3b82f6"
					disabled={true}
				/>
			</div>

			{/* Explanation */}
			<div className="glass-card p-6 bg-orange-500/5">
				<div className="flex gap-4">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
							2
						</div>
					</div>
					<div className="space-y-3">
						<h3 className="text-xl font-bold text-white">アークタイマー</h3>
						<p className="text-gray-300">画面下部の円形タイマーは10秒ごとにリセットされます。</p>
						<p className="text-gray-300">このタイマーは常に動いています。</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function StepArcTimerAction() {
	return (
		<div className="space-y-6">
			{/* Interactive Illustration */}
			<div className="glass-card p-8 flex flex-col items-center gap-8">
				<p className="text-lg font-bold text-blue-400">タップしてリセット!</p>
				<ArcTimerButton duration={10} size={80} lineWidth={10} label="PUSH" accentColor="#3b82f6" />
			</div>

			{/* Explanation */}
			<div className="glass-card p-6 bg-red-500/5">
				<div className="flex gap-4">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
							3
						</div>
					</div>
					<div className="space-y-3">
						<h3 className="text-xl font-bold text-red-400">重要: 10秒ごとにタップ!</h3>
						<p className="text-gray-300">
							アークタイマーが一周する前(10秒以内)に必ずタップしてください。
						</p>
						<p className="text-red-400 font-semibold">
							タップし忘れると、自動的に次の質問に進んでしまいます。
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function StepNoReturn() {
	return (
		<div className="space-y-6">
			{/* Warning Illustration */}
			<div className="glass-card p-8 flex flex-col items-center gap-6">
				<svg className="w-20 h-20 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
					<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
				</svg>
				<h2 className="text-3xl font-bold text-orange-500">注意!</h2>
			</div>

			{/* Warnings */}
			<div className="glass-card p-6 bg-orange-500/5">
				<div className="flex gap-4">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
							4
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-white">戻ることができません</h3>

						<div className="space-y-3">
							<div className="flex gap-3">
								<svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
								</svg>
								<p className="text-gray-300">
									テストを開始すると、途中で戻ることはできません。
								</p>
							</div>

							<div className="flex gap-3">
								<svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
								</svg>
								<p className="text-gray-300">
									アプリを閉じたり、戻るボタンを押すと、再受験できなくなります。
								</p>
							</div>

							<div className="flex gap-3">
								<svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
								</svg>
								<p className="text-gray-300">
									集中できる環境で、最後まで完了する準備をしてから始めてください。
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function StepFinalConfirmation() {
	return (
		<div className="space-y-6">
			{/* Ready Illustration */}
			<div className="glass-card p-8 flex flex-col items-center gap-6">
				<svg className="w-20 h-20 text-green-500" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
				</svg>
				<h2 className="text-3xl font-bold text-white">準備完了!</h2>
			</div>

			{/* Summary */}
			<div className="glass-card p-6 bg-green-500/5">
				<div className="flex gap-4">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
							5
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-white">テスト概要</h3>

						<div className="space-y-3">
							<SummaryRow
								icon={
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
									</svg>
								}
								color="text-red-500"
								text="メインタイマー(左上)で各質問の時間管理"
							/>
							<SummaryRow
								icon={
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
									</svg>
								}
								color="text-orange-500"
								text="アークタイマー(下部)を10秒ごとにタップ"
							/>
							<SummaryRow
								icon={
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z" />
									</svg>
								}
								color="text-purple-500"
								text="タイマーを忘れると次の質問へ自動移動"
							/>
							<SummaryRow
								icon={
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
									</svg>
								}
								color="text-blue-500"
								text="開始後は戻れません・再受験不可"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper Component
function SummaryRow({ icon, color, text }: { icon: React.ReactNode; color: string; text: string }) {
	return (
		<div className="flex gap-3 items-start">
			<div className={`flex-shrink-0 ${color}`}>{icon}</div>
			<p className="text-gray-300">{text}</p>
		</div>
	);
}

// Preference Manager
export class TestExplanationPreference {
	private static readonly KEY = 'dontShowTestExplanation';

	static shouldShowExplanation(): boolean {
		return localStorage.getItem(this.KEY) !== 'true';
	}

	static setDontShowAgain(value: boolean): void {
		if (value) {
			localStorage.setItem(this.KEY, 'true');
		} else {
			localStorage.removeItem(this.KEY);
		}
	}

	static reset(): void {
		localStorage.removeItem(this.KEY);
	}
}
