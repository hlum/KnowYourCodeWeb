import type { User } from "firebase/auth";
import { useDetailAverageScoreViewModel } from "../hooks/useDetailAverageScoreViewModel";
import type { AverageScorePerClass } from "../types/models";

interface DetailAverageScoreViewProps {
	user: User;
}

function DetailAverageScoreSkeleton() {
	return (
		<div className="page-bg min-h-screen animate-pulse">
			<div className="max-w-2xl mx-auto p-6">
				<div className="h-8 w-48 bg-gray-300 rounded mb-6" />
				<div className="space-y-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-3xl p-5">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-11 h-11 bg-gray-300 rounded-xl" />
								<div className="h-6 w-32 bg-gray-300 rounded" />
							</div>
							<div className="flex gap-3">
								<div className="flex-1 h-24 bg-gray-300 rounded-2xl" />
								<div className="flex-1 h-24 bg-gray-300 rounded-2xl" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

interface ClassScoreCardProps {
	data: AverageScorePerClass;
}

function ClassScoreCard({ data }: ClassScoreCardProps) {
	return (
		<div className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-5 shadow-lg">
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
					<svg
						className="w-6 h-6 text-white"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M12 14l9-5-9-5-9 5 9 5z" />
						<path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
					</svg>
				</div>
				<h3 className="text-lg font-bold text-gray-900 dark:text-white">
					{data.class_name}
				</h3>
			</div>

			{/* Stats Cards */}
			<div className="flex gap-3">
				{/* Average Score Card */}
				<div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
					<div className="flex items-center gap-2 mb-2">
						<svg
							className="w-5 h-5 text-purple-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
							/>
						</svg>
						<span className="text-sm text-gray-500 dark:text-gray-400">
							平均点
						</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-3xl font-bold text-gray-900 dark:text-white">
							{data.average_score}
						</span>
						<span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
							点
						</span>
					</div>
				</div>

				{/* Homework Count Card */}
				<div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
					<div className="flex items-center gap-2 mb-2">
						<svg
							className="w-5 h-5 text-pink-500"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								fillRule="evenodd"
								d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="text-sm text-gray-500 dark:text-gray-400">
							課題数
						</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-3xl font-bold text-gray-900 dark:text-white">
							{data.finished_homework_count}
						</span>
						<span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
							/{data.total_homework_count}個
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export function DetailAverageScoreView({ user }: DetailAverageScoreViewProps) {
	const { averageScoresPerClass, isLoading, error, refresh } =
		useDetailAverageScoreViewModel(user);

	if (isLoading) {
		return <DetailAverageScoreSkeleton />;
	}

	return (
		<div className="page-bg min-h-screen pb-24">
			<div className="max-w-2xl mx-auto p-6">
				{/* Header */}
				<header className="mb-6">
					<h1 className="text-xl font-bold text-gray-900 dark:text-white">
						各科目の平均スコア
					</h1>
				</header>

				{/* Error message */}
				{error && (
					<div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-center justify-between">
						<span>{error}</span>
						<button
							onClick={refresh}
							className="text-red-700 hover:text-red-900 font-semibold"
						>
							再試行
						</button>
					</div>
				)}

				{/* Content */}
				{averageScoresPerClass.length > 0 ? (
					<div className="space-y-6">
						{averageScoresPerClass.map((data, index) => (
							<ClassScoreCard key={data.id || index} data={data} />
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<svg
							className="w-16 h-16 mx-auto text-gray-400 mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p className="text-gray-500 dark:text-gray-400">
							平均スコアのデータはありません
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
