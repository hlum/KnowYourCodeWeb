import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Paths } from "../router/paths";

const navItems = [
	{
		path: Paths.HOME,
		label: "ホーム",
		icon: (isActive: boolean) => (
			<img src={isActive ? new URL("../assets/house.fill.svg", import.meta.url).href : new URL("../assets/house.svg", import.meta.url).href} className="w-6 h-6" alt="home" />
		),
	},
	{
		path: Paths.CLASSES,
		label: "科目",
		icon: (isActive: boolean) => (
			<img src={isActive ? new URL("../assets/graduationcap.fill.svg", import.meta.url).href : new URL("../assets/graduationcap.svg", import.meta.url).href} className="w-6 h-6" alt="classes" />
		),
	},
	{
		path: Paths.HOMEWORKS,
		label: "課題",
		icon: (isActive: boolean) => (
			<img
				src={isActive ? new URL("../assets/list.clipboard.fill.svg", import.meta.url).href : new URL("../assets/list.clipboard.svg", import.meta.url).href}
				className="w-6 h-6"
				alt="classes"
			/>
		),
	},
	{
		path: Paths.PROFILE,
		label: "プロフィール",
		icon: (isActive: boolean) => (
			<img
				src={isActive ? new URL("../assets/person.crop.circle.fill.svg", import.meta.url).href : new URL("../assets/person.crop.circle.svg", import.meta.url).href}
				className="w-6 h-6"
				alt="profile"
			/>
		),
	},
];

// Liquid Glass Indicator Component
function LiquidGlassIndicator({ left, width }: { left: number; width: number }) {
	const x = useMotionValue(left);
	const springX = useSpring(x, { stiffness: 300, damping: 25, mass: 0.8 });

	// Create wobble effect based on velocity
	const skewX = useTransform(springX, () => {
		const velocity = springX.getVelocity();
		return Math.max(-15, Math.min(15, velocity * 0.02));
	});

	const scaleX = useTransform(springX, () => {
		const velocity = Math.abs(springX.getVelocity());
		return 1 + Math.min(0.3, velocity * 0.0003);
	});

	const scaleY = useTransform(springX, () => {
		const velocity = Math.abs(springX.getVelocity());
		return 1 - Math.min(0.15, velocity * 0.00015);
	});

	useEffect(() => {
		x.set(left);
	}, [left, x]);

	return (
		<>
			{/* SVG Filter for liquid/gooey effect */}
			<svg className="absolute w-0 h-0">
				<defs>
					<filter id="liquid-glass-filter">
						<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
						<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
						<feComposite in="SourceGraphic" in2="goo" operator="atop" />
					</filter>
				</defs>
			</svg>

			{/* Main liquid blob - simple transparent glass */}
			<motion.div
				className="absolute top-1 h-14 pointer-events-none"
				style={{
					left: springX,
					width,
					skewX,
					scaleX,
					scaleY,
				}}
			>
				<div className="relative w-full h-full rounded-2xl overflow-hidden bg-white/6 backdrop-blur-xl border border-white/2 shadow-lg" />
			</motion.div>
		</>
	);
}

export function MainLayout() {
	const location = useLocation();
	const [activeIndex, setActiveIndex] = useState(0);
	const [indicatorPos, setIndicatorPos] = useState({ left: 0, width: 0 });
	const navRef = useRef<HTMLUListElement>(null);
	const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

	// Check if we're on the questions page (hide bottom nav during test)
	const isOnQuestionsPage = location.pathname.includes("/questions");

	// Find active index based on current path
	useEffect(() => {
		const index = navItems.findIndex((item) => {
			if (item.path === Paths.HOME) {
				return location.pathname === item.path;
			}
			return location.pathname.startsWith(item.path);
		});
		if (index !== -1) {
			setActiveIndex(index);
		}
	}, [location.pathname]);

	// Update indicator position
	const updateIndicatorPosition = useCallback(() => {
		const activeItem = itemRefs.current[activeIndex];
		const navElement = navRef.current;
		if (activeItem && navElement) {
			const navRect = navElement.getBoundingClientRect();
			const itemRect = activeItem.getBoundingClientRect();
			const itemCenter = itemRect.left - navRect.left + itemRect.width / 2;
			const indicatorWidth = 60;
			setIndicatorPos({
				left: itemCenter - indicatorWidth / 2,
				width: indicatorWidth,
			});
		}
	}, [activeIndex]);

	useEffect(() => {
		updateIndicatorPosition();
		window.addEventListener("resize", updateIndicatorPosition);
		return () => window.removeEventListener("resize", updateIndicatorPosition);
	}, [updateIndicatorPosition]);

	return (
		<div className="flex flex-col min-h-screen">
			{/* Main content area */}
			<main className={`flex-1 ${isOnQuestionsPage ? "pb-0" : "pb-24"}`}>
				<Outlet />
			</main>

			{/* Bottom navigation - Glass Style */}
			{!isOnQuestionsPage && (
				<nav className="fixed bottom-4 left-4 right-4 z-50">
					<div className="max-w-md mx-auto">
						<div className="relative bg-white/5 backdrop-blur-2xl border border-white/15 rounded-[28px] shadow-2xl shadow-black/40 overflow-visible">
							{/* Inner glass reflection */}
							<div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none" />

							{/* Liquid Glass Indicator */}
							<LiquidGlassIndicator left={indicatorPos.left} width={indicatorPos.width} />

							<ul ref={navRef} className="relative flex justify-around items-center h-16 px-4">
								{navItems.map((item, index) => {
									const isActive = activeIndex === index;
									return (
										<li
											key={item.path}
											ref={(el) => {
												itemRefs.current[index] = el;
											}}
										>
											<NavLink
												to={item.path}
												end={item.path === Paths.HOME}
												className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-colors"
											>
												<motion.div
													className="flex flex-col items-center gap-0.5"
													animate={{
														scale: isActive ? 1.1 : 1,
														y: isActive ? -4 : 0,
													}}
													transition={{
														type: "spring",
														stiffness: 400,
														damping: 20,
													}}
												>
													<motion.div
														animate={{
															color: isActive ? "#ffffff" : "#9ca3af",
															filter: isActive ? "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))" : "none",
														}}
														transition={{ duration: 0.2 }}
													>
														{item.icon(isActive)}
													</motion.div>
													<motion.span
														className="text-[9px] font-medium"
														animate={{
															opacity: isActive ? 1 : 0.6,
															color: isActive ? "#ffffff" : "#9ca3af",
														}}
														transition={{ duration: 0.2 }}
													>
														{item.label}
													</motion.span>
												</motion.div>
											</NavLink>
										</li>
									);
								})}
							</ul>

							{/* Bottom edge highlight */}
							<div className="absolute bottom-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
						</div>
					</div>
				</nav>
			)}
		</div>
	);
}
