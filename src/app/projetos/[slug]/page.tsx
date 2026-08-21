import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, GitBranch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";
import { AnalyticsLink, AnalyticsProvider } from "@/components/public/analytics-provider";
import { ProjectDetailTracker } from "@/components/public/project-detail-tracker";
import { $Enums } from "@prisma/client";

interface ProjectMedia  {
    mediaId: string;
    role: $Enums.ProjectMediaRole;
    altPt: string | null;
    altEn: string | null;
}

const labels = {
    PT_BR: {
        back: "Voltar ao portfólio",
        demo: "Ver projeto",
        code: "Ver código",
        stack: "Tecnologias",
        problem: "O problema",
        solution: "A solução",
        responsibilities: "Responsabilidades",
        choices: "Decisões técnicas",
        results: "Resultados",
        gallery: "Galeria",
        present: "Atual",
    },
    EN_US: {
        back: "Back to portfolio",
        demo: "View project",
        code: "View code",
        stack: "Technologies",
        problem: "The problem",
        solution: "The solution",
        responsibilities: "Responsibilities",
        choices: "Technical decisions",
        results: "Results",
        gallery: "Gallery",
        present: "Present",
    },
} as const;

async function getProject(slug: string, locale: "PT_BR" | "EN_US") {
    return prisma.project.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: {
            id: true,
            slug: true,
            featured: true,
            demoUrl: true,
            repositoryUrl: true,
            startedAt: true,
            finishedAt: true,
            updatedAt: true,
            translations: { where: { locale }, take: 1 },
            technologies: {
                orderBy: { sortOrder: "asc" },
                where: { technology: { visible: true } },
                select: {
                    technology: { select: { id: true, name: true, color: true } },
                },
            },
            media: {
                orderBy: [{ role: "asc" }, { sortOrder: "asc" }],
                select: { mediaId: true, role: true, altPt: true, altEn: true },
            },
        },
    });
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
    const [{ slug }, { lang }] = await Promise.all([params, searchParams]);
    const locale = lang === "en" ? "EN_US" : "PT_BR";
    const project = await getProject(slug, locale);
    if (!project?.translations[0]) return { title: "Projeto não encontrado", robots: { index: false } };
    const translation = project.translations[0];
    const path = `/projetos/${slug}${locale === "EN_US" ? "?lang=en" : ""}`;
    const cover = project.media[0];
    return {
        title: translation.title,
        description: translation.summary,
        alternates: {
            canonical: path,
            languages: {
                "pt-BR": `/projetos/${slug}`,
                "en-US": `/projetos/${slug}?lang=en`,
                "x-default": `/projetos/${slug}`,
            },
        },
        openGraph: {
            type: "article",
            url: path,
            title: translation.title,
            description: translation.summary,
            modifiedTime: project.updatedAt.toISOString(),
            images: cover
                ? [
                      {
                          url: `/api/media/${cover.mediaId}`,
                          alt: (locale === "PT_BR" ? cover.altPt : cover.altEn) || translation.title,
                      },
                  ]
                : undefined,
        },
    };
}

