import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import appLogo from "../assets/appLogo.png";
import googleIcon from "../assets/google.png";
import { authManager } from "../managers/authManager";
import DarkVeil from "../components/DarkVeil";
import GlassSurface from "../components/GlassSurface";
import SplashCursor from "../components/SplashCursor";

// Feature data
const features = [
	{
		id: 1,
		title: "10秒アークタイマー",
		description: "集中力を維持するため、10秒ごとにタップが必要。本番さながらの緊張感を体験",
		gradient: "from-blue-500 to-cyan-500",
	},
	{
		id: 2,
		title: "戻れない設計",
		description: "一度始めたら戻れない。本物の試験のような環境で真の実力を測定",
		gradient: "from-purple-500 to-pink-500",
	},
	{
		id: 3,
		title: "全プラットフォーム対応",
		description: "iOS、Android、Webどこでも同じ体験。デバイスを選ばず学習可能",
		gradient: "from-green-500 to-emerald-500",
	},
	{
		id: 4,
		title: "詳細な統計分析",
		description: "理解度を可視化し、成長を追跡。弱点を明確にして効率的に学習",
		gradient: "from-orange-500 to-red-500",
	},
	{
		id: 5,
		title: "リアルタイム採点",
		description: "即座に結果を確認。フィードバックループで効率的な学習をサポート",
		gradient: "from-yellow-500 to-orange-500",
	},
	{
		id: 6,
		title: "クラス管理システム",
		description: "課題と科目を整理整頓。学習の進捗を一目で把握できる",
		gradient: "from-indigo-500 to-purple-500",
	},
];

