import type { User } from "firebase/auth";

interface ClassListViewProps {
	user: User;
}

export function ClassListView({ user }: ClassListViewProps) {
	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<header className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">科目一覧</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">登録されている科目を確認できます</p>
				</header>

				{/* Placeholder content */}
				<div className="card p-8 text-center">
					<svg
						className="w-16 h-16 mx-auto text-gray-400 mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M12 14l9-5-9-5-9 5 9 5z" />
						<path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
					</svg>
					<p className="text-gray-500 dark:text-gray-400 mb-2">科目一覧ページ</p>
					<p className="text-sm text-gray-400 dark:text-gray-500">ユーザー: {user.displayName || user.email}</p>
				</div>
			</div>
		</div>
	);
}
