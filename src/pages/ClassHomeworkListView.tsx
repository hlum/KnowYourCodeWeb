import type { User } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useClassHomeworkViewModel } from "../hooks/useClassHomeworkViewModel";
import { FILTER_OPTIONS, type HomeworkFilterOption } from "../hooks/useHomeworkListViewModel";
import { HomeworkItemView } from "../components/HomeworkItemView";
import { getHomeworkDetailPath } from "../router/paths";

interface ClassHomeworkListViewProps {
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

function HomeworkListSkeleton() {
	return (
		<div className="login-bg min-h-screen">
			<div className="max-w-4xl mx-auto p-6 animate-pulse">
				{/* Header skeleton */}
				<div className="glass-card p-6 mb-6">
					<div className="h-8 w-48 bg-white/10 rounded" />
				</div>

				{/* Filter skeleton */}
				<div className="flex gap-2 mb-6">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-8 w-20 bg-white/10 rounded-full" />
					))}
				</div>

				{/* Content skeleton */}
				<div className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-28 bg-white/10 rounded-2xl" />
					))}
				</div>
			</div>
		</div>
	);
}

interface FilterButtonProps {
	label: string;
	isSelected: boolean;
	onClick: () => void;
}

function FilterButton({ label, isSelected, onClick }: FilterButtonProps) {
	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={onClick}
			className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
				isSelected
					? "bg-white/20 text-white border border-white/30"
					: "text-gray-400 hover:text-white hover:bg-white/10"
			}`}
		>
			{label}
		</motion.button>
	);
}

export function ClassHomeworkListView({ user }: ClassHomeworkListViewProps) {
	const { classId } = useParams<{ classId: string }>();
	const navigate = useNavigate();

	const {
		classInfo,
		filteredHomeworks,
		isLoading,
		error,
		selectedFilter,
		setSelectedFilter,
		refresh,
	} = useClassHomeworkViewModel(user, classId || "");

	if (!classId) {
		return (
			<div className="login-bg min-h-screen flex items-center justify-center">
				<p className="text-gray-400">クラスが見つかりません</p>
			</div>
		);
	}

	if (isLoading) {
		return <HomeworkListSkeleton />;
	}

	return (
		<div className="login-bg min-h-screen pb-24">
			{/* Background effects */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
				<div className="absolute bottom-1/3 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
			</div>

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="relative z-10 max-w-4xl mx-auto p-6"
			>
				{/* Header */}
				<motion.header
					variants={itemVariants}
					className="glass-card p-6 mb-6"
				>
					<h1 className="text-2xl font-bold text-white">
						{classInfo?.name || "科目"}
					</h1>
				</motion.header>

				{/* Filter buttons */}
				<motion.div variants={itemVariants} className="mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
					<div className="flex gap-2">
						{FILTER_OPTIONS.map((option) => (
							<FilterButton
								key={option.value}
								label={option.label}
								isSelected={selectedFilter === option.value}
								onClick={() => setSelectedFilter(option.value as HomeworkFilterOption)}
							/>
						))}
					</div>
				</motion.div>

				{/* Error message */}
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-6 p-4 glass-card border-red-500/30 flex items-center justify-between"
					>
						<span className="text-red-400">{error}</span>
						<button onClick={refresh} className="text-red-400 hover:text-red-300 font-semibold">
							再試行
						</button>
					</motion.div>
				)}

				{/* Content */}
				<motion.section variants={itemVariants}>
					{filteredHomeworks.length > 0 ? (
						<div className="space-y-4">
							{filteredHomeworks.map((homework, index) => (
								<motion.div
									key={homework.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<HomeworkItemView
										homework={homework}
										onClick={() => {
											navigate(getHomeworkDetailPath(homework.id));
										}}
										onAnswerClick={() => {
											navigate(getHomeworkDetailPath(homework.id));
										}}
									/>
								</motion.div>
							))}
						</div>
					) : (
						<div className="glass-card p-8 text-center">
							<svg
								className="w-16 h-16 mx-auto text-gray-500 mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							<p className="text-gray-400">該当する課題がありません</p>
						</div>
					)}
				</motion.section>
			</motion.div>
		</div>
	);
}
