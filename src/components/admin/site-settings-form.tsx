"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, FileText, ImageIcon, Loader2, Save, UserRoundCog } from "lucide-react";
import { updateSiteSettingsAction } from "@/app/admin/(protected)/configuracoes/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettingsFormState, SiteSettingsFormValues } from "@/lib/settings/settings-form";

type MediaOption = {
	id: string;
	fileName: string;
};

function FieldError({ errors }: { errors?: string[] }) {
	return errors?.[0] ? (
		<p className="text-xs text-red-400">{errors[0]}</p>
	) : null;
}

function SaveButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" disabled={pending} className="bg-violet-600 text-white hover:bg-violet-500">
			{pending ? <Loader2 className="animate-spin" /> : <Save />}
			{pending ? "Salvando..." : "Salvar configurações"}
		</Button>
	);
}

function TextField({ label, name, defaultValue, placeholder, errors, type = "text" }: { label: string; name: string; defaultValue: string; placeholder?: string; errors?: string[]; type?: string; }) {
	return (
		<div className="space-y-2">
			<Label htmlFor={name}>{label}</Label>
			<Input
				id={name}
				name={name}
				type={type}
				defaultValue={defaultValue}
				placeholder={placeholder}
				aria-invalid={Boolean(errors?.length)}
				className="border-white/10 bg-zinc-950/50 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20"
			/>
			<FieldError errors={errors} />
		</div>
	);
}

function MediaSelect({ label, name, defaultValue, options, emptyLabel, errors }: { label: string; name: string; defaultValue: string; options: MediaOption[]; emptyLabel: string; errors?: string[]; }) {
	return (
		<div className="space-y-2">
			<Label htmlFor={name}>{label}</Label>
			<select
				id={name}
				name={name}
				defaultValue={defaultValue}
				aria-invalid={Boolean(errors?.length)}
				className="h-10 w-full rounded-md border border-white/10 bg-zinc-950/50 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500/60 focus:ring-3 focus:ring-violet-500/20"
			>
				<option value="">{emptyLabel}</option>
				{options.map((option) => (
					<option key={option.id} value={option.id}>
						{option.fileName}
					</option>
				))}
			</select>
			<FieldError errors={errors} />
		</div>
	);
}

export function SiteSettingsForm({ values, images, pdfs }: { values: SiteSettingsFormValues; images: MediaOption[]; pdfs: MediaOption[]; }) {
	const [state, formAction] = useActionState<SiteSettingsFormState, FormData>( updateSiteSettingsAction, {});

	return (
		<form action={formAction} className="space-y-6">
			{state.error ? (
				<div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
					<AlertCircle className="mt-0.5 size-4 shrink-0" />
					{state.error}
				</div>
			) : null}
			{state.success ? (
				<div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
					<CheckCircle2 className="mt-0.5 size-4 shrink-0" />
					{state.success}
				</div>
			) : null}

			<div className="grid gap-6 xl:grid-cols-2">
				<Card className="border-violet-500/10 bg-zinc-900/70 ring-0">
					<CardHeader className="border-b border-white/5">
						<div className="flex items-center gap-2 text-violet-300">
							<UserRoundCog className="size-4" />
							<CardTitle>Perfil e contato</CardTitle>
						</div>
						<CardDescription className="text-zinc-500">
							Dados exibidos na área pública e nos botões de contato.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-5 sm:grid-cols-2">
						<TextField
							label="E-mail"
							name="contactEmail"
							type="email"
							defaultValue={values.contactEmail}
							errors={state.fieldErrors?.contactEmail}
						/>
						<TextField
							label="Localização"
							name="location"
							defaultValue={values.location}
							errors={state.fieldErrors?.location}
						/>
						<TextField
							label="GitHub"
							name="githubUrl"
							type="url"
							defaultValue={values.githubUrl}
							errors={state.fieldErrors?.githubUrl}
						/>
						<TextField
							label="LinkedIn"
							name="linkedinUrl"
							type="url"
							defaultValue={values.linkedinUrl}
							errors={state.fieldErrors?.linkedinUrl}
						/>
						<TextField
							label="WhatsApp (opcional)"
							name="whatsappUrl"
							type="url"
							defaultValue={values.whatsappUrl}
							placeholder="https://wa.me/..."
							errors={state.fieldErrors?.whatsappUrl}
						/>
						<TextField
							label="Fuso horário"
							name="timezone"
							defaultValue={values.timezone}
							placeholder="America/Sao_Paulo"
							errors={state.fieldErrors?.timezone}
						/>
						<div className="grid gap-5 sm:grid-cols-2 col-span-2">
							<TextField
								label="Título em português"
								name="heroTitlePt"
								defaultValue={values.heroTitlePt}
								placeholder="Full-Stack Developer"
								errors={state.fieldErrors?.heroTitlePt}
							/>
							<TextField
								label="Title in English"
								name="heroTitleEn"
								defaultValue={values.heroTitleEn}
								placeholder="Full-Stack Developer"
								errors={state.fieldErrors?.heroTitleEn}
							/>
						</div>
					</CardContent>
				</Card>
				<div>
					<Card className="border-violet-500/10 bg-zinc-900/70 ring-0">
						<CardHeader className="border-b border-white/5">
							<div className="flex items-center gap-2 text-violet-300">
								<FileText className="size-4" />
								<CardTitle>Currículos</CardTitle>
							</div>
							<CardDescription className="text-zinc-500">
								Cada idioma pode baixar um PDF diferente da sua biblioteca do
								OneDrive.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-5 ">
							<MediaSelect
								label="Currículo em português"
								name="resumePtMediaId"
								defaultValue={values.resumePtMediaId}
								options={pdfs}
								emptyLabel="Nenhum currículo em português"
								errors={state.fieldErrors?.resumePtMediaId}
							/>
							<MediaSelect
								label="Resume in English"
								name="resumeEnMediaId"
								defaultValue={values.resumeEnMediaId}
								options={pdfs}
								emptyLabel="No English resume"
								errors={state.fieldErrors?.resumeEnMediaId}
							/>
							{pdfs.length === 0 ? (
								<p className="text-xs text-amber-300 sm:col-span-2">
									Envie os PDFs na Biblioteca de mídia antes de vinculá-los.
								</p>
							) : null}
							<MediaSelect
								label="Imagem de fundo"
								name="heroMediaId"
								defaultValue={values.heroMediaId}
								options={images}
								emptyLabel="Usar a imagem padrão do projeto"
								errors={state.fieldErrors?.heroMediaId}
							/>
							{images.length === 0 ? (
								<p className="text-xs text-amber-300">
									Envie uma imagem na Biblioteca de mídia para poder selecioná-la
									aqui.
								</p>
							) : null}
						</CardContent>
					</Card>
					<div className="flex justify-end mt-5">
						<SaveButton />
					</div>
				</div>
			</div>
		</form>
	);
}
