"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, FileText, Languages, Loader2, Save } from "lucide-react";
import { createExperienceAction, updateExperienceAction } from "@/app/admin/(protected)/carreira/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceFormState, ExperienceFormValues } from "@/lib/experiences/experience-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const initialState: ExperienceFormState = {};
const controlClass = "border-white/10 bg-zinc-950/50 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20";

function FieldError({ errors }: { errors?: string[] }) {
    return errors?.[0] ? <p className="text-xs text-red-400">{errors[0]}</p> : null;
}

function TranslationFields({
    locale,
    formId,
    values,
    state,
    onChange,
}: {
    locale: "Pt" | "En";
    formId: string;
    values?: ExperienceFormValues;
    state: ExperienceFormState;
    onChange: (name: keyof ExperienceFormValues, value: string | number | boolean) => void;
}) {
    const portuguese = locale === "Pt";
    const titleKey = `title${locale}` as "titlePt" | "titleEn";
    const summaryKey = `summary${locale}` as "summaryPt" | "summaryEn";
    const descriptionKey = `description${locale}` as "descriptionPt" | "descriptionEn";
    const titleId = `${titleKey}-${formId}`;
    const summaryId = `${summaryKey}-${formId}`;
    const descriptionId = `${descriptionKey}-${formId}`;

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor={titleId}>Cargo / título em {portuguese ? "português" : "inglês"}</Label>
                <Input
                    id={titleId}
                    name={titleKey}
                    value={values?.[titleKey]}
                    onChange={(event) => onChange(titleKey, event.target.value)}
                    placeholder="Senior Full-Stack Developer"
                    className={controlClass}
                    aria-invalid={Boolean(state.fieldErrors?.[titleKey])}
                />
                <FieldError errors={state.fieldErrors?.[titleKey]} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={summaryId}>Resumo curto</Label>
                <Textarea
                    id={summaryId}
                    name={summaryKey}
                    value={values?.[summaryKey]}
                    onChange={(event) => onChange(summaryKey, event.target.value)}
                    maxLength={500}
                    rows={3}
                    className={controlClass}
                    aria-invalid={Boolean(state.fieldErrors?.[summaryKey])}
                />
                <FieldError errors={state.fieldErrors?.[summaryKey]} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={descriptionId}>Como foi essa experiência</Label>
                <Textarea
                    id={descriptionId}
                    name={descriptionKey}
                    value={values?.[descriptionKey]}
                    onChange={(event) => onChange(descriptionKey, event.target.value)}
                    rows={8}
                    placeholder="Responsabilidades, desafios, tecnologias, resultados e aprendizados..."
                    className={controlClass}
                    aria-invalid={Boolean(state.fieldErrors?.[descriptionKey])}
                />
                <FieldError errors={state.fieldErrors?.[descriptionKey]} />
            </div>
        </div>
    );
}

