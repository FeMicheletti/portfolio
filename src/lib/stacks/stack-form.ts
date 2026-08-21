import { z } from "zod";

const slug = z
    .string()
    .trim()
    .min(2, "Informe um slug.")
    .max(100, "O slug deve ter no máximo 100 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.");

export const categoryFormSchema = z.object({
    slug,
    namePt: z.string().trim().min(2, "Informe o nome em português.").max(100),
    nameEn: z.string().trim().min(2, "Informe o nome em inglês.").max(100),
    sortOrder: z.coerce.number().int().min(0, "A ordem não pode ser negativa."),
    visible: z.boolean(),
});

export const technologyFormSchema = z.object({
    categoryId: z.string().trim().min(1, "Selecione uma categoria."),
    name: z.string().trim().min(2, "Informe o nome da tecnologia.").max(100),
    slug,
    iconKey: z.string().trim().max(100),
    color: z.union([
        z.literal(""),
        z
            .string()
            .trim()
            .regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor hexadecimal, como #7c3aed."),
    ]),
    descriptionPt: z.string().trim().max(500),
    descriptionEn: z.string().trim().max(500),
    sortOrder: z.coerce.number().int().min(0, "A ordem não pode ser negativa."),
    visible: z.boolean(),
});

export type StackFormState = {
    error?: string;
    success?: string;
    fieldErrors?: Record<string, string[]>;
};

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type TechnologyFormValues = z.infer<typeof technologyFormSchema>;
