import type { User } from "firebase/auth";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import aiAnimation from "../assets/AI.json";
import nekoThinkingAnimation from "../assets/nekoThinking.json";
import { useHomeworkDetailViewModel } from "../hooks/useHomeworkDetailViewModel";
import { getHomeworkQuestionsPath } from "../router/paths";
import { validateSubmissionUrl } from "../utils/urlValidation";

interface HomeworkDetailViewProps {
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

function HomeworkDetailSkeleton() {
	return (
		<div className="login-bg min-h-screen">
			<div className="max-w-3xl mx-auto p-6 animate-pulse">
				{/* Header skeleton */}
				<div className="glass-card p-6 mb-6">
					<div className="h-6 w-32 bg-white/10 rounded" />
				</div>

				{/* Content skeleton */}
				<div className="glass-card p-6 space-y-4">
					<div className="h-8 w-3/4 bg-white/10 rounded" />
					<div className="h-4 w-1/2 bg-white/10 rounded" />
					<div className="h-4 w-1/3 bg-white/10 rounded" />
					<div className="h-20 w-full bg-white/10 rounded mt-4" />
				</div>
			</div>
		</div>
	);
}

function formatDueDate(dueDate: string | null | undefined): string {
	if (!dueDate) return "締切期限未設定";
	return `締切：${dueDate}`;
}

export function HomeworkDetailView({ user }: HomeworkDetailViewProps) {
	const { homeworkId } = useParams<{ homeworkId: string }>();

	const {
		homework,
		classDetail,
		result,
		isLoading,
		error,
		refresh,
		homeworkLinkTxt,
		setHomeworkLinkTxt,
		isSubmitting,
		inputErrorMessage,
		uploadProject,
		retryQuestionGeneration,
		cancelHomeworkSubmission,
	} = useHomeworkDetailViewModel(user, homeworkId || "");

	// Refresh data when page becomes visible (e.g., after returning from quiz)
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				refresh();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Also refresh on mount in case we navigated back
		refresh();

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [refresh]);

	if (!homeworkId) {
		return (
			<div className="login-bg min-h-screen flex items-center justify-center">
				<p className="text-gray-400">課題が見つかりません</p>
			</div>
		);
	}

	if (isLoading) {
		return <HomeworkDetailSkeleton />;
	}

