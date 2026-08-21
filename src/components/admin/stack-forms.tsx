"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { createCategoryAction, createTechnologyAction, updateCategoryAction, updateTechnologyAction } from "@/app/admin/(protected)/stacks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryFormValues, StackFormState, TechnologyFormValues } from "@/lib/stacks/stack-form";

const initialState: StackFormState = {};
const controlClass = "border-white/10 bg-zinc-950/50 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20";

function Feedback({ state }: { state: StackFormState }) {
    if (!state.error && !state.success) return null;

    const success = Boolean(state.success);
    const Icon = success ? CheckCircle2 : AlertCircle;

    return (
        <div
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${success ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}
        >
            <Icon className="mt-0.5 size-3.5 shrink-0" />
            {state.success ?? state.error}
        </div>
    );
}

function FieldError({ errors }: { errors?: string[] }) {
    return errors?.[0] ? <p className="text-xs text-red-400">{errors[0]}</p> : null;
}

function SubmitButton({ editing }: { editing: boolean }) {
    return (
        <Button type="submit" className="bg-violet-600 text-white hover:bg-violet-500">
            <Save />
            {editing ? "Salvar alterações" : "Cadastrar"}
        </Button>
    );
}

export function CategoryForm({ id, values }: { id?: string; values?: CategoryFormValues }) {
    const action = id ? updateCategoryAction.bind(null, id) : createCategoryAction;
    const [state, formAction, pending] = useActionState(action, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <Feedback state={state} />
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`category-namePt-${id ?? "new"}`}>Nome em português</Label>
                    <Input
                        id={`category-namePt-${id ?? "new"}`}
                        name="namePt"
                        defaultValue={values?.namePt}
                        aria-invalid={Boolean(state.fieldErrors?.namePt)}
                        className={controlClass}
                    />
                    <FieldError errors={state.fieldErrors?.namePt} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`category-nameEn-${id ?? "new"}`}>Nome em inglês</Label>
                    <Input
                        id={`category-nameEn-${id ?? "new"}`}
                        name="nameEn"
                        defaultValue={values?.nameEn}
                        aria-invalid={Boolean(state.fieldErrors?.nameEn)}
                        className={controlClass}
                    />
                    <FieldError errors={state.fieldErrors?.nameEn} />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                <div className="space-y-2">
                    <Label htmlFor={`category-slug-${id ?? "new"}`}>Slug</Label>
                    <Input
                        id={`category-slug-${id ?? "new"}`}
                        name="slug"
                        defaultValue={values?.slug}
                        placeholder="backend"
                        aria-invalid={Boolean(state.fieldErrors?.slug)}
                        className={controlClass}
                    />
                    <FieldError errors={state.fieldErrors?.slug} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`category-order-${id ?? "new"}`}>Ordem</Label>
                    <Input
                        id={`category-order-${id ?? "new"}`}
                        name="sortOrder"
                        type="number"
                        min="0"
                        defaultValue={values?.sortOrder ?? 0}
                        aria-invalid={Boolean(state.fieldErrors?.sortOrder)}
                        className={controlClass}
                    />
                    <FieldError errors={state.fieldErrors?.sortOrder} />
                </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input name="visible" type="checkbox" defaultChecked={values?.visible ?? true} className="size-4 accent-violet-600" />
                Categoria visível no portfólio
            </label>
            <div className="flex justify-end">
                {pending ? (
                    <Button disabled>
                        <Loader2 className="animate-spin" />
                        Salvando
                    </Button>
                ) : (
                    <SubmitButton editing={Boolean(id)} />
                )}
            </div>
        </form>
    );
}

type CategoryOption = { id: string; namePt: string };

