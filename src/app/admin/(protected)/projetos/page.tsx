import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Edit3, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ProjectArchiveButton } from "@/components/admin/project-archive-button";
import { ProjectDeleteButton } from "@/components/admin/project-delete-button";
import { ProjectRestoreButton } from "@/components/admin/project-restore-button";
import { $Enums, Prisma } from "@prisma/client";

type ProjectWithTranslationsAndCount = Prisma.ProjectGetPayload<{
    include: {
        translations: {
            select: {
                locale: true;
                title: true;
                summary: true;
            };
        };
        _count: {
            select: {
                technologies: true;
                media: true;
            };
        };
    };
}>;

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
} satisfies Record<$Enums.ProjectStatus, { label: string; className: string; }>;

export default async function ProjectsPage() {
    const projects = await prisma.project.findMany({
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        include: {
            translations: { select: { locale: true, title: true, summary: true } },
            _count: { select: { technologies: true, media: true } },
        },
    });

    const published = projects.filter((project: ProjectWithTranslationsAndCount) => project.status === "PUBLISHED").length;
    const drafts = projects.filter((project: ProjectWithTranslationsAndCount) => project.status === "DRAFT").length;

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
                        <Sparkles className="size-4" />
                        CMS de projetos
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Projetos do portfólio</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Crie e mantenha seus cases em português e inglês sem alterar o código.</p>
                </div>
                <Button asChild className="bg-violet-600 text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500">
                    <Link href="/admin/projetos/novo">
                        <Plus />
                        Novo projeto
                    </Link>
                </Button>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
                {[
                    { label: "Total", value: projects.length },
                    { label: "Publicados", value: published },
                    { label: "Rascunhos", value: drafts },
                ].map((item) => (
                    <Card key={item.label} className="border-violet-500/10 bg-zinc-900/70 py-4 ring-0">
                        <CardContent>
                            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{item.label}</p>
                            <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {projects.length ? (
                <div className="overflow-hidden rounded-xl border border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10">
                    <div className="hidden grid-cols-[minmax(0,1fr)_8rem_7rem_7rem_6rem] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-medium tracking-[0.14em] text-zinc-600 uppercase md:grid">
                        <span>Projeto</span>
                        <span>Status</span>
                        <span>Conteúdo</span>
                        <span>Ordem</span>
                        <span className="text-right">Ações</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {projects.map((project: ProjectWithTranslationsAndCount) => {
                            const pt = project.translations.find((translation: { locale: $Enums.Locale; title: string; summary: string; }) => translation.locale === "PT_BR");
                            const en = project.translations.find((translation: { locale: $Enums.Locale; title: string; summary: string; }) => translation.locale === "EN_US");
                            const title = pt?.title ?? en?.title ?? project.slug;
                            const status = statusDetails[project.status];

                            return (
                                <div key={project.id} className="grid gap-4 px-4 py-5 md:grid-cols-[minmax(0,1fr)_8rem_7rem_7rem_6rem] md:items-center md:px-5">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-medium text-zinc-100">{title}</p>
                                            {project.featured ? (
                                                <Badge className="border-violet-500/20 bg-violet-500/10 text-violet-300">Destaque</Badge>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{pt?.summary ?? project.slug}</p>
                                        <div className="mt-3 flex gap-3 text-[11px] text-zinc-600 md:hidden">
                                            <span>{project._count.technologies} stacks</span>
                                            <span>{project._count.media} mídias</span>
                                            <span>Ordem {project.sortOrder}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Badge className={status.className}>{status.label}</Badge>
                                    </div>
                                    <div className="hidden text-xs text-zinc-500 md:block">
                                        {pt && en ? "PT + EN" : pt ? "Somente PT" : en ? "Somente EN" : "Pendente"}
                                    </div>
                                    <div className="hidden text-sm text-zinc-400 md:block">{project.sortOrder}</div>
                                    <div className="flex items-center justify-end gap-1">
                                        <Button asChild variant="ghost" size="icon-sm" className="text-zinc-400 hover:bg-violet-500/10 hover:text-violet-300">
                                            <Link href={`/admin/projetos/${project.id}`}>
                                                <Edit3 />
                                                <span className="sr-only">Editar {title}</span>
                                            </Link>
                                        </Button>
                                        {project.status !== "ARCHIVED" ? (
                                            <ProjectArchiveButton projectId={project.id} title={title} />
                                        ) : (
                                            <>
                                                <ProjectRestoreButton projectId={project.id} title={title} />
                                                <ProjectDeleteButton projectId={project.id} title={title} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <Card className="border-dashed border-violet-500/20 bg-violet-500/2.5 py-14 text-center ring-0">
                    <CardContent className="flex flex-col items-center">
                        <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                            <BriefcaseBusiness />
                        </span>
                        <h3 className="font-medium text-zinc-100">Nenhum projeto cadastrado</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                            Comece pelo seu case mais importante. Depois vincularemos stacks e imagens.
                        </p>
                        <Button asChild variant="ghost" className="mt-4 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200">
                            <Link href="/admin/projetos/novo">
                                Criar primeiro projeto
                                <ArrowRight />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
