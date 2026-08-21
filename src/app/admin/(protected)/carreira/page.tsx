import { BriefcaseBusiness, Edit3, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExperienceDeleteButton } from "@/components/admin/experience-delete-button";
import { ExperienceTranslation } from "@prisma/client";

interface ExperienceWithTranslations {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    sortOrder: number;
    startedAt: Date;
    finishedAt: Date | null;
    visible: boolean;
    company: string;
    location: string | null;
    companyUrl: string | null;
    current: boolean;
    translations: ExperienceTranslation[];
}

function dateInputValue(date: Date | null) {
    return date ? date.toISOString().slice(0, 10) : "";
}

export default async function CareerAdminPage() {
    const experiences = await prisma.experience.findMany({
        orderBy: [{ sortOrder: "asc" }, { startedAt: "desc" }],
        include: { translations: true },
    });

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
                        <Sparkles className="size-4" />
                        Conteúdo público
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Carreira</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                        Gerencie as experiências exibidas na seção Sobre. O resumo aparece no card; a descrição completa é aberta pelo visitante.
                    </p>
                </div>
                <Button asChild className="bg-violet-600 text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500">
                    <Link href="/admin/carreira/novo">
                        <Plus />
                        Nova experiência
                    </Link>
                </Button>
            </section>

            {experiences.length ? (
                <div className="overflow-hidden rounded-xl border border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10">
                    <div className="hidden grid-cols-[minmax(0,1fr)_13rem_10rem_6rem] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-medium tracking-[0.14em] text-zinc-600 uppercase md:grid">
                        <span>Experiência</span>
                        <span className="text-center">Empresa</span>
                        <span className="text-center">Localização</span>
                        <span className="text-right">Ações</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {experiences.map((experience: ExperienceWithTranslations) => {
                            const pt = experience.translations.find((translation: ExperienceTranslation) => translation.locale === "PT_BR");
                            const en = experience.translations.find((translation: ExperienceTranslation) => translation.locale === "EN_US");
                            const title = pt?.title ?? en?.title;

                            return (
                                <div key={experience.id} className="grid gap-4 px-4 py-5 md:grid-cols-[minmax(0,1fr)_13rem_10rem_6rem] md:items-center md:px-5">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-medium text-zinc-100">{title}</p>
                                        </div>
                                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                                            {dateInputValue(experience.startedAt)} - {experience.current ? "Atual" : dateInputValue(experience.finishedAt)}
                                        </p>
                                        <div className="mt-3 flex gap-3 text-[11px] text-zinc-600 md:hidden">
                                            <span>{experience.company}</span>
                                            <span>{experience.location}</span>
                                            <span>Ordem {experience.sortOrder}</span>
                                        </div>
                                    </div>
                                    <div className="hidden md:block">{experience.company}</div>
                                    <div className="hidden md:block">{experience.location}</div>
                                    <div className="flex items-center justify-end gap-1">
                                        <Button asChild variant="ghost" size="icon-sm" className="text-zinc-400 hover:bg-violet-500/10 hover:text-violet-300">
                                            <Link href={`/admin/carreira/${experience.id}`}>
                                                <Edit3 />
                                                <span className="sr-only">Editar {title}</span>
                                            </Link>
                                        </Button>
                                        <ExperienceDeleteButton experienceId={experience.id} title={title ?? ""} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <Card className="border-dashed border-violet-500/20 bg-violet-500/2.5 py-14 text-center ring-0">
                    <CardContent>
                        <BriefcaseBusiness className="mx-auto mb-4 text-violet-300" />
                        <h3 className="font-medium text-zinc-100">Nenhuma experiência cadastrada</h3>
                        <p className="mt-2 text-sm text-zinc-500">Adicione o primeiro item da sua trajetória profissional.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
