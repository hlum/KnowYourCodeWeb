import type { User } from "firebase/auth";
import { authManager } from "../firebase/authManager";

interface ProfileViewProps {
	user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
	const handleLogout = async () => {
		await authManager.signOut();
	};

	const photoURL = user.photoURL;
	const displayName = user.displayName || "ユーザー";
	const email = user.email || "";

	return (
		<div className="page-bg min-h-screen">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<header className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">プロフィール</h1>
				</header>

				{/* Profile Card */}
				<div className="card p-6 mb-6">
					<div className="flex items-center gap-4 mb-6">
						{photoURL ? (
							<img
								src={photoURL}
								alt="Profile"
								className="w-20 h-20 rounded-full border-2 border-purple-300 shadow-lg object-cover"
							/>
						) : (
							<div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-2xl">
								{displayName.charAt(0).toUpperCase()}
							</div>
						)}
						<div>
							<h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
							<p className="text-gray-600 dark:text-gray-400">{email}</p>
						</div>
					</div>

					{/* User Info */}
					<div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
						<div className="flex justify-between items-center">
							<span className="text-gray-600 dark:text-gray-400">ユーザーID</span>
							<span className="text-gray-900 dark:text-white font-mono text-sm">{user.uid.slice(0, 12)}...</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600 dark:text-gray-400">認証プロバイダ</span>
							<span className="text-gray-900 dark:text-white">
								{user.providerData[0]?.providerId === "google.com" ? "Google" : "Email"}
							</span>
						</div>
					</div>
				</div>

				{/* Logout Button */}
				<button
					onClick={handleLogout}
					className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
				>
					ログアウト
				</button>
			</div>
		</div>
	);
}
