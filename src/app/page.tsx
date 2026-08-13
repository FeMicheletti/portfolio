import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FloatingHeader } from "@/components/public/floating-header";
import heroBackground from "@/assets/background.png";
import { ArrowUpRight, Download, BriefcaseBusiness, CheckCircle2, Code2, ContactRound, GitBranch, Mail, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { TechnologySlider } from "@/components/public/technology-slider";
import { CareerTimeline } from "@/components/public/career-timeline";
import { TechnologyIcon } from "@/components/public/technology-icon";
import { AnalyticsLink, AnalyticsProjectView, AnalyticsProvider } from "@/components/public/analytics-provider";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const copy = {
	PT_BR: {
		navigation: {
			home: "Início",
			about: "Sobre",
			projects: "Projetos",
			contact: "Contato",
		},
		heroGreeting: "Olá, eu sou",
		heroName: "Felipe Micheletti",
		heroRole: "Full-Stack Developer",
		downloadResume: "Baixar currículo",
		linkedinCta: "Acessar LinkedIn",
		resumeUnavailable: "Currículo ainda não cadastrado",
		years: "anos de experiência",
		projects: "projetos publicados",
		technologies: "tecnologias",
		projectsEyebrow: "Trabalho selecionado",
		projectsTitle: "Projetos paralelos",
		projectsDescription: "Outros projetos ao longo da minha carreira",
		featured: "Destaque",
		viewDemo: "Ver projeto",
		viewCode: "Código",
		viewCase: "Ver case completo",
		noProjects: "Os primeiros cases serão publicados em breve.",
		stacksEyebrow: "Tecnologias",
		stacksTitle: "Ferramentas escolhidas para cada desafio",
		stacksDescription: "Uma base multidisciplinar para trabalhar entre produto, frontend, backend, mobile, dados e infraestrutura.",
		contactEyebrow: "Vamos conversar",
		contactTitle: "Tem um desafio interessante em mente?",
		contactDescription: "Estou aberto a oportunidades internacionais, projetos de software e conversas sobre tecnologia.",
		location: "Rio de Janeiro, Brasil",
		sendEmail: "Enviar e-mail",
		technologiesSliderLabel: "Principais tecnologias",
		aboutEyebrow: "Sobre mim",
		aboutTitle: "Experiência construída entre produto, código e liderança",
		aboutDescription: "Desenvolvedor Full-Stack desde 2020, atuo da descoberta do problema à entrega e evolução do produto. Minha trajetória combina desenvolvimento, decisões de arquitetura e liderança de times multidisciplinares.",
		currentRole: "Atual",
		openExperience: "Ver detalhes da experiência",
	},
	EN_US: {
		navigation: {
			home: "Home",
			about: "About",
			projects: "Projects",
			contact: "Contact",
		},
		heroGreeting: "Hi, I am",
		heroName: "Felipe Micheletti",
		heroRole: "Full-Stack Developer",
		downloadResume: "Download resume",
		linkedinCta: "Open LinkedIn",
		resumeUnavailable: "Resume not available yet",
		years: "years of experience",
		projects: "published projects",
		technologies: "technologies",
		projectsEyebrow: "Selected work",
		projectsTitle: "Side Projects",
		projectsDescription: "Other projects throughout my career.",
		featured: "Featured",
		viewDemo: "View project",
		viewCode: "Code",
		viewCase: "View full case",
		noProjects: "The first case studies will be published soon.",
		stacksEyebrow: "Technologies",
		stacksTitle: "Tools chosen for each challenge",
		stacksDescription: "A multidisciplinary foundation for working across product, frontend, backend, mobile, data and infrastructure.",
		contactEyebrow: "Let's talk",
		contactTitle: "Have an interesting challenge in mind?",
		contactDescription: "I am open to international opportunities, software projects and conversations about technology.",
		location: "Rio de Janeiro, Brazil",
		sendEmail: "Send an email",
		technologiesSliderLabel: "Core technologies",
		aboutEyebrow: "About me",
		aboutTitle: "Experience built across product, code and leadership",
		aboutDescription: "A Full-Stack Developer since 2020, I work from problem discovery through product delivery and evolution. My career combines hands-on development, architecture decisions and multidisciplinary team leadership.",
		currentRole: "Present",
		openExperience: "View experience details",
	},
} as const;

type PublicLocale = keyof typeof copy;

function externalLinkProps() {
	return { target: "_blank", rel: "noreferrer" } as const;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
	const { lang } = await searchParams;
	const english = lang === "en";
	const title = "Felipe Micheletti";
	const description = english
		? "Felipe Micheletti's portfolio. Full-Stack Developer experienced in web products, APIs, mobile applications, cloud and technical leadership."
		: "Portfólio de Felipe Micheletti. Desenvolvedor Full-Stack com experiência em produtos web, APIs, aplicações mobile, cloud e liderança técnica.";
	const url = english ? "/?lang=en" : "/";

	return {
		title: { absolute: title },
		description,
		alternates: {
			canonical: url,
			languages: { "pt-BR": "/", "en-US": "/?lang=en", "x-default": "/" },
		},
		openGraph: {
			type: "profile",
			url,
			title,
			description,
			siteName: "Felipe Micheletti",
			locale: english ? "en_US" : "pt_BR",
			alternateLocale: [english ? "pt_BR" : "en_US"],
			images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Felipe Micheletti — Full-Stack Developer" }],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ["/twitter-image"],
		},
	};
}

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
	const { lang } = await searchParams;
	const locale: PublicLocale = lang === "en" ? "EN_US" : "PT_BR";
	const content = copy[locale];

	const [settings, projects, categories, experiences, resume, publishedProjects, visibleTechnologies] = await Promise.all([
		prisma.siteSettings.findUnique({ where: { id: "main" } }),
		prisma.project.findMany({
			where: { status: "PUBLISHED" },
			orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
			select: {
				id: true,
				slug: true,
				featured: true,
				repositoryUrl: true,
				demoUrl: true,
				translations: {
					where: { locale },
					take: 1,
					select: { title: true, summary: true },
				},
				technologies: {
					where: { technology: { visible: true, category: { visible: true } } },
					orderBy: { sortOrder: "asc" },
					take: 5,
					select: {
						technology: { select: { id: true, name: true, color: true } },
					},
				},
				media: {
					where: { role: "COVER" },
					take: 1,
					select: { mediaId: true, altPt: true, altEn: true },
				},
			},
		}),
		prisma.technologyCategory.findMany({
			where: { visible: true, technologies: { some: { visible: true } } },
			orderBy: [{ sortOrder: "asc" }, { namePt: "asc" }],
			select: {
				id: true,
				namePt: true,
				nameEn: true,
				technologies: {
					where: { visible: true },
					orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
					select: { id: true, name: true, color: true, iconKey: true },
				},
			},
		}),
		prisma.experience.findMany({
			where: { visible: true },
			orderBy: [{ startedAt: "desc" }],
			select: {
				id: true,
				company: true,
				location: true,
				companyUrl: true,
				startedAt: true,
				finishedAt: true,
				current: true,
				translations: {
					where: { locale },
					take: 1,
					select: { title: true, summary: true, description: true },
				},
			},
		}),
		prisma.resume.findUnique({
			where: { locale },
			select: { mediaId: true },
		}),
		prisma.project.count({ where: { status: "PUBLISHED" } }),
		prisma.technology.count({
			where: { visible: true, category: { visible: true } },
		}),
	]);

	const contactEmail = settings?.contactEmail || "felipemicheletti.dev@gmail.com";
	const githubUrl = settings?.githubUrl || "https://github.com/FeMicheletti";
	const linkedinUrl = settings?.linkedinUrl || "https://www.linkedin.com/in/felipe-micheletti";
	const heroTitle = (locale === "PT_BR" ? settings?.heroTitlePt : settings?.heroTitleEn) || content.heroRole;
	const heroImage = settings?.heroMediaId ? `/api/media/${settings.heroMediaId}` : heroBackground;

	const mainTechnologies = categories
		.flatMap((category) => category.technologies)
		.filter((technology, index, technologies) => technologies.findIndex((item) => item.id === technology.id) === index)
		.slice(0, 12);
	const publicPath = locale === "EN_US" ? "/?lang=en" : "/";
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"@id": absoluteUrl(`${publicPath}#profile`),
		url: absoluteUrl(publicPath),
		name: locale === "EN_US" ? "Felipe Micheletti | Full-Stack Developer" : "Felipe Micheletti | Desenvolvedor Full-Stack",
		inLanguage: locale === "EN_US" ? "en-US" : "pt-BR",
		mainEntity: {
			"@type": "Person",
			"@id": absoluteUrl("/#felipe-micheletti"),
			name: "Felipe Micheletti",
			url: absoluteUrl("/"),
			jobTitle: heroTitle,
			email: `mailto:${contactEmail}`,
			sameAs: [githubUrl, linkedinUrl],
			knowsAbout: mainTechnologies.map((technology) => technology.name),
			address: {
				"@type": "PostalAddress",
				addressLocality: settings?.location || content.location,
			},
		},
	};

	return (
		<AnalyticsProvider locale={locale}>
		<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
		<div lang={locale === "EN_US" ? "en-US" : "pt-BR"} className="dark min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100 selection:bg-violet-500/30">
			<div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.16),transparent_32%),radial-gradient(circle_at_85%_30%,rgba(79,70,229,0.1),transparent_25%)]" />

			<FloatingHeader locale={locale} navigation={content.navigation} timeZone={settings?.timezone ?? "America/Sao_Paulo"} />

			<main className="relative">
				<section id="home" className="relative isolate min-h-svh overflow-hidden border-b border-white/5">
					<Image src={heroImage} alt="" fill priority sizes="100vw" unoptimized={Boolean(settings?.heroMediaId)} className="absolute inset-0 -z-30 object-cover object-[62%_center] sm:object-center" />
					<div className="absolute inset-0 -z-20 bg-zinc-950/30" />
					<div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.78)_22%,rgba(9,9,11,0.28)_52%,rgba(9,9,11,0.62)_80%)]" />
					<div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-linear-to-t from-zinc-950 to-transparent" />

					<div className="grid min-h-svh items-center px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8 lg:py-28">
						<div className="relative w-full max-w-lg justify-self-start lg:ml-16">
							<div className="absolute -inset-8 rounded-full bg-violet-600/15 blur-3xl" />
							<div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950/72 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-8">
								<div className="flex items-center justify-between border-b border-white/10 pb-5">
									<div className="flex gap-2">
										<span className="size-3 rounded-full bg-red-400" />
										<span className="size-3 rounded-full bg-amber-400" />
										<span className="size-3 rounded-full bg-emerald-400" />
									</div>
									<span className="font-mono text-xs tracking-wider text-zinc-500">portfolio.ts</span>
								</div>

								<div className="space-y-4 py-7 font-mono text-sm leading-7 sm:text-base sm:leading-8">
									<p>
										<span className="text-violet-400">const</span> <span className="text-sky-300">developer</span> <span className="text-zinc-500">=</span> <span className="text-zinc-300">&#123;</span>
									</p>
									<p className="pl-5 sm:pl-8">
										<span className="text-zinc-500">name</span> <span className="text-emerald-300">&quot;{content.heroName}&quot;</span>,
									</p>
									<p className="pl-5 sm:pl-8">
										<span className="text-zinc-500">role:</span> <span className="text-emerald-300">&quot;{heroTitle}&quot;</span>,
									</p>
									<p className="pl-5 sm:pl-8">
										<span className="text-zinc-500">location:</span> <span className="text-emerald-300">&quot;{settings?.location || content.location}&quot;</span>
									</p>
									<p>
										<span className="text-zinc-300">&#125;</span>;
									</p>
								</div>

								<div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
									{[
										{
											value: `${new Date().getFullYear() - 2020}+`,
											label: content.years,
										},
										{ value: publishedProjects, label: content.projects },
										{
											value: `${visibleTechnologies}+`,
											label: content.technologies,
										},
									].map((item) => (
										<div key={item.label}>
											<p className="text-xl font-semibold text-white sm:text-2xl">{item.value}</p>
											<p className="mt-1 text-[10px] leading-4 text-zinc-500 sm:text-xs">{item.label}</p>
										</div>
									))}
								</div>
							</div>
							<div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-zinc-950/65 p-2 shadow-xl shadow-black/30 backdrop-blur-xl sm:grid-cols-2">
								{resume ? (
									<Button asChild size="lg" className="group h-14 justify-start rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 text-white shadow-none transition-all hover:border-violet-400/40 hover:bg-violet-500/20">
										<AnalyticsLink eventType="RESUME_DOWNLOAD" href={`/api/media/${resume.mediaId}?download=1&filename=Felipe-Micheletti-CV.pdf`}>
											<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white shadow-lg shadow-violet-950/50 transition-transform group-hover:-translate-y-0.5">
												<Download className="size-4" />
											</span>
											<span className="flex flex-col items-start leading-none">
												<span className="text-sm font-medium">{content.downloadResume}</span>
												<span className="mt-1.5 font-mono text-[10px] font-normal text-zinc-500">PDF · download</span>
											</span>
										</AnalyticsLink>
									</Button>
								) : (
									<Button size="lg" disabled title={content.resumeUnavailable} className="h-14 justify-start rounded-xl border border-white/5 bg-white/3 px-3 text-zinc-500 disabled:opacity-60">
										<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
											<Download className="size-4" />
										</span>
										<span className="flex flex-col items-start leading-none">
											<span className="text-sm font-medium">{content.downloadResume}</span>
											<span className="mt-1.5 font-mono text-[10px] font-normal text-zinc-600">{content.resumeUnavailable}</span>
										</span>
									</Button>
								)}
								<Button asChild size="lg" variant="ghost" className="group h-14 justify-start rounded-xl border border-transparent px-3 text-white transition-all hover:border-sky-400/20 hover:bg-sky-400/10 hover:text-white">
									<AnalyticsLink eventType="LINKEDIN_CLICK" href={linkedinUrl} {...externalLinkProps()}>
										<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0a66c2] text-white shadow-lg shadow-sky-950/40 transition-transform group-hover:-translate-y-0.5">
											<FaLinkedin className="size-4" />
										</span>

										<span className="flex flex-col items-start leading-none">
											<span className="text-sm font-medium">{content.linkedinCta}</span>
											<span className="mt-1.5 font-mono text-[10px] font-normal text-zinc-500">linkedin.com</span>
										</span>
									</AnalyticsLink>
								</Button>
							</div>
						</div>
					</div>
				</section>

				<TechnologySlider technologies={mainTechnologies} label={content.technologiesSliderLabel} />

				<section id="about" className="scroll-mt-20 py-16 sm:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
							<SectionHeading eyebrow={content.aboutEyebrow} title={content.aboutTitle} description={content.aboutDescription} />
							{experiences.length ? <CareerTimeline experiences={experiences} locale={locale} currentLabel={content.currentRole} openLabel={content.openExperience} /> : null}
						</div>
					</div>
				</section>

				<section id="projects" className="scroll-mt-20 border-y border-white/5 bg-zinc-900/30 py-16 sm:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<SectionHeading eyebrow={content.projectsEyebrow} title={content.projectsTitle} description={content.projectsDescription} />

						{projects.length ? (
							<div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
								{projects.map((project, index) => {
									const translation = project.translations[0];
									const cover = project.media[0];
									return (
										<AnalyticsProjectView key={project.id} projectId={project.id} className="group min-w-[320px] snap-start overflow-hidden rounded-2xl border border-white/8 bg-zinc-950/60 transition duration-300 hover:-translate-y-1 hover:border-violet-500/25 hover:shadow-2xl hover:shadow-violet-950/20 sm:min-w-95 lg:min-w-105">
											<div className="relative aspect-video overflow-hidden border-b border-white/5 bg-linear-to-br from-violet-900/30 to-zinc-900">
												{cover ? (
													<Image
														src={`/api/media/${cover.mediaId}`}
														alt={(locale === "PT_BR" ? cover.altPt : cover.altEn) || translation?.title || project.slug}
														fill
														unoptimized
														loading={index < 2 ? "eager" : "lazy"}
														className="object-cover transition duration-500 group-hover:scale-[1.03]" />
												) : (
													<div className="flex h-full items-center justify-center">
														<BriefcaseBusiness className="size-10 text-violet-400/35" />
													</div>
												)}
												{project.featured ? (
													<span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-zinc-950/80 px-3 py-1 text-xs font-medium text-violet-200 backdrop-blur">
														<Sparkles className="size-3" />
														{content.featured}
													</span>
												) : null}
											</div>
											<div className="p-6 sm:p-7">
												<h3 className="text-xl font-semibold tracking-tight text-white">
													{translation?.title || project.slug}
												</h3>
												<p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
													{translation?.summary}
												</p>
												<div className="mt-5 flex flex-wrap gap-2">
													{project.technologies.map(({ technology }) => (
														<span key={technology.id} className="rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-[11px] text-zinc-400" style={technology.color ? { borderColor: `${technology.color}35` } : undefined}>
															{technology.name}
														</span>
													))}
												</div>
												<Link href={`/projetos/${project.slug}${locale === "EN_US" ? "?lang=en" : ""}`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200">{content.viewCase}<ArrowUpRight className="size-4" /></Link>
												{project.demoUrl || project.repositoryUrl ? (
													<div className="mt-6 flex flex-wrap gap-3">
														{project.demoUrl ? (
															<AnalyticsLink eventType="PROJECT_DEMO_CLICK" projectId={project.id} href={project.demoUrl} {...externalLinkProps()} className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 hover:text-violet-200">
																{content.viewDemo}
																<ArrowUpRight className="size-4" />
															</AnalyticsLink>
														) : null}
														{project.repositoryUrl ? (
															<AnalyticsLink eventType="PROJECT_GITHUB_CLICK" projectId={project.id} href={project.repositoryUrl} {...externalLinkProps()} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white">
																<GitBranch className="size-4" />
																{content.viewCode}
															</AnalyticsLink>
														) : null}
													</div>
												) : null}
											</div>
										</AnalyticsProjectView>
									);
								})}
							</div>
						) : (
							<div className="mt-12 rounded-2xl border border-dashed border-violet-500/20 bg-violet-500/3 px-6 py-14 text-center text-sm text-zinc-500">
								{content.noProjects}
							</div>
						)}
					</div>
				</section>

				<section id="stacks" className="border-b border-white/5 py-12 sm:py-14">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<SectionHeading eyebrow={content.stacksEyebrow} title={content.stacksTitle} description={content.stacksDescription} />
						<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{categories.map((category) => (
								<div key={category.id} className="rounded-2xl border border-white/8 bg-white/2.5 p-5 transition hover:border-violet-500/20 hover:bg-violet-500/4">
									<h3 className="flex items-center gap-2 font-medium text-white">
										<Code2 className="size-4 text-violet-300" />
										{locale === "PT_BR" ? category.namePt : category.nameEn}
									</h3>
									<div className="mt-4 flex flex-wrap gap-2">
										{category.technologies.map((technology) => (
											<span key={technology.id} className="inline-flex items-center gap-2 rounded-lg border border-white/6 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-300">
												<span className="flex size-3.5 items-center justify-center" style={{ color: technology.color || "#a78bfa" }}>
													<TechnologyIcon iconKey={technology.iconKey} className="size-3.5" />
												</span>
												{technology.name}
											</span>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section id="contact" className="scroll-mt-10 sm:scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8 mt-16">
					<div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-violet-500/20 bg-linear-to-br from-violet-950/70 via-zinc-900 to-zinc-950 px-6 py-14 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-16">
						<div className="pointer-events-none absolute -top-32 right-0 size-80 rounded-full bg-violet-600/15 blur-3xl" />
						<div className="relative max-w-2xl">
							<p className="flex items-center gap-2 text-sm font-medium text-violet-300">
								<Mail className="size-4" />
								{content.contactEyebrow}
							</p>
							<h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{content.contactTitle}</h2>
							<p className="mt-4 max-w-xl leading-7 text-zinc-400">{content.contactDescription}</p>
							<p className="mt-5 flex items-center gap-2 text-sm text-zinc-500">
								<MapPin className="size-4 text-violet-300" />
								{settings?.location || content.location}
							</p>
						</div>
						<div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
							<Button asChild size="lg" className="h-12 bg-white px-5 text-zinc-950 hover:bg-zinc-200">
								<AnalyticsLink eventType="EMAIL_CLICK" href={`mailto:${contactEmail}`}>
									{content.sendEmail}
									<ArrowUpRight />
								</AnalyticsLink>
							</Button>
							<div className="flex justify-center gap-2">
								{[
									{ label: "GitHub", href: githubUrl, icon: GitBranch, eventType: "GITHUB_CLICK" as const },
									{ label: "LinkedIn", href: linkedinUrl, icon: ContactRound, eventType: "LINKEDIN_CLICK" as const },
									...(settings?.whatsappUrl ? [{ label: "WhatsApp", href: settings.whatsappUrl, icon: MessageCircle, eventType: "WHATSAPP_CLICK" as const }] : []),
								].map(({ label, href, icon: Icon, eventType }) => (
									<AnalyticsLink key={label} eventType={eventType} href={href} {...externalLinkProps()} aria-label={label} className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white">
										<Icon className="size-4" />
									</AnalyticsLink>
								))}
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="relative border-t border-white/5 py-7">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
					<p>© {new Date().getFullYear()} Felipe Micheletti. Full Stack Developer</p>
					<Link href="/privacidade" className="hover:text-zinc-300">Privacidade e analytics</Link>
				</div>
			</footer>
		</div>
		</AnalyticsProvider>
	);
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
	return (
		<div className="max-w-3xl">
			<p className="flex items-center gap-2 text-sm font-medium text-violet-300">
				<CheckCircle2 className="size-4" />
				{eyebrow}
			</p>
			<h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
			<p className="mt-5 max-w-2xl leading-7 text-zinc-400">{description}</p>
		</div>
	);
}
