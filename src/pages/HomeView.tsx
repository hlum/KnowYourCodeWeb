import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useHomeViewModel } from "../hooks/useHomeViewModel";
import { ClassItemView } from "../components/ClassItemView";
import { HomeworkItemView } from "../components/HomeworkItemView";
import { Paths, getClassHomeworksPath, getHomeworkDetailPath } from "../router/paths";
import defaultProfilePic from "../assets/profilePic.jpg";

interface HomeViewProps {
	user: User;
}

function HomeSkeleton() {
	return (
		<div className="page-bg animate-pulse">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header skeleton */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<div className="h-4 w-20 bg-gray-300 rounded mb-2" />
						<div className="h-6 w-32 bg-gray-300 rounded" />
					</div>
					<div className="w-14 h-14 bg-gray-300 rounded-full" />
				</div>

				{/* Classes skeleton */}
				<div className="mb-8">
					<div className="h-6 w-24 bg-gray-300 rounded mb-4" />
					<div className="flex gap-4 overflow-hidden">
						{[1, 2, 3].map((i) => (
							<div key={i} className="w-52 h-24 bg-gray-300 rounded-2xl flex-shrink-0" />
						))}
					</div>
				</div>

				{/* Homeworks skeleton */}
				<div>
					<div className="h-6 w-48 bg-gray-300 rounded mb-4" />
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-28 bg-gray-300 rounded-2xl" />
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
	// Get photoURL from API or fallback to Firebase user
	const photoURL = userData?.photo_url || user.photoURL;

	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<header className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
					<div>
						<p className="text-gray-600 dark:text-gray-400 text-sm">こんにちは</p>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
					</div>
					<div className="flex items-center gap-4">
						<img 
							src={photoURL || defaultProfilePic} 
							alt="Profile" 
							className="w-14 h-14 rounded-full border-2 border-white/50 shadow-lg object-cover" 
						/>
					</div>
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

				{/* Classes Section */}
				<section className="mb-10">
					<button 
						onClick={() => navigate(Paths.CLASSES)}
						className="flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
					>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">科目</h2>
						<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>

					{classes.length > 0 ? (
						<div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
							{classes.map((classItem) => (
								<div key={classItem.id} className="flex-shrink-0 w-64">
									<ClassItemView
										classData={classItem}
										onClick={() => {
											navigate(getClassHomeworksPath(classItem.id));
										}}
									/>
								</div>
							))}
						</div>
					) : (
						<div className="card p-8 text-center">
							<svg
								className="w-12 h-12 mx-auto text-gray-400 mb-3"
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
							<p className="text-gray-500 dark:text-gray-400">登録されている科目がありません</p>
						</div>
					)}
				</section>

				{/* Upcoming Homeworks Section */}
				<section>
					<button 
						onClick={() => navigate(Paths.HOMEWORKS)}
						className="flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
					>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">提出期限が近い課題</h2>
						<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>

					{homeworks.length > 0 ? (
						<div className="space-y-4">
							{homeworks.map((homework) => (
								<HomeworkItemView
									key={homework.id}
									homework={homework}
									onClick={() => {
										navigate(getHomeworkDetailPath(homework.id));
									}}
									onAnswerClick={() => {
										console.log("Answer homework:", homework.id);
									}}
								/>
							))}
						</div>
					) : (
						<div className="card p-8 text-center">
							<svg
								className="w-12 h-12 mx-auto text-gray-400 mb-3"
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
							<p className="text-gray-500 dark:text-gray-400">提出期限が近い課題はありません</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
