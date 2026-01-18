import type { User } from "firebase/auth";
import { motion } from "framer-motion";
import { useDetailAverageScoreViewModel } from "../hooks/useDetailAverageScoreViewModel";
import type { AverageScorePerClass } from "../types/models";

interface DetailAverageScoreViewProps {
	user: User;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function DetailAverageScoreSkeleton() {
	return (
		<div className="login-bg min-h-screen">
			<div className="max-w-2xl mx-auto p-6 pt-8">
				<div className="h-8 w-48 bg-white/10 rounded-lg mb-6 animate-pulse" />
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="glass-card p-5 animate-pulse">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-11 h-11 bg-white/10 rounded-xl" />
								<div className="h-6 w-32 bg-white/10 rounded-lg" />
							</div>
							<div className="flex gap-3">
								<div className="flex-1 h-24 bg-white/5 rounded-2xl border border-white/5" />
								<div className="flex-1 h-24 bg-white/5 rounded-2xl border border-white/5" />
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
	index: number;
}

function ClassScoreCard({ data, index }: ClassScoreCardProps) {
	// Different gradient colors for variety
	const gradients = [
		"from-pink-500 to-purple-500",
		"from-purple-500 to-indigo-500",
		"from-blue-500 to-cyan-500",
		"from-teal-500 to-green-500",
		"from-orange-500 to-red-500",
	];
	const gradient = gradients[index % gradients.length];

	return (
		<motion.div
			variants={itemVariants}
			className="glass-card p-5"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300 }}
		>
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className={`w-11 h-11 flex items-center justify-center rounded-xl bg-linear-to-br ${gradient} shadow-lg`}>
					<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 14l9-5-9-5-9 5 9 5z" />
						<path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
					</svg>
				</div>
				<h3 className="text-lg font-bold text-white">
					{data.class_name}
				</h3>
			</div>

			{/* Stats Cards */}
			<div className="flex gap-3">
				{/* Average Score Card */}
				<div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
					<div className="flex items-center gap-2 mb-2">
						<svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
						</svg>
						<span className="text-sm text-gray-400">平均点</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-3xl font-bold text-white">{data.average_score}</span>
						<span className="text-sm text-gray-400 ml-1">点</span>
					</div>
				</div>

				{/* Homework Count Card */}
				<div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
					<div className="flex items-center gap-2 mb-2">
						<svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
							<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
						</svg>
						<span className="text-sm text-gray-400">課題数</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-3xl font-bold text-white">{data.finished_homework_count}</span>
						<span className="text-sm text-gray-400 ml-1">/{data.total_homework_count}個</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

export function DetailAverageScoreView({ user }: DetailAverageScoreViewProps) {
	const { averageScoresPerClass, isLoading, error, refresh } =
		useDetailAverageScoreViewModel(user);

	if (isLoading) {
		return <DetailAverageScoreSkeleton />;
	}

	return (
		<div className="login-bg min-h-screen pb-24">
			{/* Background orbs */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
				<div className="absolute bottom-40 left-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
			</div>

			<motion.div
				className="relative max-w-2xl mx-auto p-6 pt-8"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Header */}
				<motion.header variants={itemVariants} className="mb-6">
					<h1 className="text-2xl font-bold text-white">
						各科目の平均スコア
					</h1>
					<p className="text-gray-400 mt-1">科目ごとの成績を確認できます</p>
				</motion.header>

				{/* Error message */}
				{error && (
					<motion.div
						variants={itemVariants}
						className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-between backdrop-blur-sm"
					>
						<span>{error}</span>
						<button
							onClick={refresh}
							className="text-red-400 hover:text-red-300 font-semibold transition-colors"
						>
							再試行
						</button>
					</motion.div>
				)}

				{/* Content */}
				{averageScoresPerClass.length > 0 ? (
					<div className="space-y-4">
						{averageScoresPerClass.map((data, index) => (
							<ClassScoreCard key={data.id || index} data={data} index={index} />
						))}
					</div>
				) : (
					<motion.div variants={itemVariants} className="text-center py-16">
						<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
							<svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<p className="text-gray-400 text-lg">データがありません</p>
						<p className="text-gray-500 text-sm mt-1">課題を完了すると、ここに成績が表示されます</p>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}