export function ExperienceForm({ id, values }: { id?: string; values?: ExperienceFormValues }) {
    const action = id ? updateExperienceAction.bind(null, id) : createExperienceAction;
    const [state, formAction, pending] = useActionState(action, initialState);
    const formId = id ?? "new";

    const [formValues, setFormValues] = useState<ExperienceFormValues>(() => ({
        company: values?.company ?? "",
        location: values?.location ?? "",
        companyUrl: values?.companyUrl ?? "",
        startedAt: values?.startedAt ?? "",
        finishedAt: values?.finishedAt ?? "",
        current: values?.current ?? false,
        visible: values?.visible ?? true,
        sortOrder: values?.sortOrder ?? 0,
        titlePt: values?.titlePt ?? "",
        summaryPt: values?.summaryPt ?? "",
        descriptionPt: values?.descriptionPt ?? "",
        titleEn: values?.titleEn ?? "",
        summaryEn: values?.summaryEn ?? "",
        descriptionEn: values?.descriptionEn ?? "",
    }));

    function setField(name: keyof ExperienceFormValues, value: string | number | boolean) {
        if (name === "sortOrder") value = String(Math.max(0, Number(value)));
        setFormValues((current) => ({ ...current, [name]: value }));
    }

    return (
        <form action={formAction} className="space-y-5">
            {state.error || state.success ? (
                <div
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${state.success ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}
                >
                    {state.success ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 size-3.5 shrink-0" />}
                    {state.success ?? state.error}
                </div>
            ) : null}

            <div className="grid min-w-0 gap-6">
                <div className="min-w-0 space-y-6">
                    <Card className="w-full min-w-0 border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
                        <CardHeader className="border-b border-white/5">
                            <div className="flex items-center gap-2 text-violet-300">
                                <Languages className="size-4" />
                                <CardTitle>Informações da experiência</CardTitle>
                            </div>
                            <CardDescription className="text-zinc-500">Mantenha as duas versões prontas antes da publicação.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 mb-5">
                                <div className="space-y-2">
                                    <Label htmlFor={`company-${id ?? "new"}`}>Empresa</Label>
                                    <Input
                                        id={`company-${id ?? "new"}`}
                                        name="company"
                                        value={formValues.company}
                                        onChange={(event) => setField("company", event.target.value)}
                                        placeholder="Empresa"
                                        className={controlClass}
                                        aria-invalid={Boolean(state.fieldErrors?.company)}
                                    />
                                    <FieldError errors={state.fieldErrors?.company} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`location-${id ?? "new"}`}>Localização</Label>
                                    <Input
                                        id={`location-${id ?? "new"}`}
                                        name="location"
                                        value={formValues.location}
                                        onChange={(event) => setField("location", event.target.value)}
                                        placeholder="Rio de Janeiro, Brasil · Remoto"
                                        className={controlClass}
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <div className="">
                                    <Label htmlFor={`companyUrl-${id ?? "new"}`}>Site da empresa</Label>
                                    <Input
                                        id={`companyUrl-${id ?? "new"}`}
                                        name="companyUrl"
                                        type="url"
                                        value={formValues.companyUrl}
                                        onChange={(event) => setField("companyUrl", event.target.value)}
                                        placeholder="https://empresa.com"
                                        className={controlClass}
                                        aria-invalid={Boolean(state.fieldErrors?.companyUrl)}
                                    />
                                    <FieldError errors={state.fieldErrors?.companyUrl} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 mb-5">
                                <div className="space-y-2">
                                    <Label htmlFor={`startedAt-${id ?? "new"}`}>Data de início</Label>
                                    <Input
                                        id={`startedAt-${id ?? "new"}`}
                                        name="startedAt"
                                        type="date"
                                        value={formValues.startedAt}
                                        onChange={(event) => setField("startedAt", event.target.value)}
                                        className={controlClass}
                                        aria-invalid={Boolean(state.fieldErrors?.startedAt)}
                                    />
                                    <FieldError errors={state.fieldErrors?.startedAt} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`finishedAt-${id ?? "new"}`}>Data de término</Label>
                                    <Input
                                        id={`finishedAt-${id ?? "new"}`}
                                        name="finishedAt"
                                        type="date"
                                        value={formValues.finishedAt}
                                        onChange={(event) => setField("finishedAt", event.target.value)}
                                        className={controlClass}
                                        aria-invalid={Boolean(state.fieldErrors?.finishedAt)}
                                    />
                                    <FieldError errors={state.fieldErrors?.finishedAt} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 mb-5">
                                <label className="flex items-center gap-3 text-sm text-zinc-300">
                                    <input
                                        name="current"
                                        type="checkbox"
                                        checked={formValues.current}
                                        onChange={(event) => setField("current", event.target.checked)}
                                        className="size-4 accent-violet-600"
                                    />
                                    Emprego atual
                                </label>
                                <label className="flex items-center gap-3 text-sm text-zinc-300">
                                    <input
                                        name="visible"
                                        type="checkbox"
                                        checked={formValues.visible}
                                        onChange={(event) => setField("visible", event.target.checked)}
                                        className="size-4 accent-violet-600"
                                    />
                                    Visível no portfólio
                                </label>
                            </div>

                            <Tabs defaultValue="pt" className="gap-0">
                                <TabsList className="bg-zinc-950/60">
                                    <TabsTrigger value="pt">Português</TabsTrigger>
                                    <TabsTrigger value="en">English</TabsTrigger>
                                </TabsList>
                                <TabsContent value="pt" forceMount className="data-[state=inactive]:hidden">
                                    <TranslationFields locale="Pt" formId={formId} values={formValues} state={state} onChange={setField} />
                                </TabsContent>
                                <TabsContent value="en" forceMount className="data-[state=inactive]:hidden">
                                    <TranslationFields locale="En" formId={formId} values={formValues} state={state} onChange={setField} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="sticky bottom-4 flex flex-col-reverse gap-3 rounded-xl border border-white/10 bg-zinc-950/90 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-end">
                <Button asChild type="button" variant="ghost" className="text-zinc-400 hover:bg-white/5 hover:text-white">
                    <Link href="/admin/carreira">Cancelar</Link>
                </Button>
                <div className="flex justify-end">
                    <Button type="submit" disabled={pending} className="bg-violet-600 text-white hover:bg-violet-500">
                        {pending ? <Loader2 className="animate-spin" /> : <Save />}
                        {pending ? "Salvando" : id ? "Salvar alterações" : "Cadastrar experiência"}
                    </Button>
                </div>
            </div>
        </form>
    );
}

export function ExperienceFormHeading({ editing }: { editing: boolean }) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
                <FileText className="size-5" />
            </span>
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">{editing ? "Editar experiência" : "Nova experiência"}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                    {editing ? "Atualize o conteúdo e as opções de publicação." : "Cadastre o conteúdo e as opções de publicação"}
                </p>
            </div>
        </div>
    );
}
