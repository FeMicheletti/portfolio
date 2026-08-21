import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CircleDot, Download, Layers3, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const statusDetails = {
    DRAFT: {
        label: "Rascunho",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    },
    PUBLISHED: {
        label: "Publicado",
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    },
    ARCHIVED: {
        label: "Arquivado",
        className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
    },
} as const;

export default async function AdminPage() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [projects, publishedProjects, visibleTechnologies, events, recentProjects] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: "PUBLISHED" } }),
        prisma.technology.count({ where: { visible: true } }),
        prisma.analyticsEvent.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { visitorId: true, eventType: true } }),
        prisma.project.findMany({
            take: 5,
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                slug: true,
                status: true,
                updatedAt: true,
                translations: {
                    where: { locale: "PT_BR" },
                    take: 1,
                    select: { title: true },
                },
            },
        }),
    ]);
    const visitors = new Set(events.map((event) => event.visitorId)).size;
    const downloads = events.filter((event) => event.eventType === "RESUME_DOWNLOAD").length;

    const metrics = [
        {
            label: "Projetos",
            value: projects,
            detail: `${publishedProjects} publicados`,
            icon: BriefcaseBusiness,
        },
        {
            label: "Stacks visíveis",
            value: visibleTechnologies,
            detail: "disponíveis no portfólio",
            icon: Layers3,
        },
        {
            label: "Visitantes",
            value: visitors,
            detail: "nos últimos 30 dias",
            icon: Users,
        },
        {
            label: "Downloads",
            value: downloads,
            detail: "do currículo em 30 dias",
            icon: Download,
        },
    ];

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
                        <Sparkles className="size-4" />
                        Visão geral
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Seu portfólio em um só lugar</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Acompanhe o conteúdo e as interações de quem visita seu trabalho.</p>
                </div>

                <Badge className="w-fit border-violet-500/20 bg-violet-500/10 px-3 py-1 text-violet-300">
                    <CircleDot className="size-3" />
                    Ambiente administrativo
                </Badge>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <Card key={metric.label} className="border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
                            <CardHeader className="flex-row items-center justify-between gap-4">
                                <CardDescription className="text-zinc-400">{metric.label}</CardDescription>
                                <span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/15">
                                    <Icon className="size-4" />
                                </span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold tracking-tight text-white">{metric.value}</p>
                                <p className="mt-1 text-xs text-zinc-500">{metric.detail}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
                <Card className="border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle className="text-zinc-100">Projetos recentes</CardTitle>
                        <CardDescription className="text-zinc-500">Últimos conteúdos atualizados no CMS.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentProjects.length ? (
                            <div className="divide-y divide-white/5">
                                {recentProjects.map((project) => {
                                    const status = statusDetails[project.status];

                                    return (
                                        <div
                                            key={project.id}
                                            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-zinc-200">{project.translations[0]?.title ?? project.slug}</p>
                                                <p className="mt-1 text-xs text-zinc-500">Atualizado em {project.updatedAt.toLocaleDateString("pt-BR")}</p>
                                            </div>
                                            <Badge className={status.className}>{status.label}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-violet-500/15 bg-violet-500/2.5 px-6 text-center">
                                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                                    <BriefcaseBusiness className="size-5" />
                                </span>
                                <p className="font-medium text-zinc-200">Nenhum projeto cadastrado</p>
                                <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-500">
                                    Cadastre seu primeiro projeto para começar a preencher o portfólio.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-violet-500/10 bg-linear-to-b from-violet-950/40 to-zinc-900/70 shadow-lg shadow-black/10 ring-0">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Analytics</CardTitle>
                        <CardDescription className="text-zinc-500">Entenda como as pessoas encontram e exploram seu portfólio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-6 text-zinc-400">
                            Consulte tendências diárias, dispositivos, origens, downloads e os projetos que mais despertam interesse.
                        </p>
                        <Link
                            href="/admin/metricas"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
                        >
                            Abrir métricas <ArrowUpRight className="size-4" />
                        </Link>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
