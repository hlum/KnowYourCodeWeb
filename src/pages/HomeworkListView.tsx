import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useHomeworkListViewModel, FILTER_OPTIONS, type HomeworkFilterOption } from "../hooks/useHomeworkListViewModel";
import { HomeworkItemView } from "../components/HomeworkItemView";
import { getHomeworkDetailPath } from "../router/paths";

interface HomeworkListViewProps {
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

	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<header className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">全ての課題</h1>
				</header>

				{/* Search bar */}
				<div className="mb-4">
					<div className="relative">
						<svg
							className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
							className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						/>
						{searchText && (
							<button
								onClick={() => setSearchText("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</div>
				</div>

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
						<p className="text-gray-500 dark:text-gray-400">該当する課題はありません</p>
					</div>
				)}
			</div>
		</div>
	);
}
