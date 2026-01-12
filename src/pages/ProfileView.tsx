import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authManager } from "../firebase/authManager";
import { useProfileViewModel } from "../hooks/useProfileViewModel";
import { Paths } from "../router/paths";
import defaultProfilePic from "../assets/profilePic.jpg";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Cell,
	ReferenceLine,
} from "recharts";
import { useState } from "react";

interface ProfileViewProps {
	user: User;
}

// Custom label component for the reference line
interface CustomLabelProps {
	viewBox?: { x?: number; y?: number };
	value: string;
}

function CustomScoreLabel({ viewBox, value }: CustomLabelProps) {
	const x = viewBox?.x ?? 0;
	return (
		<g>
			<rect
				x={x - 28}
				y={4}
				width={56}
				height={24}
				rx={6}
				fill="#a855f7"
			/>
			<text
				x={x}
				y={20}
				textAnchor="middle"
				fill="#fff"
				fontSize={12}
				fontWeight="bold"
			>
				{value}
			</text>
		</g>
	);
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

function ProfileViewSkeleton() {
	return (
		<div className="login-bg min-h-screen">
			<div className="max-w-2xl mx-auto p-6 pt-8">
				<div className="flex flex-col items-center mb-8 animate-pulse">
					<div className="w-32 h-32 bg-white/10 rounded-full mb-4" />
					<div className="h-7 w-40 bg-white/10 rounded-lg mb-2" />
					<div className="h-4 w-48 bg-white/10 rounded-lg" />
				</div>
				<div className="h-6 w-24 bg-white/10 rounded-lg mb-4" />
				<div className="h-64 bg-white/5 rounded-2xl mb-6 border border-white/10" />
				<div className="h-32 bg-white/5 rounded-3xl mb-6 border border-white/10" />
				<div className="h-14 bg-white/5 rounded-3xl border border-white/10" />
			</div>
		</div>
	);
}

export function ProfileView({ user }: ProfileViewProps) {
	const {
		userData,
		isLoading,
		currentYear,
		averageResultsPerMonth,
		averageScoreOfAllResults,
		completedHomeworkCount,
		goToPreviousYear,
		goToNextYear,
	} = useProfileViewModel(user);

	const navigate = useNavigate();
	const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

	const handleLogout = async () => {
		await authManager.signOut();
	};

	// Get profile data from API or fallback to Firebase user
	const photoURL = userData?.photo_url || user.photoURL;
	const displayName = userData?.name || user.displayName || "ユーザー";
	const email = userData?.email || user.email || "";

	// Prepare chart data for all 12 months
	const chartData = Array.from({ length: 12 }, (_, i) => {
		const monthData = averageResultsPerMonth.find(
			(d) => d.month.getMonth() === i
		);
		return {
			month: i + 1,
			monthLabel: `${i + 1}`,
			averageScore: monthData?.averageScore || 0,
			hasData: !!monthData,
		};
	});

	if (isLoading) {
		return <ProfileViewSkeleton />;
	}

	return (
		<div className="login-bg min-h-screen pb-24">
			{/* Background orbs */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
				<div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
			</div>

			<motion.div
				className="relative max-w-2xl mx-auto p-6 pt-8"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Profile Basic Info */}
				<motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50" />
						<img
							src={photoURL || defaultProfilePic}
							alt="Profile"
							className="relative w-32 h-32 rounded-full border-2 border-white/20 shadow-xl object-cover"
						/>
					</div>
					<h2 className="text-2xl font-bold text-white mt-4">
						{displayName}
					</h2>
					<p className="text-gray-400">{email}</p>
				</motion.div>

				{/* Graph Section */}
				<motion.div variants={itemVariants} className="mb-6">
					<h3 className="text-xl font-bold text-white mb-4">
						学業進捗
					</h3>

					<div className="glass-card p-4">
						{/* Year Navigation */}
						<div className="flex items-center justify-between mb-2">
							<button
								onClick={goToPreviousYear}
								className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<span className="font-semibold text-white">
								{currentYear}年
							</span>
							<button
								onClick={goToNextYear}
								className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>

						{/* Chart */}
						<div className="h-52 w-full min-w-0 [&_*]:outline-none">
							{averageResultsPerMonth.length > 0 ? (
								<ResponsiveContainer width="100%" height={208} minWidth={0}>
									<BarChart data={chartData}>
										<defs>
											<linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
												<stop offset="0%" stopColor="#ec4899" />
												<stop offset="50%" stopColor="#a855f7" />
												<stop offset="100%" stopColor="#a855f7" />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.1)" />
										<XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
										<YAxis domain={[0, 120]} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
										{selectedMonth !== null && chartData[selectedMonth]?.hasData && (
											<ReferenceLine 
												x={chartData[selectedMonth].monthLabel} 
												stroke="#a855f7" 
												strokeWidth={2}
												label={<CustomScoreLabel value={`${chartData[selectedMonth].averageScore}点`} />}
											/>
										)}
										<Bar 
											dataKey="averageScore" 
											radius={[4, 4, 0, 0]}
											onMouseEnter={(_data, index) => {
												if (chartData[index]?.hasData) {
													setSelectedMonth(index);
												}
											}}
											onMouseLeave={() => setSelectedMonth(null)}
										>
											{chartData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={entry.hasData ? "url(#barGradient)" : "transparent"}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-gray-400">
									<div className="text-center">
										<svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
										</svg>
										<p>データがありません</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Legend */}
					<div className="flex items-center gap-2 mt-3">
						<div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
						<span className="text-sm text-gray-400">平均スコア</span>
					</div>
				</motion.div>

				{/* Stats Section */}
				<motion.button
					variants={itemVariants}
					onClick={() => navigate(Paths.DETAIL_AVERAGE_SCORE)}
					className="w-full glass-card p-4 mb-6 hover:bg-white/10 transition-all group"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<div className="flex">
						{/* Completed Homeworks */}
						<div className="flex-1 flex flex-col items-center py-4">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-2 shadow-lg shadow-pink-500/30">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<span className="text-2xl font-bold text-white">{completedHomeworkCount}</span>
							<span className="text-sm text-gray-400">完了した課題</span>
						</div>

						{/* Divider */}
						<div className="w-px bg-white/10 my-4" />

						{/* Average Score */}
						<div className="flex-1 flex flex-col items-center py-4">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/30">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
								</svg>
							</div>
							<span className="text-2xl font-bold text-white">{averageScoreOfAllResults}点</span>
							<span className="text-sm text-gray-400">平均スコア</span>
						</div>
					</div>
					
					{/* Arrow indicator */}
					<div className="flex justify-center mt-2">
						<svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</motion.button>

				{/* Logout Button */}
				<motion.button
					variants={itemVariants}
					onClick={handleLogout}
					className="w-full py-4 glass-card flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					<span className="font-medium">ログアウト</span>
				</motion.button>
			</motion.div>
		</div>
	);
}

