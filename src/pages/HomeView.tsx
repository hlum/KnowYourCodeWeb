import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useHomeViewModel } from "../hooks/useHomeViewModel";
import { ClassItemView } from "../components/ClassItemView";
import { HomeworkItemView } from "../components/HomeworkItemView";
import { Paths, getClassHomeworksPath, getHomeworkDetailPath } from "../router/paths";
import defaultProfilePic from "../assets/profilePic.jpg";

interface HomeViewProps {
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

function HomeSkeleton() {
	return (
		<div className="login-bg min-h-screen">
			<div className="max-w-4xl mx-auto p-6 animate-pulse">
				{/* Header skeleton */}
				<div className="glass-card p-6 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<div className="h-4 w-20 bg-white/10 rounded mb-2" />
							<div className="h-7 w-36 bg-white/10 rounded" />
						</div>
						<div className="w-14 h-14 bg-white/10 rounded-full" />
					</div>
				</div>

				{/* Classes skeleton */}
				<div className="mb-8">
					<div className="h-6 w-24 bg-white/10 rounded mb-4" />
					<div className="flex gap-4 overflow-hidden">
						{[1, 2, 3].map((i) => (
							<div key={i} className="w-64 h-24 bg-white/10 rounded-2xl flex-shrink-0" />
						))}
					</div>
				</div>

				{/* Homeworks skeleton */}
				<div>
					<div className="h-6 w-48 bg-white/10 rounded mb-4" />
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-28 bg-white/10 rounded-2xl" />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export function HomeView({ user }: HomeViewProps) {
	const navigate = useNavigate();
	const { userData, classes, homeworks, isLoading, error, refresh } = useHomeViewModel(user);

	if (isLoading) {
		return <HomeSkeleton />;
	}

	const displayName = userData?.student_code || userData?.name || user.displayName || "ゲスト";
	const photoURL = userData?.photo_url || user.photoURL;

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
					className="glass-card p-6 mb-8"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-sm mb-1">こんにちは 👋</p>
							<h1 className="text-2xl font-bold text-white">{displayName}</h1>
						</div>
						<motion.img
							whileHover={{ scale: 1.05 }}
							src={photoURL || defaultProfilePic}
							alt="Profile"
							className="w-14 h-14 rounded-full border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 object-cover cursor-pointer"
							onClick={() => navigate(Paths.PROFILE)}
						/>
					</div>
				</motion.header>

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

				{/* Classes Section */}
				<motion.section variants={itemVariants} className="mb-10">
					<button
						onClick={() => navigate(Paths.CLASSES)}
						className="flex items-center gap-2 mb-4 group"
					>
						<h2 className="text-xl font-bold text-white">科目</h2>
						<svg
							className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>

					{classes.length > 0 ? (
						<div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
							{classes.map((classItem, index) => (
								<motion.div
									key={classItem.id}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className="flex-shrink-0 w-64"
								>
									<ClassItemView
										classData={classItem}
										onClick={() => navigate(getClassHomeworksPath(classItem.id))}
									/>
								</motion.div>
							))}
						</div>
					) : (
						<div className="glass-card p-8 text-center">
							<svg
								className="w-12 h-12 mx-auto text-gray-500 mb-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
								/>
							</svg>
							<p className="text-gray-400">登録されている科目がありません</p>
						</div>
					)}
				</motion.section>

				{/* Upcoming Homeworks Section */}
				<motion.section variants={itemVariants}>
					<button
						onClick={() => navigate(Paths.HOMEWORKS)}
						className="flex items-center gap-2 mb-4 group"
					>
						<h2 className="text-xl font-bold text-white">提出期限が近い課題</h2>
						<svg
							className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>

					{homeworks.length > 0 ? (
						<div className="space-y-4">
							{homeworks.map((homework, index) => (
								<motion.div
									key={homework.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<HomeworkItemView
										homework={homework}
										onClick={() => navigate(getHomeworkDetailPath(homework.id))}
										onAnswerClick={() => navigate(getHomeworkDetailPath(homework.id))}
									/>
								</motion.div>
							))}
						</div>
					) : (
						<div className="glass-card p-8 text-center">
							<svg
								className="w-12 h-12 mx-auto text-gray-500 mb-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p className="text-gray-400">提出期限が近い課題はありません</p>
						</div>
					)}
				</motion.section>
			</motion.div>
		</div>
	);
}
