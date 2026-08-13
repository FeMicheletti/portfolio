"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { experienceFormSchema, type ExperienceFormState } from "@/lib/experiences/experience-form";
import { redirect } from "next/navigation";

function value(formData: FormData, key: string) {
	return String(formData.get(key) ?? "");
}

function optionalValue(input: string) {
	return input || null;
}

function dateValue(input: string) {
	return new Date(`${input}T00:00:00.000Z`);
}

function parseExperienceForm(formData: FormData) {
	return experienceFormSchema.safeParse({
		company: value(formData, "company"),
		location: value(formData, "location"),
		companyUrl: value(formData, "companyUrl"),
		startedAt: value(formData, "startedAt"),
		finishedAt: value(formData, "finishedAt"),
		current: formData.get("current") === "on",
		visible: formData.get("visible") === "on",
		sortOrder: value(formData, "sortOrder"),
		titlePt: value(formData, "titlePt"),
		summaryPt: value(formData, "summaryPt"),
		descriptionPt: value(formData, "descriptionPt"),
		titleEn: value(formData, "titleEn"),
		summaryEn: value(formData, "summaryEn"),
		descriptionEn: value(formData, "descriptionEn"),
	});
}

function translation(data: ReturnType<typeof experienceFormSchema.parse>, locale: "PT_BR" | "EN_US") {
	const suffix = locale === "PT_BR" ? "Pt" : "En";
	return {
		locale,
		title: data[`title${suffix}`],
		summary: data[`summary${suffix}`],
		description: data[`description${suffix}`],
	};
}

function experienceData(data: ReturnType<typeof experienceFormSchema.parse>) {
	return {
		company: data.company,
		location: optionalValue(data.location),
		companyUrl: optionalValue(data.companyUrl),
		startedAt: dateValue(data.startedAt),
		finishedAt: data.current || !data.finishedAt ? null : dateValue(data.finishedAt),
		current: data.current,
		visible: data.visible,
		sortOrder: data.sortOrder,
	};
}

function revalidateExperiencePaths() {
	revalidatePath("/");
	revalidatePath("/admin");
	revalidatePath("/admin/carreira");
}

export async function createExperienceAction(_state: ExperienceFormState, formData: FormData): Promise<ExperienceFormState> {
	await requireAdmin();
	const result = parseExperienceForm(formData);

	if (!result.success) {
		return {
			error: "Revise os campos destacados.",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	}

	await prisma.experience.create({
		data: {
			...experienceData(result.data),
			translations: {
				create: [translation(result.data, "PT_BR"), translation(result.data, "EN_US")],
			},
		},
	});

	revalidateExperiencePaths();
	redirect(`/admin/carreira`);
}

export async function updateExperienceAction(experienceId: string, _state: ExperienceFormState, formData: FormData): Promise<ExperienceFormState> {
	await requireAdmin();
	const result = parseExperienceForm(formData);

	if (!result.success) {
		return {
			error: "Revise os campos destacados.",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	}

	const exists = await prisma.experience.findUnique({
		where: { id: experienceId },
		select: { id: true },
	});
	if (!exists) return { error: "Experiência não encontrada." };

	await prisma.experience.update({
		where: { id: experienceId },
		data: {
			...experienceData(result.data),
			translations: {
				upsert: (["PT_BR", "EN_US"] as const).map((locale) => {
					const content = translation(result.data, locale);
					return {
						where: { experienceId_locale: { experienceId, locale } },
						create: content,
						update: content,
					};
				}),
			},
		},
	});

	revalidateExperiencePaths();
	redirect(`/admin/carreira`);
}

export async function toggleExperienceVisibilityAction(experienceId: string, visible: boolean) {
	await requireAdmin();
	await prisma.experience.updateMany({
		where: { id: experienceId },
		data: { visible },
	});
	revalidateExperiencePaths();
}

export async function deleteExperienceAction(experienceId: string) {
	await requireAdmin();
	await prisma.experience.deleteMany({ where: { id: experienceId } });
	revalidateExperiencePaths();
}
