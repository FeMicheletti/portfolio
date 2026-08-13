"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Clock3, House, Mail, UserRound, type LucideIcon } from "lucide-react";
import { usePortfolioAnalytics } from "@/components/public/analytics-provider";

type Locale = "PT_BR" | "EN_US";

type NavigationLabels = {
	home: string;
	about: string;
	projects: string;
	contact: string;
};

type SectionId = keyof NavigationLabels;

type NavigationItem = {
	id: SectionId;
	icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
	{ id: "home", icon: House },
	{ id: "about", icon: UserRound },
	{ id: "projects", icon: BriefcaseBusiness },
	{ id: "contact", icon: Mail },
];

export function FloatingHeader({ locale, navigation, timeZone }: { locale: Locale; navigation: NavigationLabels; timeZone: string; }) {
	const [activeSection, setActiveSection] = useState<SectionId>("home");
	const [time, setTime] = useState("");
	const { track } = usePortfolioAnalytics();

	useEffect(() => {
		function updateTime() {
			const now = new Date();

			const formattedTime = new Intl.DateTimeFormat(
				locale === "PT_BR" ? "pt-BR" : "en-US", {
					timeZone: timeZone,
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				},
			).format(now);

			setTime(formattedTime);
		}

		updateTime();

		const interval = window.setInterval(updateTime, 1000);

		return () => window.clearInterval(interval);
	}, [locale, timeZone]);

	useEffect(() => {
		let animationFrame = 0;

		function updateActiveSection() {
			cancelAnimationFrame(animationFrame);

			animationFrame = requestAnimationFrame(() => {
				const reachedPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

				if (reachedPageEnd) {
					setActiveSection("contact");
					return;
				}

				const activationLine = window.scrollY + window.innerHeight * 0.35;
				let currentSection: SectionId = "home";

				for (const item of navigationItems) {
					const section = document.getElementById(item.id);
					if (section && section.offsetTop <= activationLine) currentSection = item.id;
				}

				setActiveSection(currentSection);
			});
		}

		updateActiveSection();

		window.addEventListener("scroll", updateActiveSection, { passive: true });
		window.addEventListener("resize", updateActiveSection);

		return () => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener("scroll", updateActiveSection);
			window.removeEventListener("resize", updateActiveSection);
		};
	}, []);

	return (
		<header className="pointer-events-none fixed inset-x-0 top-0 z-50">
			<div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
				<div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/75 px-3 py-2 text-xs font-medium text-zinc-300 shadow-xl shadow-black/30 backdrop-blur-xl">
					<Clock3 className="size-4 text-violet-400" />
					<span className="hidden sm:inline">
						{locale === "PT_BR" ? "São Paulo" : "São Paulo"}
					</span>
					<span className="text-zinc-600">·</span>
					<span className="tabular-nums text-white">
						{time || "--:--"}
					</span>
					<span className="hidden text-zinc-500 sm:inline">
						BRT
					</span>
				</div>

				<nav aria-label="Navegação principal" className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[1.4rem] border border-white/15 bg-zinc-950/75 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl max-[360px]:left-3 max-[360px]:origin-left max-[360px]:translate-x-0 max-[360px]:scale-90">
					{navigationItems.map(({ id, icon: Icon }) => {
						const active = activeSection === id;
						const label = navigation[id];

						return (
							<a
								key={id}
								href={`#${id}`}
								aria-label={label}
								aria-current={active ? "page" : undefined}
								className={`group relative flex size-11 items-center justify-center rounded-2xl border transition-all duration-300 sm:size-12
								${active ? "border-violet-400/20 bg-violet-500/20 text-violet-300 shadow-inner shadow-violet-500/10" : "border-transparent text-zinc-400 hover:bg-white/8 hover:text-white"}`}
							>
								<Icon className="size-5" />

								<span className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-violet-400 transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />

								<span className="pointer-events-none absolute top-full mt-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-1 group-hover:opacity-100 md:block">{label}</span>
							</a>
						);
					})}
				</nav>

				<div className="pointer-events-auto flex items-center rounded-full border border-white/10 bg-zinc-950/75 p-1 text-xs font-medium shadow-xl shadow-black/30 backdrop-blur-xl">
					<Link href="/" onClick={() => locale !== "PT_BR" && track("LANGUAGE_CHANGE", { targetUrl: "/" })} aria-label="Português" className={locale === "PT_BR" ? "rounded-full bg-violet-600 px-3 py-1.5 text-white" : "px-3 py-1.5 text-zinc-500 transition-colors hover:text-white"}>
						PT
					</Link>

					<Link href="/?lang=en" onClick={() => locale !== "EN_US" && track("LANGUAGE_CHANGE", { targetUrl: "/?lang=en" })} aria-label="English" className={locale === "EN_US" ? "rounded-full bg-violet-600 px-3 py-1.5 text-white" : "px-3 py-1.5 text-zinc-500 transition-colors hover:text-white"}>
						EN
					</Link>
				</div>
			</div>
		</header>
	);
}