export function TechnologyForm({ id, values, categories }: { id?: string; values?: TechnologyFormValues; categories: CategoryOption[] }) {
    const action = id ? updateTechnologyAction.bind(null, id) : createTechnologyAction;
    const [state, formAction, pending] = useActionState(action, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <Feedback state={state} />
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`technology-name-${id ?? "new"}`}>Nome</Label>
                    <Input
                        id={`technology-name-${id ?? "new"}`}
                        name="name"
                        defaultValue={values?.name}
                        placeholder="Next.js"
                        aria-invalid={Boolean(state.fieldErrors?.name)}
                        className={controlClass}
                    />
                    <FieldError errors={state.fieldErrors?.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`technology-slug-${id ?? "new"}`}>Slug</Label>
                    <Input
                        id={`technology-slug-${id ?? "new"}`}
                        name="slug"
                        defaultValue={values?.slug}
                        placeholder="next-js"
                        aria-invalid={Boolean(state.fieldErrors?.slug)}
                        className={controlClass}
                    />
                    <FieldError errors={state.fieldErrors?.slug} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`technology-category-${id ?? "new"}`}>Categoria</Label>
                <select
                    id={`technology-category-${id ?? "new"}`}
                    name="categoryId"
                    defaultValue={values?.categoryId ?? ""}
                    aria-invalid={Boolean(state.fieldErrors?.categoryId)}
                    className="h-9 w-full rounded-md border border-white/10 bg-zinc-950/50 px-2.5 text-sm outline-none focus:border-violet-500/60 focus:ring-3 focus:ring-violet-500/20"
                >
                    <option value="" disabled>
                        Selecione uma categoria
                    </option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.namePt}
                        </option>
                    ))}
                </select>
                <FieldError errors={state.fieldErrors?.categoryId} />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem_7rem]">
                <div className="space-y-2">
                    <Label htmlFor={`technology-icon-${id ?? "new"}`}>Nome do ícone</Label>
                    <Input
                        id={`technology-icon-${id ?? "new"}`}
                        name="iconKey"
                        defaultValue={values?.iconKey}
                        placeholder="SiNextdotjs"
                        className={controlClass}
                    />
                    <p className="text-xs leading-5 text-zinc-500">
                        Use o nome do React Icons ou uma chave curta. Exemplos: SiNextdotjs, SiReact, SiTypescript, FaJava, FaAws, nodejs, docker.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`technology-color-${id ?? "new"}`}>Cor</Label>
                    <Input
                        id={`technology-color-${id ?? "new"}`}
                        name="color"
                        defaultValue={values?.color}
                        placeholder="#7c3aed"
                        aria-invalid={Boolean(state.fieldErrors?.color)}
                        className={controlClass}
                    />
                    <FieldError errors={state.fieldErrors?.color} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`technology-order-${id ?? "new"}`}>Ordem</Label>
                    <Input
                        id={`technology-order-${id ?? "new"}`}
                        name="sortOrder"
                        type="number"
                        min="0"
                        defaultValue={values?.sortOrder ?? 0}
                        className={controlClass}
                    />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`technology-descriptionPt-${id ?? "new"}`}>Descrição em português</Label>
                    <Textarea
                        id={`technology-descriptionPt-${id ?? "new"}`}
                        name="descriptionPt"
                        defaultValue={values?.descriptionPt}
                        maxLength={500}
                        className={controlClass}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`technology-descriptionEn-${id ?? "new"}`}>Descrição em inglês</Label>
                    <Textarea
                        id={`technology-descriptionEn-${id ?? "new"}`}
                        name="descriptionEn"
                        defaultValue={values?.descriptionEn}
                        maxLength={500}
                        className={controlClass}
                    />
                </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input name="visible" type="checkbox" defaultChecked={values?.visible ?? true} className="size-4 accent-violet-600" />
                Tecnologia visível no portfólio
            </label>
            <div className="flex justify-end">
                {pending ? (
                    <Button disabled>
                        <Loader2 className="animate-spin" />
                        Salvando
                    </Button>
                ) : (
                    <SubmitButton editing={Boolean(id)} />
                )}
            </div>
        </form>
    );
}
