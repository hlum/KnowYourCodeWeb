import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import appLogo from "../assets/appLogo.png";
import googleIcon from "../assets/google.png";
import { authManager } from "../firebase/authManager";

// Animation variants
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.2,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
	},
};

const floatVariants: Variants = {
	animate: {
		y: [0, -10, 0],
		transition: {
			duration: 3,
			repeat: Infinity,
			ease: [0.45, 0, 0.55, 1],
		},
	},
};

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
		<div className="login-bg flex flex-col items-center justify-center px-6 py-12">
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
			</div>

			{/* Error Alert */}
			{error && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="fixed top-6 left-1/2 transform -translate-x-1/2 glass-card px-6 py-4 z-50 border-red-500/30"
				>
					<div className="flex items-center gap-3 text-red-400">
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
						</svg>
						<span className="font-medium">{error}</span>
						<button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300">
							✕
						</button>
					</div>
				</motion.div>
			)}

			{/* Main Content */}
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="relative z-10 flex flex-col items-center max-w-lg w-full"
			>
				{/* Logo */}
				<motion.div variants={floatVariants} animate="animate" className="mb-8">
					<motion.img
						variants={itemVariants}
						src={appLogo}
						alt="Know Your Code"
						className="w-40 h-40 object-contain drop-shadow-2xl"
					/>
				</motion.div>

				{/* Title */}
				<motion.h1
					variants={itemVariants}
					className="text-4xl md:text-5xl font-bold text-gradient mb-3 text-center"
				>
					Know Your Code
				</motion.h1>

				{/* Subtitle */}
				<motion.p
					variants={itemVariants}
					className="text-gray-400 text-center mb-12 text-lg"
				>
					AIがあなたのコードを理解し、学習をサポート
				</motion.p>

				{/* Login Card */}
				<motion.div
					variants={itemVariants}
					className="glass-card p-8 w-full mb-8"
				>
					<h2 className="text-white text-xl font-semibold mb-6 text-center">
						ログイン
					</h2>

					{/* Google Sign In Button */}
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleGoogleSignIn}
						disabled={isLoading}
						className="btn-gradient w-full h-14 text-lg disabled:opacity-50"
					>
						{isLoading ? (
							<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<img src={googleIcon} alt="Google" className="w-5 h-5" />
						)}
						<span>{isLoading ? "ログイン中..." : "Googleでサインイン"}</span>
					</motion.button>

					<p className="text-gray-500 text-sm text-center mt-4">
						学校のGoogleアカウントでログインしてください
					</p>
				</motion.div>

				{/* Download Section */}
				<motion.div variants={itemVariants} className="w-full">
					<p className="text-gray-500 text-center mb-4 text-sm">
						モバイルアプリもあります
					</p>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						{/* iOS Download */}
						<motion.a
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							href="#"
							className="btn-outline-dark flex-1 max-w-xs"
						>
							<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
								<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
							</svg>
							<div className="text-left">
								<div className="text-xs text-gray-400">Download on the</div>
								<div className="text-sm font-semibold">App Store</div>
							</div>
						</motion.a>

						{/* Android Download */}
						<motion.a
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							href="#"
							className="btn-outline-dark flex-1 max-w-xs"
						>
							<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
								<path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
							</svg>
							<div className="text-left">
								<div className="text-xs text-gray-400">GET IT ON</div>
								<div className="text-sm font-semibold">Google Play</div>
							</div>
						</motion.a>
					</div>
				</motion.div>

				{/* Footer */}
				<motion.div variants={itemVariants} className="mt-12 text-center">
					<p className="text-gray-600 text-sm">
						© 2025 Know Your Code. All rights reserved.
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}
 