	if (!homework) {
		return (
			<div className="login-bg min-h-screen">
				<div className="max-w-3xl mx-auto p-6">
					<div className="glass-card p-8 text-center">
						<p className="text-gray-400">{error || "課題が見つかりません"}</p>
						<button onClick={refresh} className="mt-4 text-purple-400 hover:text-purple-300 font-semibold">
							再試行
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="login-bg min-h-screen pb-24">
			{/* Background effects */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
				<div className="absolute bottom-1/3 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
			</div>

			<motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-3xl mx-auto p-6">
				{/* Header */}
				<motion.header variants={itemVariants} className="glass-card p-6 mb-6">
					<h1 className="text-xl font-bold text-white">課題の詳細</h1>
				</motion.header>

				{/* Error message */}
				{error && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 glass-card border-red-500/30 flex items-center justify-between">
						<span className="text-red-400">{error}</span>
						<button onClick={refresh} className="text-red-400 hover:text-red-300 font-semibold">
							再試行
						</button>
					</motion.div>
				)}

				{/* Homework info card */}
				<motion.div variants={itemVariants} className="glass-card p-6 mb-6">
					<div className="flex items-start justify-between mb-4">
						<h2 className="text-2xl font-bold text-white">{homework.title}</h2>
						{result !== null && result?.score !== undefined && (
							<div className="relative flex items-center justify-center w-16 h-16">
								{/* Gradient circle border */}
								<svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
									<defs>
										<linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
											<stop offset="0%" stopColor="#a855f7" />
											<stop offset="100%" stopColor="#ec4899" />
										</linearGradient>
									</defs>
									<circle cx="32" cy="32" r="28" fill="none" stroke="url(#scoreGradient)" strokeWidth="4" />
								</svg>
								<span className="text-sm font-bold text-white">{result.id}点</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2 text-gray-400 mb-2">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path d="M12 14l9-5-9-5-9 5 9 5z" />
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
							/>
						</svg>
						<span>{classDetail?.name || "科目名"}</span>
					</div>

					<div className="flex items-center gap-2 text-gray-400 mb-4">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<span>{formatDueDate(homework.due_date)}</span>
					</div>

					<p className="text-gray-300">{homework.description || "説明はありません。"}</p>
				</motion.div>

				{/* Divider */}
				<motion.div variants={itemVariants} className="border-t border-white/10 mb-6" />

				{/* State-specific content */}
				<motion.div variants={itemVariants}>
					{homework.submission_state === "notAssigned" && (
						<NotAssignedState
							homeworkLinkTxt={homeworkLinkTxt}
							setHomeworkLinkTxt={setHomeworkLinkTxt}
							isSubmitting={isSubmitting}
							inputErrorMessage={inputErrorMessage}
							onSubmit={uploadProject}
						/>
					)}

					{homework.submission_state === "generatingQuestions" && <GeneratingQuestionsState />}

					{homework.submission_state === "questionGenerated" && <QuestionGeneratedState homeworkId={homeworkId} currentState={homework.submission_state} />}

					{homework.submission_state === "failed" && <FailedState onRetry={retryQuestionGeneration} onCancel={cancelHomeworkSubmission} />}

					{homework.submission_state === "completed" && <CompletedState homeworkId={homeworkId} />}
				</motion.div>
			</motion.div>
		</div>
	);
}

// Not Assigned State - Show submit form
interface NotAssignedStateProps {
	homeworkLinkTxt: string;
	setHomeworkLinkTxt: (value: string) => void;
	isSubmitting: boolean;
	inputErrorMessage: string;
	onSubmit: () => void;
}

function NotAssignedState({ homeworkLinkTxt, setHomeworkLinkTxt, isSubmitting, inputErrorMessage, onSubmit }: NotAssignedStateProps) {
	const [realtimeError, setRealtimeError] = useState<string>("");

	const handleInputChange = (value: string) => {
		setHomeworkLinkTxt(value);

		// Clear realtime error when input is empty
		if (!value.trim()) {
			setRealtimeError("");
			return;
		}

		// Validate in real-time
		const validation = validateSubmissionUrl(value);
		if (!validation.isValid) {
			setRealtimeError(validation.error || "");
		} else {
			setRealtimeError("");
		}
	};

	// Show either submission error or realtime validation error
	const displayError = inputErrorMessage || realtimeError;
	const hasValidationError = !homeworkLinkTxt.trim() || !!realtimeError;

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-white">提出リンク (GitHub または Google Drive)</h3>

			<input
				type="url"
				value={homeworkLinkTxt}
				onChange={(e) => handleInputChange(e.target.value)}
				placeholder="例: https://github.com/username/repository"
				className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
				disabled={isSubmitting}
			/>

			<div className="space-y-2">
				<div className="flex items-start gap-2 text-gray-400 text-sm">
					<svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>GitHubの場合は、リポジトリのHTTPS URLを入力してください（git cloneで使用できる形式）。</span>
				</div>
				<div className="flex items-start gap-2 text-gray-400 text-sm">
					<svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Google Driveの場合は、ファイルを圧縮し、「リンクを知っている全員がアクセス可能」に設定してください。</span>
				</div>
			</div>

			{displayError && <p className="text-red-400 text-sm">{displayError}</p>}

			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={onSubmit}
				disabled={hasValidationError || isSubmitting}
				className={`w-full py-4 font-semibold rounded-full transition-all ${hasValidationError || isSubmitting ? "bg-white/10 text-gray-500 cursor-not-allowed" : "btn-gradient"}`}
			>
				{isSubmitting ? (
					<span className="flex items-center justify-center gap-2">
						<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
						提出中...
					</span>
				) : (
					"提出する"
				)}
			</motion.button>
		</div>
	);
}

// Generating Questions State - Show thinking animation
function GeneratingQuestionsState() {
	return (
		<div className="flex flex-col items-center py-8">
			<div className="w-64 h-64">
				<Lottie animationData={nekoThinkingAnimation} loop={true} />
			</div>
			<p className="text-center text-gray-400 mt-4">
				猫ちゃん考え中です。
				<br />
				クイズが用意出来次第通知します。
			</p>
		</div>
	);
}

// Question Generated State - Show answer button
interface QuestionGeneratedStateProps {
	homeworkId: string;
	currentState: string;
}

function QuestionGeneratedState({ homeworkId, currentState }: QuestionGeneratedStateProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		// Double-check state before navigating (prevent retaking)
		if (currentState !== "questionGenerated") {
			return;
		}
		navigate(getHomeworkQuestionsPath(homeworkId), { replace: true });
	};

	return (
		<motion.button
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={handleClick}
			className="w-full py-4 btn-gradient font-semibold rounded-full flex items-center justify-center gap-2"
		>
			<div className="w-8 h-8">
				<Lottie animationData={aiAnimation} loop={true} />
			</div>
			AI クイズに回答
		</motion.button>
	);
}

// Failed State - Show retry and cancel buttons
interface FailedStateProps {
	onRetry: () => void;
	onCancel: () => void;
}

function FailedState({ onRetry, onCancel }: FailedStateProps) {
	return (
		<div className="space-y-4">
			<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onRetry} className="w-full py-4 btn-gradient font-semibold rounded-full transition-all">
				生成やり直す
			</motion.button>

			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={onCancel}
				className="w-full py-4 border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold rounded-full transition-colors"
			>
				提出を取り消す
			</motion.button>
		</div>
	);
}

// Completed State - Show review button
interface CompletedStateProps {
	homeworkId: string;
}

function CompletedState({ homeworkId }: CompletedStateProps) {
	const navigate = useNavigate();

	return (
		<motion.button
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={() => {
				navigate(getHomeworkQuestionsPath(homeworkId, "review"));
			}}
			className="w-full py-4 btn-gradient font-semibold rounded-full transition-all"
		>
			回答履歴を見る
		</motion.button>
	);
}
