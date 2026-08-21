import { AlertCircle, Eye, EyeOff, Layers3, Pencil, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm, TechnologyForm } from "@/components/admin/stack-forms";
import { StackDeleteButton } from "@/components/admin/stack-delete-button";
import { prisma } from "@/lib/prisma";
import { toggleCategoryVisibilityAction, toggleTechnologyVisibilityAction } from "./actions";
import { StackCreateButtons } from "@/components/admin/stack-create-buttons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Prisma } from "@prisma/client";

type TechnologyCategoryWithTechnologies = Prisma.TechnologyCategoryGetPayload<{
    include: {
        technologies: {
            include: {
                _count: {
                    select: {
                        projects: true;
                    };
                };
            };
        };
    };
}>;

type TechnologyWithProjectCount = TechnologyCategoryWithTechnologies["technologies"][number];

const errorMessages: Record<string, string> = {
    "category-has-technologies": "A categoria não pode ser excluída enquanto possuir tecnologias.",
    "technology-has-projects": "A tecnologia não pode ser excluída enquanto estiver vinculada a projetos.",
};

export default async function StacksPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;
    const categories = await prisma.technologyCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { namePt: "asc" }],
        include: {
            technologies: {
                orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
                include: { _count: { select: { projects: true } } },
            },
        },
    });
    const technologies = categories.flatMap((category: TechnologyCategoryWithTechnologies) => category.technologies);
    const categoryOptions = categories.map(({ id, namePt }: {id: string; namePt: string}) => ({ id, namePt }));

    return (
        <div className="space-y-6">
            <section>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
                    <Sparkles className="size-4" />
                    Catálogo técnico
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Stacks do portfólio</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Organize categorias e tecnologias em português e inglês antes de vinculá-las aos projetos.
                </p>
            </section>

            {error && errorMessages[error] ? (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {errorMessages[error]}
                </div>
            ) : null}

            <section className="grid gap-3 sm:grid-cols-3">
                {[
                    { label: "Categorias", value: categories.length },
                    { label: "Tecnologias", value: technologies.length },
                    {
                        label: "Stacks visíveis",
                        value: technologies.filter((item: TechnologyWithProjectCount) => item.visible).length,
                    },
                ].map((item) => (
                    <Card key={item.label} className="border-violet-500/10 bg-zinc-900/70 py-4 ring-0">
                        <CardContent>
                            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{item.label}</p>
                            <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <StackCreateButtons categoryOptions={categoryOptions} />

            <section className="space-y-4">
                {categories.length ? (
                    <Accordion type="multiple" className="space-y-4">
                        {categories.map((category: TechnologyCategoryWithTechnologies) => (
                            <Card key={category.id} className="border-violet-500/10 bg-zinc-900/70 ring-0">
                                <AccordionItem value={category.id} className="border-b-0">
                                    <CardHeader className="border-b border-white/5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <AccordionTrigger className="min-w-0 flex-1 py-0 text-left hover:no-underline">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <CardTitle className="text-zinc-100">{category.namePt}</CardTitle>

                                                        <Badge
                                                            className={
                                                                category.visible
                                                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                                                    : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                                                            }
                                                        >
                                                            {category.visible ? "Visível" : "Oculta"}
                                                        </Badge>
                                                    </div>

                                                    <CardDescription className="mt-1 text-zinc-500">
                                                        {category.nameEn} · {category.slug} · ordem {category.sortOrder}
                                                    </CardDescription>
                                                </div>
                                            </AccordionTrigger>

                                            <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                                                <form action={toggleCategoryVisibilityAction.bind(null, category.id, !category.visible)}>
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        className="text-zinc-500 hover:bg-violet-500/10 hover:text-violet-300"
                                                    >
                                                        {category.visible ? <EyeOff /> : <Eye />}

                                                        <span className="sr-only">
                                                            {category.visible ? "Ocultar" : "Exibir"} {category.namePt}
                                                        </span>
                                                    </Button>
                                                </form>

                                                <StackDeleteButton
                                                    id={category.id}
                                                    name={category.namePt}
                                                    type="category"
                                                    blocked={category.technologies.length > 0}
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <AccordionContent className="pb-0 h-fit">
                                        <CardContent className="space-y-4 pt-6">
                                            <details className="rounded-lg border border-white/5 bg-zinc-950/30 p-4">
                                                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-violet-300">
                                                    <Pencil className="size-4" />
                                                    Editar categoria
                                                </summary>

                                                <div className="pt-4">
                                                    <CategoryForm
                                                        id={category.id}
                                                        values={{
                                                            slug: category.slug,
                                                            namePt: category.namePt,
                                                            nameEn: category.nameEn,
                                                            sortOrder: category.sortOrder,
                                                            visible: category.visible,
                                                        }}
                                                    />
                                                </div>
                                            </details>

                                            {category.technologies.length ? (
                                                <div className="divide-y divide-white/5 rounded-lg border border-white/5">
                                                    {category.technologies.map((technology: TechnologyWithProjectCount) => (
                                                        <div key={technology.id} className="p-4">
                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                <div className="flex min-w-0 items-center gap-3">
                                                                    <span
                                                                        className="size-3 shrink-0 rounded-full ring-2 ring-white/10"
                                                                        style={{
                                                                            backgroundColor: technology.color ?? "#71717a",
                                                                        }}
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <p className="truncate font-medium text-zinc-200 mb-0!">{technology.name}</p>
                                                                        <p className="text-xs text-zinc-500">
                                                                            {technology.slug}
                                                                            {technology.iconKey ? ` · ícone ${technology.iconKey}` : ""} ·{" "}
                                                                            {technology._count.projects} projetos
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Badge
                                                                        className={
                                                                            technology.visible
                                                                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                                                                : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                                                                        }
                                                                    >
                                                                        {technology.visible ? "Visível" : "Oculta"}
                                                                    </Badge>
                                                                    <form
                                                                        action={toggleTechnologyVisibilityAction.bind(null, technology.id, !technology.visible)}
                                                                    >
                                                                        <Button
                                                                            type="submit"
                                                                            variant="ghost"
                                                                            size="icon-sm"
                                                                            className="text-zinc-500 hover:bg-violet-500/10 hover:text-violet-300"
                                                                        >
                                                                            {technology.visible ? <EyeOff /> : <Eye />}
                                                                            <span className="sr-only">
                                                                                {technology.visible ? "Ocultar" : "Exibir"} {technology.name}
                                                                            </span>
                                                                        </Button>
                                                                    </form>
                                                                    <StackDeleteButton
                                                                        id={technology.id}
                                                                        name={technology.name}
                                                                        type="technology"
                                                                        blocked={technology._count.projects > 0}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <details className="mt-3 rounded-lg border border-white/5 bg-zinc-950/30 p-3">
                                                                <summary className="cursor-pointer list-none text-xs font-medium text-violet-300">
                                                                    Editar tecnologia
                                                                </summary>
                                                                <div className="pt-4">
                                                                    <TechnologyForm
                                                                        id={technology.id}
                                                                        categories={categoryOptions}
                                                                        values={{
                                                                            categoryId: technology.categoryId,
                                                                            name: technology.name,
                                                                            slug: technology.slug,
                                                                            iconKey: technology.iconKey ?? "",
                                                                            color: technology.color ?? "",
                                                                            descriptionPt: technology.descriptionPt ?? "",
                                                                            descriptionEn: technology.descriptionEn ?? "",
                                                                            sortOrder: technology.sortOrder,
                                                                            visible: technology.visible,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </details>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
                                                    Nenhuma tecnologia nesta categoria.
                                                </p>
                                            )}
                                        </CardContent>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                        ))}
                    </Accordion>
                ) : (
                    <Card className="border-dashed border-violet-500/20 bg-violet-500/2.5 py-14 text-center ring-0">
                        <CardContent>
                            <Layers3 className="mx-auto mb-4 text-violet-300" />
                            <h3 className="font-medium text-zinc-100">Nenhuma stack cadastrada</h3>
                            <p className="mt-2 text-sm text-zinc-500">Comece criando uma categoria acima.</p>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}
