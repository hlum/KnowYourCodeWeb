import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useHomeworkListViewModel, FILTER_OPTIONS, type HomeworkFilterOption } from "../hooks/useHomeworkListViewModel";
import { HomeworkItemView } from "../components/HomeworkItemView";
import { getHomeworkDetailPath } from "../router/paths";

interface HomeworkListViewProps {
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
				<div className="glass-card p-6 mb-8">
					<div className="h-8 w-40 bg-white/10 rounded" />
				</div>

				{/* Search skeleton */}
				<div className="h-12 bg-white/10 rounded-xl mb-4" />

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

export function HomeworkListView({ user }: HomeworkListViewProps) {
	const navigate = useNavigate();
	const {
		filteredHomeworks,
		isLoading,
		error,
		searchText,
		setSearchText,
		selectedFilter,
		setSelectedFilter,
		refresh,
	} = useHomeworkListViewModel(user);

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
					<h1 className="text-2xl font-bold text-white">全ての課題</h1>
				</motion.header>

				{/* Search bar */}
				<motion.div variants={itemVariants} className="mb-4">
					<div className="relative">
						<svg
							className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							type="text"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							placeholder="課題を検索"
							className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						/>
						{searchText && (
							<button
								onClick={() => setSearchText("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</div>
				</motion.div>

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
							<p className="text-gray-400">該当する課題はありません</p>
						</div>
					)}
				</motion.section>
			</motion.div>
		</div>
	);
}
