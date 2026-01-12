import type { User } from "firebase/auth";

interface HomeworkListViewProps {
	user: User;
}

export function HomeworkListView({ user }: HomeworkListViewProps) {
	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<header className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">課題一覧</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">すべての課題を確認できます</p>
				</header>

				{/* Placeholder content */}
				<div className="card p-8 text-center">
					<svg
						className="w-16 h-16 mx-auto text-gray-400 mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
					</svg>
					<p className="text-gray-500 dark:text-gray-400 mb-2">課題一覧ページ</p>
					<p className="text-sm text-gray-400 dark:text-gray-500">ユーザー: {user.displayName || user.email}</p>
				</div>
			</div>
		</div>
	);
}
