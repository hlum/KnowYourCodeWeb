import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useClassListViewModel } from "../hooks/useClassListViewModel";
import { ClassItemView } from "../components/ClassItemView";
import { getClassHomeworksPath } from "../router/paths";

interface ClassListViewProps {
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

function ClassListSkeleton() {
	return (
		<div className="login-bg min-h-screen">
			<div className="max-w-4xl mx-auto p-6 animate-pulse">
				{/* Header skeleton */}
				<div className="glass-card p-6 mb-8">
					<div className="flex items-center justify-between">
						<div className="h-8 w-32 bg-white/10 rounded" />
						<div className="w-10 h-10 bg-white/10 rounded-xl" />
					</div>
				</div>

				{/* Classes skeleton */}
				<div className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-24 bg-white/10 rounded-2xl" />
					))}
				</div>
			</div>
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
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" onClick={onClose} />

			{/* Modal */}
			<motion.div
				initial={{ opacity: 0, y: 50, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.3 }}
				className="relative w-full max-w-md glass-card rounded-2xl p-6 z-10"
			>
				<h2 className="text-xl font-bold text-white mb-2">
					クラスコードを入力して参加
				</h2>
				<p className="text-gray-400 text-sm mb-6">
					選択科目のコードは担当の先生から受け取ってください。
				</p>

				<input
					type="text"
					value={classCode}
					onChange={(e) => setClassCode(e.target.value)}
					placeholder="科目コードを入力"
					className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					disabled={isAddingClass}
				/>

				{classCodeError && (
					<p className="text-red-400 text-sm mt-2">{classCodeError}</p>
				)}

				<div className="flex gap-3 mt-6">
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={onClose}
						className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-gray-300 font-semibold rounded-xl hover:bg-white/20 transition-colors"
						disabled={isAddingClass}
					>
						キャンセル
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={onSubmit}
						disabled={!classCode.trim() || isAddingClass}
						className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-colors ${
							!classCode.trim() || isAddingClass
								? "bg-white/10 text-gray-500 cursor-not-allowed"
								: "btn-gradient"
						}`}
					>
						{isAddingClass ? (
							<span className="flex items-center justify-center gap-2">
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								エントリー中...
							</span>
						) : (
							"参加する"
						)}
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
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

	if (isLoading) {
		return <ClassListSkeleton />;
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
					className="glass-card p-6 mb-8"
				>
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-white">科目一覧</h1>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							onClick={openAddClassModal}
							className="p-2.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-xl transition-colors"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
						</motion.button>
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

				{/* Content */}
				<motion.section variants={itemVariants}>
					{classes.length > 0 ? (
						<div className="space-y-4">
							{classes.map((classItem, index) => (
								<motion.div
									key={classItem.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<ClassItemView
										classData={classItem}
										onClick={() => {
											navigate(getClassHomeworksPath(classItem.id));
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
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
								/>
							</svg>
							<p className="text-gray-400">所属しているクラスがありません</p>
						</div>
					)}
				</motion.section>
			</motion.div>

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
