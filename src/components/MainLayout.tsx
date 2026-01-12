import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Paths } from "../router/paths";

const navItems = [
	{
		path: Paths.HOME,
		label: "ホーム",
		icon: (isActive: boolean) => (
			<svg className="w-6 h-6" fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
			</svg>
		),
	},
	{
		path: Paths.CLASSES,
		label: "科目",
		icon: (isActive: boolean) => (
			<svg className="w-6 h-6" fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
			</svg>
		),
	},
	{
		path: Paths.HOMEWORKS,
		label: "課題",
		icon: (isActive: boolean) => (
			<svg className="w-6 h-6" fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
			</svg>
		),
	},
	{
		path: Paths.PROFILE,
		label: "プロフィール",
		icon: (isActive: boolean) => (
			<svg className="w-6 h-6" fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
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
						<feColorMatrix
							in="blur"
							mode="matrix"
							values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
							result="goo"
						/>
						<feComposite in="SourceGraphic" in2="goo" operator="atop" />
					</filter>
				</defs>
			</svg>

			{/* Main liquid blob - simple transparent glass */}
			<motion.div
				className="absolute top-1.5 h-[52px] pointer-events-none"
				style={{
					left: springX,
					width,
					skewX,
					scaleX,
					scaleY,
				}}
			>
				<div className="relative w-full h-full rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg" />
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
			<main className="flex-1 pb-24">
				<Outlet />
			</main>

			{/* Bottom navigation - Liquid Glass Style */}
			<nav className="fixed bottom-4 left-4 right-4 z-50">
				<div className="max-w-md mx-auto">
					<div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[28px] shadow-2xl shadow-black/30 overflow-visible">
						{/* Inner glass reflection */}
						<div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/10 via-transparent to-black/10 pointer-events-none" />
						
						{/* Liquid Glass Indicator */}
						<LiquidGlassIndicator left={indicatorPos.left} width={indicatorPos.width} />

						<ul ref={navRef} className="relative flex justify-around items-center h-16 px-4">
							{navItems.map((item, index) => {
								const isActive = activeIndex === index;
								return (
									<li
										key={item.path}
										ref={(el) => { itemRefs.current[index] = el; }}
									>
										<NavLink
											to={item.path}
											end={item.path === Paths.HOME}
											className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-colors"
										>
											<motion.div
												className="flex flex-col items-center gap-0.5"
												animate={{
													scale: isActive ? 1.15 : 1,
													y: isActive ? -1 : 0,
												}}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 25,
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
													className="text-[10px] font-medium"
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
		</div>
	);
}
