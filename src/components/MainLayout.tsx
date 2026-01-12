import { NavLink, Outlet } from "react-router-dom";
import { Paths } from "../router/paths";

const navItems = [
	{
		path: Paths.HOME,
		label: "ホーム",
		icon: (
			<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
			</svg>
		),
	},
	{
		path: Paths.CLASSES,
		label: "科目",
		icon: (
			<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path d="M12 14l9-5-9-5-9 5 9 5z" />
				<path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
			</svg>
		),
	},
	{
		path: Paths.HOMEWORKS,
		label: "課題",
		icon: (
			<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
			</svg>
		),
	},
	{
		path: Paths.PROFILE,
		label: "プロフィール",
		icon: (
			<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
		),
	},
];

export function MainLayout() {
	return (
		<div className="flex flex-col min-h-screen">
			{/* Main content area */}
			<main className="flex-1 pb-20">
				<Outlet />
			</main>

			{/* Bottom navigation */}
			<nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50">
				<div className="max-w-lg mx-auto px-4">
					<ul className="flex justify-around items-center h-16">
						{navItems.map((item) => (
							<li key={item.path}>
								<NavLink
									to={item.path}
									end={item.path === Paths.HOME}
									className={({ isActive }) =>
										`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
											isActive
												? "text-purple-600 dark:text-purple-400"
												: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
										}`
									}
								>
									{item.icon}
									<span className="text-xs font-medium">{item.label}</span>
								</NavLink>
							</li>
						))}
					</ul>
				</div>
			</nav>
		</div>
	);
}
