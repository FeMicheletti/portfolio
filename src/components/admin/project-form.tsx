"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, CalendarDays, ExternalLink, FileText, Languages, Layers3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectFormState, ProjectFormValues } from "@/lib/projects/project-form";
import { createProjectAction, updateProjectAction } from "@/app/admin/(protected)/projetos/actions";
import { ProjectSubmitButton } from "./project-submit-button";
import { ProjectMediaFields, type ProjectMediaOption } from "./project-media-fields";

const initialState: ProjectFormState = {};

type TechnologyCategoryOption = {
	id: string;
	namePt: string;
	nameEn: string;
	visible: boolean;
	technologies: {
		id: string;
		name: string;
		slug: string;
		color: string | null;
		visible: boolean;
	}[];
};

function FieldError({ errors }: { errors?: string[] }) {
	return errors?.[0] ? (
		<p className="text-xs text-red-400">{errors[0]}</p>
	) : null;
}

function TextField({ label, name, value, placeholder, errors, onValueChange }: { label: string; name: string; value: string; placeholder?: string; errors?: string[]; onValueChange: (value: string) => void; }) {
	return (
		<div className="space-y-2">
			<Label htmlFor={name}>{label}</Label>
			<Input
				id={name}
				name={name}
				value={value}
				placeholder={placeholder}
				onChange={(event) => onValueChange(event.target.value)}
				aria-invalid={Boolean(errors?.length)}
				className="border-white/10 bg-zinc-950/50 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20" />
			<FieldError errors={errors} />
		</div>
	);
}

function ContentFields({ locale, values, errors, onValueChange }: { locale: "Pt" | "En"; values: ProjectFormValues; errors?: Record<string, string[]>; onValueChange: (name: string, value: string) => void; }) {
	const copy = locale === "Pt" ? {
		title: "Título",
		summary: "Resumo",
		problem: "Problema",
		solution: "Solução",
		responsibilities: "Responsabilidades",
		choices: "Decisões técnicas",
		results: "Resultados"
		}
	: {
		title: "Title",
		summary: "Summary",
		problem: "Problem",
		solution: "Solution",
		responsibilities: "Responsibilities",
		choices: "Technical decisions",
		results: "Results"
	};

	const textarea = (key: | "summary" | "problem" | "solution" | "responsibilities" | "technicalChoices" | "results", label: string, rows = 4) => {
		const name = `${key}${locale}` as keyof ProjectFormValues;

		return (
			<div className="space-y-2" key={name}>
				<Label htmlFor={name}>{label}</Label>
				<Textarea
					id={name}
					name={name}
					value={String(values[name] ?? "")}
					onChange={(event) => onValueChange(name, event.target.value)}
					rows={rows}
					aria-invalid={Boolean(errors?.[name]?.length)}
					className="min-h-28 resize-y border-white/10 bg-zinc-950/50 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20" />
				<FieldError errors={errors?.[name]} />
			</div>
		);
	};

	const titleName = `title${locale}` as keyof ProjectFormValues;

	return (
		<div className="grid gap-5 pt-4">
			<TextField
				label={copy.title}
				name={String(titleName)}
				value={String(values[titleName] ?? "")}
				errors={errors?.[titleName]}
				onValueChange={(value) => onValueChange(titleName, value)} />
			{textarea("summary", copy.summary, 3)}
			<div className="grid gap-5 xl:grid-cols-2">
				{textarea("problem", copy.problem)}
				{textarea("solution", copy.solution)}
				{textarea("responsibilities", copy.responsibilities)}
				{textarea("technicalChoices", copy.choices)}
			</div>
			{textarea("results", copy.results)}
		</div>
	);
}

