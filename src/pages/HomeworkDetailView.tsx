import { useEffect } from "react";
import type { User } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { useHomeworkDetailViewModel } from "../hooks/useHomeworkDetailViewModel";
import { getHomeworkQuestionsPath } from "../router/paths";
import nekoThinkingAnimation from "../assets/nekoThinking.json";
import aiAnimation from "../assets/AI.json";

interface HomeworkDetailViewProps {
	user: User;
}

function HomeworkDetailSkeleton() {
	return (
		<div className="page-bg min-h-screen animate-pulse">
			<div className="max-w-3xl mx-auto p-6">
				<div className="flex items-center gap-4 mb-6">
					<div className="w-10 h-10 bg-gray-300 rounded-lg" />
					<div className="h-8 w-40 bg-gray-300 rounded" />
				</div>
				<div className="space-y-4">
					<div className="h-8 w-3/4 bg-gray-300 rounded" />
					<div className="h-4 w-1/2 bg-gray-300 rounded" />
					<div className="h-4 w-1/3 bg-gray-300 rounded" />
					<div className="h-20 w-full bg-gray-300 rounded mt-4" />
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
			if (document.visibilityState === 'visible') {
				refresh();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		// Also refresh on mount in case we navigated back
		refresh();

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [refresh]);

	if (!homeworkId) {
		return (
			<div className="page-bg min-h-screen flex items-center justify-center">
				<p className="text-gray-500">課題が見つかりません</p>
			</div>
		);
	}

	if (isLoading) {
		return <HomeworkDetailSkeleton />;
	}

	if (!homework) {
		return (
			<div className="page-bg min-h-screen">
				<div className="max-w-3xl mx-auto p-6">
					<div className="card p-8 text-center">
						<p className="text-gray-500 dark:text-gray-400">{error || "課題が見つかりません"}</p>
						<button onClick={refresh} className="mt-4 text-purple-600 hover:text-purple-700 font-semibold">
							再試行
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-3xl mx-auto p-6">
				{/* Header */}
				<header className="mb-6">
					<h1 className="text-xl font-bold text-gray-900 dark:text-white">課題の詳細</h1>
				</header>

				{/* Error message */}
				{error && (
					<div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-center justify-between">
						<span>{error}</span>
						<button onClick={refresh} className="text-red-700 hover:text-red-900 font-semibold">
							再試行
						</button>
					</div>
				)}

				{/* Homework info card */}
				<div className="card p-6 mb-6">
					<div className="flex items-start justify-between mb-4">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{homework.title}</h2>
						{result?.score !== undefined && (
							<div className="relative flex items-center justify-center w-16 h-16">
								{/* Gradient circle border */}
								<svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
									<defs>
										<linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
											<stop offset="0%" stopColor="#a855f7" />
											<stop offset="100%" stopColor="#ec4899" />
										</linearGradient>
									</defs>
									<circle
										cx="32"
										cy="32"
										r="28"
										fill="none"
										stroke="url(#scoreGradient)"
										strokeWidth="4"
									/>
								</svg>
								<span className="text-sm font-bold text-gray-900 dark:text-white">{result.score}点</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path d="M12 14l9-5-9-5-9 5 9 5z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
						</svg>
						<span>{classDetail?.name || "科目名"}</span>
					</div>

					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<span>{formatDueDate(homework.due_date)}</span>
					</div>

					<p className="text-gray-700 dark:text-gray-300">{homework.description || "説明はありません。"}</p>
				</div>

				<hr className="border-gray-200 dark:border-gray-700 mb-6" />

				{/* State-specific content */}
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

				{homework.submission_state === "questionGenerated" && (
					<QuestionGeneratedState homeworkId={homeworkId} />
				)}

				{homework.submission_state === "failed" && (
					<FailedState
						onRetry={retryQuestionGeneration}
						onCancel={cancelHomeworkSubmission}
					/>
				)}

				{homework.submission_state === "completed" && (
					<CompletedState homeworkId={homeworkId} />
				)}
			</div>
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

function NotAssignedState({
	homeworkLinkTxt,
	setHomeworkLinkTxt,
	isSubmitting,
	inputErrorMessage,
	onSubmit,
}: NotAssignedStateProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
				提出リンク (GitHub または Google Drive)
			</h3>

			<input
				type="url"
				value={homeworkLinkTxt}
				onChange={(e) => setHomeworkLinkTxt(e.target.value)}
				placeholder="例: https://github.com/your-username/your-repository"
				className="w-full px-5 py-4 bg-gray-100 dark:bg-gray-800 border border-purple-300/40 rounded-full text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
				disabled={isSubmitting}
			/>

			<div className="flex items-start gap-2 text-gray-500 dark:text-gray-400 text-sm">
				<svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>
					Google Driveで提出する場合は、ファイルを圧縮し、「リンクを知っている全員がアクセス可能」に設定してください。
				</span>
			</div>

			{inputErrorMessage && (
				<p className="text-red-500 text-sm">{inputErrorMessage}</p>
			)}

			<button
				onClick={onSubmit}
				disabled={!homeworkLinkTxt.trim() || isSubmitting}
				className={`w-full py-4 font-semibold rounded-full transition-colors ${
					!homeworkLinkTxt.trim() || isSubmitting
						? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
						: "bg-purple-500 hover:bg-purple-600 text-white"
				}`}
			>
				{isSubmitting ? "提出中..." : "提出する"}
			</button>
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
			<p className="text-center text-gray-600 dark:text-gray-400 mt-4">
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
}

function QuestionGeneratedState({ homeworkId }: QuestionGeneratedStateProps) {
	const navigate = useNavigate();

	return (
		<button
			onClick={() => {
				// Use replace to prevent going back to quiz after completion
				navigate(getHomeworkQuestionsPath(homeworkId), { replace: true });
			}}
			className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-colors"
		>
			<div className="w-8 h-8">
				<Lottie animationData={aiAnimation} loop={true} />
			</div>
			AI クイズに回答
		</button>
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
			<button
				onClick={onRetry}
				className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition-colors"
			>
				生成やり直す
			</button>

			<button
				onClick={onCancel}
				className="w-full py-4 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-full transition-colors"
			>
				提出を取り消す
			</button>
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
		<button
			onClick={() => {
				navigate(getHomeworkQuestionsPath(homeworkId, 'review'));
			}}
			className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition-colors"
		>
			回答履歴を見る
		</button>
	);
}