// 3D Rotating Feature Card Component with Z-axis rotation and tilt
function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
	const cardRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(cardRef, { once: true, margin: "-100px" });

	// Static rotation values - no continuous scroll tracking
	const rotateZ = ((index % 3) - 1) * 5; // Slight rotation variation per card
	const tiltX = -3;
	const tiltY = 3;

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 100, scale: 0.9 }}
			animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
			transition={{
				duration: 0.7,
				delay: index * 0.1,
				ease: [0.22, 1, 0.36, 1],
			}}
			style={{
				perspective: "1500px",
			}}
			className="group"
		>
			<motion.div
				initial={{
					rotateX: 0,
					rotateY: 0,
					rotateZ: 0,
				}}
				animate={
					isInView
						? {
								rotateX: tiltX,
								rotateY: tiltY,
								rotateZ: rotateZ,
						  }
						: {}
				}
				transition={{
					type: "spring",
					stiffness: 80,
					damping: 25,
					delay: index * 0.1 + 0.2,
				}}
				whileHover={{
					rotateX: tiltX * 1.5,
					rotateY: tiltY * 1.5,
					scale: 1.02,
				}}
				style={{
					transformStyle: "preserve-3d",
				}}
				className="relative glass-card p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-300"
			>
				{/* Gradient indicator bar */}
				<div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${feature.gradient} rounded-t-2xl`} />

				{/* Gradient background on hover */}
				<div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />

				{/* Title */}
				<h3 className="text-2xl font-bold text-white mb-4 relative z-10 mt-4">{feature.title}</h3>

				{/* Description */}
				<p className="text-gray-400 leading-relaxed relative z-10">{feature.description}</p>

				{/* Shine effect */}
				<motion.div
					className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"
					style={{ transformStyle: "preserve-3d" }}
				/>

				{/* Decorative corner accent */}
				<div className={`absolute bottom-4 right-4 w-12 h-12 bg-linear-to-br ${feature.gradient} opacity-20 rounded-lg blur-sm`} />
			</motion.div>
		</motion.div>
	);
}

// Parallax Background Element
function ParallaxShape({ className, speed = 0.5 }: { className: string; speed?: number }) {
	const { scrollY } = useScroll();
	const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);

	return <motion.div style={{ y }} className={className} />;
}

export function LoginView() {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

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
		<div className="relative min-h-screen bg-black overflow-hidden">
			{/* Threads Background */}
			{/* Background Effects */}
			<div className="absolute inset-0 z-0 pointer-events-none">
				<SplashCursor />
				{/* <LiquidEther /> */}
				{/* <GradientBlinds /> */}
				<DarkVeil speed={3} hueShift={46} warpAmount={5} />
			</div>{" "}
			{/* Progress bar */}
			<motion.div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 origin-left z-50" style={{ scaleX }} />
			{/* Fixed Header with Sign In Button */}
			<motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-1 left-0 right-0 z-40 px-6 py-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					{/* Logo/Brand */}
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
						<img src={appLogo} alt="Know Your Code" className="w-10 h-10 object-contain" />
						<span className="text-white font-bold text-lg hidden sm:block">Know Your Code</span>
					</motion.div>

					{/* Sign In Button */}
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleGoogleSignIn} disabled={isLoading}>
						<GlassSurface width={150} height={55}>
							{isLoading ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<img src={googleIcon} alt="Google" className="w-5 h-5 mr-2" />
							)}
							<span className="text-white font-medium">{isLoading ? "ログイン中..." : "サインイン"}</span>
						</GlassSurface>
					</motion.button>
				</div>
			</motion.header>
			{/* Animated background blobs */}
			<div className="fixed inset-0 pointer-events-none">
				<ParallaxShape className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" speed={0.3} />
				<ParallaxShape className="absolute top-1/2 right-20 w-125 h-125 bg-blue-500/10 rounded-full blur-3xl" speed={0.5} />
				<ParallaxShape className="absolute bottom-20 left-1/3 w-100 h-100 bg-pink-500/10 rounded-full blur-3xl" speed={0.4} />
			</div>
			{/* Error Alert */}
			{error && (
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-20 left-1/2 transform -translate-x-1/2 glass-card px-6 py-4 z-50 border-red-500/30">
					<div className="flex items-center gap-3 text-red-400">
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="font-medium">{error}</span>
						<button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300">
							×
						</button>
					</div>
				</motion.div>
			)}
			<div className="relative z-10">
				{/* Hero Section */}
				<section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
					<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="text-center">
						{/* Title with gradient */}
						<motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-6xl md:text-8xl font-black mb-6">
							<span className="bg-linear-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">Know Your Code</span>
						</motion.h1>

						{/* Subtitle */}
						<motion.p
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.8 }}
							className="text-2xl md:text-3xl text-gray-300 mb-8 font-light"
						>
							真の実力を、集中力とともに
						</motion.p>

						{/* CTA */}
						<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="text-white text-xl font-semibold"
								onClick={() => {
									document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
								}}
							>
								<GlassSurface width={250} height={60} displace={1.6}>
									機能を見る
								</GlassSurface>
							</motion.button>
						</motion.div>
					</motion.div>
				</section>

				{/* Features Section */}
				<section id="features" className="py-20 px-6">
					<div className="max-w-7xl mx-auto">
						{/* Section Title */}
						<motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
							<h2 className="text-5xl md:text-6xl font-bold text-white mb-6">革新的な機能</h2>
							<p className="text-xl text-gray-400 max-w-2xl mx-auto">真の実力を測定しながら、証明する</p>
						</motion.div>

						{/* Feature Cards Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{features.map((feature, index) => (
								<FeatureCard key={feature.id} feature={feature} index={index} />
							))}
						</div>
					</div>
				</section>

				{/* How it Works Section */}
				<section className="py-20 px-6">
					<div className="max-w-5xl mx-auto">
						<motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
							<h2 className="text-5xl font-bold text-white mb-6">使い方</h2>
						</motion.div>

						<div className="space-y-12">
							{[
								{ step: "01", title: "ログイン", desc: "Googleアカウントでサインイン" },
								{ step: "02", title: "課題を選択", desc: "GitHub・Google Driveのリンクを提出" },
								{ step: "03", title: "AIがクイズを自動生成", desc: "提出されたコードから理解度テストを作成" },
								{ step: "04", title: "不正防止", desc: "10秒ごとにタップしないと「AIに聞いている？」と判定" },
								{ step: "05", title: "結果を確認", desc: "詳細な統計データで理解度を可視化" },
							].map((item, index) => (
								<motion.div
									key={item.step}
									initial={{ opacity: 0, y: 80, scale: 0.95 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: true, margin: "-50px" }}
									transition={{
										duration: 0.7,
										delay: index * 0.15,
										ease: [0.22, 1, 0.36, 1],
									}}
									className="glass-card p-8 flex items-center gap-8"
								>
									<div className="text-6xl font-black text-purple-500">{item.step}</div>
									<div>
										<h3 className="text-3xl font-bold text-white mb-2">{item.title}</h3>
										<p className="text-gray-400 text-lg">{item.desc}</p>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="py-16 px-6 border-t border-white/10">
					<motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-7xl mx-auto">
						{/* Download Section */}
						<div className="mb-12">
							<p className="text-gray-400 text-center mb-6 text-lg">モバイルアプリもあります</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
								{/* iOS Download */}
								<motion.a whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} href="#" className="btn-outline-dark flex-1 w-full sm:w-auto min-w-50">
									<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
										<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
									</svg>
									<div className="text-left">
										<div className="text-xs text-gray-400">Download on the</div>
										<div className="text-sm font-semibold">App Store</div>
									</div>
								</motion.a>

								{/* Android Download */}
								<motion.a whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} href="#" className="btn-outline-dark flex-1 w-full sm:w-auto min-w-50">
									<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
										<path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
									</svg>
									<div className="text-left">
										<div className="text-xs text-gray-400">GET IT ON</div>
										<div className="text-sm font-semibold">Google Play</div>
									</div>
								</motion.a>
							</div>
						</div>

						{/* Copyright */}
						<div className="text-center border-t border-white/5 pt-8">
							<p className="text-gray-600 text-sm mb-2">© 2025 Know Your Code. All rights reserved.</p>
							<p className="text-gray-700 text-xs">Made with love at JEC (Japan Electronics College)</p>
						</div>
					</motion.div>
				</footer>
			</div>
		</div>
	);
}
