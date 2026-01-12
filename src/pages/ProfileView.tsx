import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
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

function ProfileViewSkeleton() {
	return (
		<div className="page-bg min-h-screen animate-pulse">
			<div className="max-w-2xl mx-auto p-6">
				<div className="flex flex-col items-center mb-8">
					<div className="w-36 h-36 bg-gray-300 rounded-full mb-4" />
					<div className="h-8 w-40 bg-gray-300 rounded mb-2" />
					<div className="h-4 w-48 bg-gray-300 rounded" />
				</div>
				<div className="h-6 w-24 bg-gray-300 rounded mb-4" />
				<div className="h-64 bg-gray-200 rounded-2xl mb-6" />
				<div className="h-32 bg-gray-200 rounded-3xl mb-6" />
				<div className="h-14 bg-gray-200 rounded-3xl" />
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

	const selectedData = selectedMonth !== null ? chartData[selectedMonth] : null;

	if (isLoading) {
		return <ProfileViewSkeleton />;
	}

	return (
		<div className="page-bg min-h-screen pb-24">
			<div className="max-w-2xl mx-auto p-6">
				{/* Profile Basic Info */}
				<div className="flex flex-col items-center mb-8">
					<img
						src={photoURL || defaultProfilePic}
						alt="Profile"
						className="w-36 h-36 rounded-full border-4 border-purple-200 shadow-lg object-cover mb-4"
					/>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						{displayName}
					</h2>
					<p className="text-gray-500 dark:text-gray-400">{email}</p>
				</div>

				{/* Graph Section */}
				<div className="mb-6">
					<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
						学業進捗
					</h3>

					<div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4">
						{/* Year Navigation */}
						<div className="flex items-center justify-between mb-2">
							<button
								onClick={goToPreviousYear}
								className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<span className="font-semibold text-gray-900 dark:text-white">
								{currentYear}年
							</span>
							<button
								onClick={goToNextYear}
								className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>

						{/* Selected Month Tooltip */}
						{selectedData && selectedData.hasData && (
							<div className="absolute top-16 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-bold z-10">
								{selectedData.averageScore}点
							</div>
						)}

						{/* Chart */}
						<div className="h-52">
							{averageResultsPerMonth.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={chartData}
										onMouseMove={(state) => {
											if (typeof state.activeTooltipIndex === 'number') {
												setSelectedMonth(state.activeTooltipIndex);
											}
										}}
										onMouseLeave={() => setSelectedMonth(null)}
									>
										<defs>
											<linearGradient
												id="barGradient"
												x1="0"
												y1="1"
												x2="0"
												y2="0"
											>
												<stop offset="0%" stopColor="#ec4899" />
												<stop offset="50%" stopColor="#a855f7" />
												<stop offset="100%" stopColor="#a855f7" />
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="5 5"
											vertical={false}
											stroke="#e5e7eb"
										/>
										<XAxis
											dataKey="monthLabel"
											axisLine={false}
											tickLine={false}
											tick={{ fill: "#6b7280", fontSize: 12 }}
										/>
										<YAxis
											domain={[0, 120]}
											axisLine={false}
											tickLine={false}
											tick={{ fill: "#6b7280", fontSize: 12 }}
										/>
										{selectedMonth !== null && chartData[selectedMonth]?.hasData && (
											<ReferenceLine
												x={chartData[selectedMonth].monthLabel}
												stroke="#ec4899"
												strokeWidth={2}
											/>
										)}
										<Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
											{chartData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={entry.hasData ? "url(#barGradient)" : "transparent"}
													opacity={
														selectedMonth === null || selectedMonth === index
															? 1
															: 0.3
													}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-gray-400">
									<div className="text-center">
										<svg
											className="w-12 h-12 mx-auto mb-2"
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
										<p>平均スコアのデータはありません。</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Legend */}
					<div className="flex items-center gap-2 mt-3">
						<div className="w-3 h-3 rounded-full bg-purple-500" />
						<span className="text-sm text-gray-600 dark:text-gray-400">
							平均スコア
						</span>
					</div>
				</div>

				{/* Stats Section */}
				<button
					onClick={() => navigate(Paths.DETAIL_AVERAGE_SCORE)}
					className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-4 mb-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
				>
					<div className="flex">
						{/* Completed Homeworks */}
						<div className="flex-1 flex flex-col items-center py-4">
							<svg
								className="w-8 h-8 text-pink-500 mb-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-xl font-bold text-gray-900 dark:text-white">
								{completedHomeworkCount}
							</span>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								完了した課題
							</span>
						</div>

						{/* Divider */}
						<div className="w-px bg-gray-200 dark:bg-gray-700 my-4" />

						{/* Average Score */}
						<div className="flex-1 flex flex-col items-center py-4">
							<svg
								className="w-8 h-8 text-purple-500 mb-2"
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
							<span className="text-xl font-bold text-gray-900 dark:text-white">
								{averageScoreOfAllResults}点
							</span>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								平均スコア
							</span>
						</div>
					</div>
				</button>

				{/* Logout Button */}
				<button
					onClick={handleLogout}
					className="w-full py-4 border-2 border-gray-200 dark:border-gray-700 rounded-3xl flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					<span className="font-medium">ログアウト</span>
				</button>
			</div>
		</div>
	);
}

