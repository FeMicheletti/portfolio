"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema, technologyFormSchema, type StackFormState } from "@/lib/stacks/stack-form";

function value(formData: FormData, key: string) {
	return String(formData.get(key) ?? "");
}

function optionalValue(input: string) {
	return input || null;
}

function parseCategoryForm(formData: FormData) {
	return categoryFormSchema.safeParse({
		slug: value(formData, "slug"),
		namePt: value(formData, "namePt"),
		nameEn: value(formData, "nameEn"),
		sortOrder: value(formData, "sortOrder"),
		visible: formData.get("visible") === "on",
	});
}

function parseTechnologyForm(formData: FormData) {
	return technologyFormSchema.safeParse({
		categoryId: value(formData, "categoryId"),
		name: value(formData, "name"),
		slug: value(formData, "slug"),
		iconKey: value(formData, "iconKey"),
		color: value(formData, "color"),
		descriptionPt: value(formData, "descriptionPt"),
		descriptionEn: value(formData, "descriptionEn"),
		sortOrder: value(formData, "sortOrder"),
		visible: formData.get("visible") === "on",
	});
}

async function slugInUse(model: "category" | "technology", slug: string, ignoredId?: string) {
	if (model === "category") {
		return prisma.technologyCategory.findFirst({
			where: { slug, id: ignoredId ? { not: ignoredId } : undefined },
			select: { id: true },
		});
	}

	return prisma.technology.findFirst({
		where: { slug, id: ignoredId ? { not: ignoredId } : undefined },
		select: { id: true },
	});
}

export async function createCategoryAction(_state: StackFormState, formData: FormData): Promise<StackFormState> {
	await requireAdmin();
	const result = parseCategoryForm(formData);

	if (!result.success)
		return {
			error: "Revise os campos destacados.",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	if (await slugInUse("category", result.data.slug))
		return {
			error: "Já existe uma categoria com esse slug.",
			fieldErrors: { slug: ["Escolha outro slug."] },
		};

	await prisma.technologyCategory.create({ data: result.data });
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
	return { success: "Categoria criada com sucesso." };
}

export async function updateCategoryAction(categoryId: string, _state: StackFormState, formData: FormData): Promise<StackFormState> {
	await requireAdmin();
	const result = parseCategoryForm(formData);

	if (!result.success)
		return {
			error: "Revise os campos destacados.",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	if (await slugInUse("category", result.data.slug, categoryId))
		return {
			error: "Já existe uma categoria com esse slug.",
			fieldErrors: { slug: ["Escolha outro slug."] },
		};

	const updated = await prisma.technologyCategory.updateMany({
		where: { id: categoryId },
		data: result.data,
	});

	if (!updated.count) return { error: "Categoria não encontrada." };
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
	return { success: "Categoria atualizada com sucesso." };
}

export async function createTechnologyAction(_state: StackFormState, formData: FormData): Promise<StackFormState> {
	await requireAdmin();
	const result = parseTechnologyForm(formData);

	if (!result.success)
		return {
			error: "Revise os campos destacados.",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	if (await slugInUse("technology", result.data.slug))
		return {
			error: "Já existe uma tecnologia com esse slug.",
			fieldErrors: { slug: ["Escolha outro slug."] },
		};

	const category = await prisma.technologyCategory.findUnique({
		where: { id: result.data.categoryId },
		select: { id: true },
	});
	if (!category) return { error: "A categoria selecionada não existe." };

	await prisma.technology.create({
		data: {
			...result.data,
			iconKey: optionalValue(result.data.iconKey),
			color: optionalValue(result.data.color),
			descriptionPt: optionalValue(result.data.descriptionPt),
			descriptionEn: optionalValue(result.data.descriptionEn),
		},
	});
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
	return { success: "Tecnologia criada com sucesso." };
}

export async function updateTechnologyAction(technologyId: string, _state: StackFormState, formData: FormData): Promise<StackFormState> {
	await requireAdmin();
	const result = parseTechnologyForm(formData);

	if (!result.success)
		return {
			error: "Revise os campos destacados.",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	if (await slugInUse("technology", result.data.slug, technologyId))
		return {
			error: "Já existe uma tecnologia com esse slug.",
			fieldErrors: { slug: ["Escolha outro slug."] },
		};

	const category = await prisma.technologyCategory.findUnique({
		where: { id: result.data.categoryId },
		select: { id: true },
	});
	if (!category) return { error: "A categoria selecionada não existe." };

	const updated = await prisma.technology.updateMany({
		where: { id: technologyId },
		data: {
			...result.data,
			iconKey: optionalValue(result.data.iconKey),
			color: optionalValue(result.data.color),
			descriptionPt: optionalValue(result.data.descriptionPt),
			descriptionEn: optionalValue(result.data.descriptionEn),
		},
	});

	if (!updated.count) return { error: "Tecnologia não encontrada." };
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
	return { success: "Tecnologia atualizada com sucesso." };
}

export async function toggleCategoryVisibilityAction(categoryId: string, visible: boolean) {
	await requireAdmin();
	await prisma.technologyCategory.updateMany({
		where: { id: categoryId },
		data: { visible },
	});
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
}

export async function toggleTechnologyVisibilityAction(technologyId: string, visible: boolean) {
	await requireAdmin();
	await prisma.technology.updateMany({
		where: { id: technologyId },
		data: { visible },
	});
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
}

export async function deleteCategoryAction(categoryId: string) {
	await requireAdmin();
	const deleted = await prisma.technologyCategory.deleteMany({
		where: { id: categoryId, technologies: { none: {} } },
	});

	if (!deleted.count) redirect("/admin/stacks?error=category-has-technologies");
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
}

export async function deleteTechnologyAction(technologyId: string) {
	await requireAdmin();
	const deleted = await prisma.technology.deleteMany({
		where: { id: technologyId, projects: { none: {} } },
	});

	if (!deleted.count) redirect("/admin/stacks?error=technology-has-projects");
	revalidatePath("/admin");
	revalidatePath("/admin/stacks");
	revalidatePath("/");
}
