import type { User } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import { useClassHomeworkViewModel } from "../hooks/useClassHomeworkViewModel";
import { FILTER_OPTIONS, type HomeworkFilterOption } from "../hooks/useHomeworkListViewModel";
import { HomeworkItemView } from "../components/HomeworkItemView";
import { getHomeworkDetailPath } from "../router/paths";

interface ClassHomeworkListViewProps {
	user: User;
}

function HomeworkListSkeleton() {
	return (
		<div className="space-y-4 animate-pulse">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
			))}
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
		<button
			onClick={onClick}
			className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
				isSelected
					? "bg-purple-500/25 text-purple-600 dark:text-purple-400"
					: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
			}`}
		>
			{label}
		</button>
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
			<div className="page-bg min-h-screen flex items-center justify-center">
				<p className="text-gray-500">クラスが見つかりません</p>
			</div>
		);
	}

	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header with back button */}
				<header className="flex items-center gap-4 mb-6">
					<button
						onClick={() => navigate(-1)}
						className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						{isLoading ? "読み込み中..." : classInfo?.name || "科目"}
					</h1>
				</header>

				{/* Filter buttons */}
				<div className="mb-6 overflow-x-auto pb-2 -mx-2 px-2">
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
				</div>

				{/* Error message */}
				{error && (
					<div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-center justify-between">
						<span>{error}</span>
						<button onClick={refresh} className="text-red-700 hover:text-red-900 font-semibold">
							再試行
						</button>
					</div>
				)}

				{/* Content */}
				{isLoading ? (
					<HomeworkListSkeleton />
				) : filteredHomeworks.length > 0 ? (
					<div className="space-y-4">
						{filteredHomeworks.map((homework) => (
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
							className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
						<p className="text-gray-500 dark:text-gray-400">該当する課題がありません</p>
					</div>
				)}
			</div>
		</div>
	);
}
