import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useClassListViewModel } from "../hooks/useClassListViewModel";
import { ClassItemView } from "../components/ClassItemView";
import { getClassHomeworksPath } from "../router/paths";

interface ClassListViewProps {
	user: User;
}

function ClassListSkeleton() {
	return (
		<div className="space-y-4 animate-pulse">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="flex items-center p-4 bg-gray-200 dark:bg-gray-700 rounded-2xl">
					<div className="w-15 h-15 rounded-xl bg-gray-300 dark:bg-gray-600" />
					<div className="ml-5 flex-1">
						<div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
						<div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

interface AddClassModalProps {
	isOpen: boolean;
	onClose: () => void;
	classCode: string;
	setClassCode: (value: string) => void;
	classCodeError: string;
	isAddingClass: boolean;
	onSubmit: () => void;
}

function AddClassModal({
	isOpen,
	onClose,
	classCode,
	setClassCode,
	classCodeError,
	isAddingClass,
	onSubmit,
}: AddClassModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />

			{/* Modal */}
			<div className="relative w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
					クラスコードを入力して参加
				</h2>
				<p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
					選択科目のコードは担当の先生から受け取ってください。
				</p>

				<input
					type="text"
					value={classCode}
					onChange={(e) => setClassCode(e.target.value)}
					placeholder="科目コードを入力"
					className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
					disabled={isAddingClass}
				/>

				{classCodeError && (
					<p className="text-red-500 text-sm mt-2">{classCodeError}</p>
				)}

				<div className="flex gap-3 mt-6">
					<button
						onClick={onClose}
						className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
						disabled={isAddingClass}
					>
						キャンセル
					</button>
					<button
						onClick={onSubmit}
						disabled={!classCode.trim() || isAddingClass}
						className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-colors ${
							!classCode.trim() || isAddingClass
								? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
								: "bg-purple-500 hover:bg-purple-600 text-white"
						}`}
					>
						{isAddingClass ? "エントリー中..." : "参加する"}
					</button>
				</div>
			</div>
		</div>
	);
}

export function ClassListView({ user }: ClassListViewProps) {
	const navigate = useNavigate();
	const {
		classes,
		isLoading,
		error,
		refresh,
		showAddClassModal,
		openAddClassModal,
		closeAddClassModal,
		classCode,
		setClassCode,
		classCodeError,
		isAddingClass,
		addOptionalClass,
	} = useClassListViewModel(user);

	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<header className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">科目一覧</h1>
					<button
						onClick={openAddClassModal}
						className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
					</button>
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

				{/* Content */}
				{isLoading ? (
					<ClassListSkeleton />
				) : classes.length > 0 ? (
					<div className="space-y-4">
						{classes.map((classItem) => (
							<ClassItemView
								key={classItem.id}
								classData={classItem}
								onClick={() => {
									navigate(getClassHomeworksPath(classItem.id));
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
						<p className="text-gray-500 dark:text-gray-400">所属しているクラスがありません</p>
					</div>
				)}
			</div>

			{/* Add Class Modal */}
			<AddClassModal
				isOpen={showAddClassModal}
				onClose={closeAddClassModal}
				classCode={classCode}
				setClassCode={setClassCode}
				classCodeError={classCodeError}
				isAddingClass={isAddingClass}
				onSubmit={addOptionalClass}
			/>
		</div>
	);
}