function dateLabel(date: Date | null, locale: "PT_BR" | "EN_US") {
    return date
        ? new Intl.DateTimeFormat(locale === "PT_BR" ? "pt-BR" : "en-US", {
              month: "short",
              year: "numeric",
              timeZone: "UTC",
          }).format(date)
        : null;
}

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
    const [{ slug }, { lang }] = await Promise.all([params, searchParams]);
    const locale = lang === "en" ? "EN_US" : "PT_BR";
    const copy = labels[locale];
    const project = await getProject(slug, locale);
    if (!project?.translations[0]) notFound();
    const content = project.translations[0];
    const languageQuery = locale === "EN_US" ? "?lang=en" : "";
    const sections = [
        [copy.problem, content.problem],
        [copy.solution, content.solution],
        [copy.responsibilities, content.responsibilities],
        [copy.choices, content.technicalChoices],
        [copy.results, content.results],
    ].filter((item): item is [string, string] => Boolean(item[1]));
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: content.title,
        description: content.summary,
        url: absoluteUrl(`/projetos/${slug}${languageQuery}`),
        creator: { "@type": "Person", name: "Felipe Micheletti" },
        keywords: project.technologies.map(({ technology }: { technology: { id: string; name: string; color: string | null; }}) => technology.name),
    };
    return (
        <AnalyticsProvider locale={locale}>
            <ProjectDetailTracker projectId={project.id} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
                }}
            />
            <div lang={locale === "EN_US" ? "en-US" : "pt-BR"} className="dark min-h-screen bg-zinc-950 text-zinc-100">
                <header className="border-b border-white/5 bg-zinc-950/90">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
                        <Link href={`/${languageQuery}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
                            <ArrowLeft className="size-4" />
                            {copy.back}
                        </Link>
                        <div className="flex gap-2 text-xs">
                            <Link
                                href={`/projetos/${slug}`}
                                className={locale === "PT_BR" ? "rounded-full bg-violet-600 px-3 py-1.5" : "px-3 py-1.5 text-zinc-500"}
                            >
                                PT
                            </Link>
                            <Link
                                href={`/projetos/${slug}?lang=en`}
                                className={locale === "EN_US" ? "rounded-full bg-violet-600 px-3 py-1.5" : "px-3 py-1.5 text-zinc-500"}
                            >
                                EN
                            </Link>
                        </div>
                    </div>
                </header>
                <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
                    <div className="max-w-4xl">
                        <p className="text-sm font-medium text-violet-300">Case study</p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{content.title}</h1>
                        <p className="mt-6 text-lg leading-8 text-zinc-400">{content.summary}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {project.demoUrl ? (
                            <AnalyticsLink
                                eventType="PROJECT_DEMO_CLICK"
                                projectId={project.id}
                                href={project.demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium"
                            >
                                {copy.demo}
                                <ArrowUpRight className="size-4" />
                            </AnalyticsLink>
                        ) : null}
                        {project.repositoryUrl ? (
                            <AnalyticsLink
                                eventType="PROJECT_GITHUB_CLICK"
                                projectId={project.id}
                                href={project.repositoryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm"
                            >
                                <GitBranch className="size-4" />
                                {copy.code}
                            </AnalyticsLink>
                        ) : null}
                    </div>
                    {project.startedAt ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-400 mt-4">
                            <CalendarDays className="size-4 text-violet-300" />
                            {dateLabel(project.startedAt, locale)} — {dateLabel(project.finishedAt, locale) || copy.present}
                        </span>
                    ) : null}
                    {project.media[0] ? (
                        <div className="relative mt-2 aspect-video overflow-hidden rounded-3xl border border-white/10">
                            <Image
                                src={`/api/media/${project.media[0].mediaId}`}
                                alt={(locale === "PT_BR" ? project.media[0].altPt : project.media[0].altEn) || content.title}
                                fill
                                priority
                                unoptimized
                                className="object-cover"
                            />
                        </div>
                    ) : null}
                    <section className="mt-6">
                        <h2 className="text-sm font-medium text-violet-300">{copy.stack}</h2>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {project.technologies.map(({ technology }: { technology: { id: string; name: string; color: string | null; }}) => (
                                <span
                                    key={technology.id}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm"
                                    style={technology.color ? { borderColor: `${technology.color}45` } : undefined}
                                >
                                    {technology.name}
                                </span>
                            ))}
                        </div>
                    </section>
                    <div className="mt-16 grid gap-6 lg:grid-cols-2">
                        {sections.map(([title, body]) => (
                            <section key={title} className="rounded-2xl border border-white/8 bg-zinc-900/50 p-6 sm:p-8">
                                <h2 className="text-xl font-semibold">{title}</h2>
                                <p className="mt-4 whitespace-pre-line leading-7 text-zinc-400">{body}</p>
                            </section>
                        ))}
                    </div>
                    {project.media.length > 1 ? (
                        <section className="mt-16">
                            <h2 className="text-2xl font-semibold">{copy.gallery}</h2>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {project.media.slice(1).map((media: ProjectMedia) => (
                                    <div key={media.mediaId} className="relative aspect-video overflow-hidden rounded-2xl border border-white/10">
                                        <Image
                                            src={`/api/media/${media.mediaId}`}
                                            alt={(locale === "PT_BR" ? media.altPt : media.altEn) || content.title}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </main>
            </div>
        </AnalyticsProvider>
    );
}
