import { useState } from "react";
import appLogo from "../assets/appLogo.png";
import googleIcon from "../assets/google.png";
import { authManager } from "../firebase/authManager";

export function LoginView() {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);
		try {
			await authManager.signInWithGoogle();
		} catch (e) {
			setError(e instanceof Error ? e.message : "ログインに失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-white to-blue-100 flex flex-col">
			{/* Error Alert */}
			{error && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
					<div className="flex items-center gap-2">
						<span className="font-semibold">エラー発生</span>
						<span>{error}</span>
						<button onClick={() => setError(null)} className="ml-4 text-red-700 hover:text-red-900 font-bold">
							✕
						</button>
					</div>
				</div>
			)}

			<div className="flex-1" />

			{/* App Logo and Title */}
			<div className="flex flex-col items-center gap-4 px-6">
				<img src={appLogo} alt="Know Your Code" className="w-48 h-48 object-contain" />
				<h1 className="text-4xl font-bold text-gray-900 tracking-tight">Know Your Code</h1>
			</div>

			<div className="flex-1" />

			{/* Login Buttons */}
			<div className="flex flex-col gap-3 px-6 pb-12 max-w-md mx-auto w-full">
				{/* Google Sign In Button */}
				<button
					onClick={handleGoogleSignIn}
					disabled={isLoading}
					className="flex items-center justify-center gap-3 w-full h-14 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<img src={googleIcon} alt="Google" className="w-5 h-5" />
					<span className="text-gray-900 font-semibold text-lg">
						{isLoading ? "ログイン中..." : "Googleでサインイン"}
					</span>
				</button>
			</div>
		</div>
	);
}
 