export function ProjectForm({ values, technologyCategories, mediaAssets }: { values: ProjectFormValues; technologyCategories: TechnologyCategoryOption[]; mediaAssets: ProjectMediaOption[] }) {
	const editing = Boolean(values.id);
	const action = values.id ? updateProjectAction.bind(null, values.id) : createProjectAction;
	const [state, formAction] = useActionState(action, initialState);
	const [activeLocale, setActiveLocale] = useState<"pt" | "en">("pt");

	const [formValues, setFormValues] = useState<ProjectFormValues>(
		() => Object.fromEntries(
			Object.entries(values).map(([key, value]) => [ key, Array.isArray(value) ? value : typeof value === "boolean" ? value : String(value ?? "") ])
		) as unknown as ProjectFormValues,
	);

	function toggleTechnology(technologyId: string, checked: boolean) {
		setFormValues((current) => {
			const selected = current.technologyIds;

			return {
				...current,
				technologyIds: checked
					? [...selected, technologyId]
					: selected.filter((id) => id !== technologyId),
			};
		});
	}

	function setField(name: string, value: string | boolean) {
		if (name === "sortOrder") value = String(Math.max(0, Number(value)));
		setFormValues((current) => ({ ...current, [name]: value }));
	}

	function setProjectMedia(projectMedia: ProjectFormValues["projectMedia"]) {
		setFormValues((current) => ({ ...current, projectMedia }));
	}

	return (
		<form action={formAction} className="space-y-6">
			{state.error ? (
				<div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
					<AlertCircle className="mt-0.5 size-4 shrink-0" />
					{state.error}
				</div>
			) : null}

			<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="min-w-0 space-y-6">
					<Card className="w-full min-w-0 border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
						<CardHeader className="border-b border-white/5">
							<div className="flex items-center gap-2 text-violet-300">
								<Languages className="size-4" />
								<CardTitle>Conteúdo do projeto</CardTitle>
							</div>
							<CardDescription className="text-zinc-500">
								Mantenha as duas versões prontas antes da publicação.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs value={activeLocale} onValueChange={(value) => setActiveLocale(value as "pt" | "en")}>
								<TabsList className="bg-zinc-950/70">
									<TabsTrigger type="button" value="pt" className="data-active:bg-violet-600 data-active:text-white">
										Português
									</TabsTrigger>
									<TabsTrigger type="button" value="en" className="data-active:bg-violet-600 data-active:text-white">
										English
									</TabsTrigger>
								</TabsList>

								<TabsContent value="pt" forceMount className="data-[state=inactive]:hidden" >
									<ContentFields locale="Pt" values={formValues} errors={state.fieldErrors} onValueChange={setField} />
								</TabsContent>

								<TabsContent value="en" forceMount className="data-[state=inactive]:hidden" >
									<ContentFields locale="En" values={formValues} errors={state.fieldErrors} onValueChange={setField} />
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>

					<ProjectMediaFields
						mediaAssets={mediaAssets}
						value={formValues.projectMedia}
						errors={state.fieldErrors?.projectMedia}
						onChange={setProjectMedia} />
				</div>

				<div className="space-y-6">
					<Card className="border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
						<CardHeader className="border-b border-white/5">
							<div className="flex items-center gap-2 text-violet-300">
								<Settings2 className="size-4" />
								<CardTitle>Publicação</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-5">
							<TextField
								label="Slug"
								name="slug"
								value={String(formValues.slug ?? "")}
								placeholder="nome-do-projeto"
								errors={state.fieldErrors?.slug}
								onValueChange={(value) => setField("slug", value)} />
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<select id="status" name="status" value={String(formValues.status ?? "DRAFT")} onChange={(event) => setField("status", event.target.value)} className="h-9 w-full rounded-md border border-white/10 bg-zinc-950/50 px-2.5 text-sm outline-none focus:border-violet-500/60 focus:ring-3 focus:ring-violet-500/20">
									<option value="DRAFT">Rascunho</option>
									<option value="PUBLISHED">Publicado</option>
									<option value="ARCHIVED">Arquivado</option>
								</select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sortOrder">Ordem</Label>
								<Input
									id="sortOrder"
									name="sortOrder"
									type="number"
									min="0"
									value={String(formValues.sortOrder ?? "0")}
									onChange={(event) => setField("sortOrder", event.target.value)}
									aria-invalid={Boolean(state.fieldErrors?.sortOrder)}
									className="border-white/10 bg-zinc-950/50 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20" />
								<FieldError errors={state.fieldErrors?.sortOrder} />
							</div>
							<label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/5 bg-white/2.5 p-3">
								<input
									name="featured"
									type="checkbox"
									checked={Boolean(formValues.featured)}
									onChange={(event) => setField("featured", event.target.checked)}
									className="mt-0.5 size-4 accent-violet-600" />
								<span>
									<span className="block text-sm font-medium text-zinc-200">
										Projeto em destaque
									</span>
									<span className="mt-0.5 block text-xs leading-5 text-zinc-500">
										Receberá maior evidência no portfólio.
									</span>
								</span>
							</label>
						</CardContent>
					</Card>

					<Card className="border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
						<CardHeader className="border-b border-white/5">
							<div className="flex items-center gap-2 text-violet-300">
								<Layers3 className="size-4" />
								<CardTitle>Stacks</CardTitle>
							</div>
							<CardDescription className="text-zinc-500">
								Selecione as tecnologias utilizadas neste projeto.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{technologyCategories.length ? (
								<Accordion type="multiple" className="space-y-2">
									{technologyCategories.map((category) => {
										const selectedCount = category.technologies.filter((technology) => formValues.technologyIds.includes(technology.id)).length

										return (
											<AccordionItem key={category.id} value={category.id} className="overflow-hidden rounded-lg border border-white/5 bg-white/2.5 px-3">
												<AccordionTrigger className="py-3 hover:no-underline">
													<div className="flex min-w-0 flex-1 flex-col gap-2 pr-2 sm:flex-row sm:items-center sm:justify-between">
														<div className="min-w-0">
															<p className="truncate text-sm font-medium text-zinc-300">
																{category.namePt}
															</p>

															{!category.visible ? (
																<p className="mt-0.5 text-[10px] text-zinc-600 uppercase">
																	Categoria oculta
																</p>
															) : null}
														</div>

														<span className="shrink-0 rounded-full border border-white/5 bg-zinc-950/60 px-2 py-0.5 text-[11px] text-zinc-500">
															{selectedCount ? `${selectedCount} selecionada${selectedCount > 1 ? "s" : ""}` : `${category.technologies.length} tecnologias`}
														</span>
													</div>
												</AccordionTrigger>

												<AccordionContent className="pb-3">
													<div className="grid gap-2">
														{category.technologies.length ? (
															category.technologies.map((technology) => (
																<label key={technology.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-zinc-950/30 px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:border-violet-500/20 hover:bg-violet-500/5">
																	<input
																		name="technologyIds"
																		type="checkbox"
																		value={technology.id}
																		checked={formValues.technologyIds.includes(technology.id)}
																		onChange={(event) => toggleTechnology( technology.id, event.target.checked)}
																		className="size-4 shrink-0 accent-violet-600"
																	/>

																	<span className="size-2.5 shrink-0 rounded-full ring-1 ring-white/10" style={{ backgroundColor: technology.color ?? "#71717a"}}/>

																	<span className="min-w-0 flex-1 truncate">
																		{technology.name}
																	</span>

																	{!technology.visible ? (
																		<span className="text-[10px] text-zinc-600 uppercase">
																			Oculta
																		</span>
																	) : null}
																</label>
															))
														) : (
															<p className="py-2 text-xs text-zinc-600">
																Nenhuma tecnologia cadastrada.
															</p>
														)}
													</div>
												</AccordionContent>
											</AccordionItem>
										)
									})}
								</Accordion>
							) : (
								<p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs leading-5 text-zinc-500">
									Cadastre tecnologias na seção Stacks antes de vinculá-las ao
									projeto.
								</p>
							)}

							<FieldError errors={state.fieldErrors?.technologyIds} />
						</CardContent>
					</Card>

					<Card className="border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
						<CardHeader className="border-b border-white/5">
							<div className="flex items-center gap-2 text-violet-300">
								<ExternalLink className="size-4" />
								<CardTitle>Links</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-5">
							<TextField
								label="Repositório"
								name="repositoryUrl"
								value={String(formValues.repositoryUrl ?? "")}
								placeholder="https://github.com/..."
								errors={state.fieldErrors?.repositoryUrl}
								onValueChange={(value) => setField("repositoryUrl", value)} />
							<TextField 
								label="Demonstração" 
								name="demoUrl" 
								value={String(formValues.demoUrl ?? "")} 
								placeholder="https://..." 
								errors={state.fieldErrors?.demoUrl} 
								onValueChange={(value) => setField("demoUrl", value)} />
						</CardContent>
					</Card>

					<Card className="border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
						<CardHeader className="border-b border-white/5">
							<div className="flex items-center gap-2 text-violet-300">
								<CalendarDays className="size-4" />
								<CardTitle>Período</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
							<div className="space-y-2">
								<Label htmlFor="startedAt">Início</Label>
									<Input
										id="startedAt"
										name="startedAt"
										type="date"
										value={String(formValues.startedAt ?? "")}
										onChange={(event) => setField("startedAt", event.target.value)}
										className="border-white/10 bg-zinc-950/50"
									/>
								<FieldError errors={state.fieldErrors?.startedAt} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="finishedAt">Conclusão</Label>
								<Input
									id="finishedAt"
									name="finishedAt"
									type="date"
									value={String(formValues.finishedAt ?? "")}
									onChange={(event) => setField("finishedAt", event.target.value)}
									className="border-white/10 bg-zinc-950/50"
								/>
								<FieldError errors={state.fieldErrors?.finishedAt} />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="sticky bottom-4 flex flex-col-reverse gap-3 rounded-xl border border-white/10 bg-zinc-950/90 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-end">
				<Button asChild type="button" variant="ghost" className="text-zinc-400 hover:bg-white/5 hover:text-white">
					<Link href="/admin/projetos">Cancelar</Link>
				</Button>
				<ProjectSubmitButton editing={editing} />
			</div>
		</form>
	);
}

export function ProjectFormHeading({ editing }: { editing: boolean }) {
	return (
		<div className="mb-6 flex items-start gap-3">
			<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
				<FileText className="size-5" />
			</span>
			<div>
				<h2 className="text-2xl font-semibold tracking-tight text-white">
					{editing ? "Editar projeto" : "Novo projeto"}
				</h2>
				<p className="mt-1 text-sm text-zinc-500">
					{editing ? "Atualize o conteúdo e as opções de publicação." : "Cadastre o conteúdo, as stacks e as imagens do projeto."}
				</p>
			</div>
		</div>
	);
}