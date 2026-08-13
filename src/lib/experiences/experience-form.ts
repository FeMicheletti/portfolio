import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().trim().url("Informe uma URL válida.")]);

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.");
const optionalDate = z.union([z.literal(""), date]);

export const experienceFormSchema = z
	.object({
		company: z.string().trim().min(2, "Informe a empresa.").max(191),
		location: z.string().trim().max(191),
		companyUrl: optionalUrl,
		startedAt: date,
		finishedAt: optionalDate,
		current: z.boolean(),
		visible: z.boolean(),
		sortOrder: z.coerce.number().int().min(0, "A ordem não pode ser negativa."),
		titlePt: z.string().trim().min(2, "Informe o cargo em português.").max(191),
		summaryPt: z.string().trim().min(10, "O resumo deve ter ao menos 10 caracteres.").max(500),
		descriptionPt: z.string().trim().min(10, "Descreva a experiência em português."),
		titleEn: z.string().trim().min(2, "Informe o cargo em inglês.").max(191),
		summaryEn: z.string().trim().min(10, "O resumo deve ter ao menos 10 caracteres.").max(500),
		descriptionEn: z.string().trim().min(10, "Descreva a experiência em inglês."),
	})
	.superRefine((data, context) => {
		if (data.current && data.finishedAt) {
			context.addIssue({
				code: "custom",
				path: ["finishedAt"],
				message: "Um emprego atual não deve ter data de término.",
			});
		}

		if (!data.current && !data.finishedAt) {
			context.addIssue({
				code: "custom",
				path: ["finishedAt"],
				message: "Informe o término ou marque como emprego atual.",
			});
		}

		if (data.finishedAt && data.finishedAt < data.startedAt) {
			context.addIssue({
				code: "custom",
				path: ["finishedAt"],
				message: "O término não pode ser anterior ao início.",
			});
		}
	});

export type ExperienceFormState = {
	error?: string;
	success?: string;
	fieldErrors?: Record<string, string[]>;
};

export type ExperienceFormValues = {
	company: string;
	location: string;
	companyUrl: string;
	startedAt: string;
	finishedAt: string;
	current: boolean;
	visible: boolean;
	sortOrder: number;
	titlePt: string;
	summaryPt: string;
	descriptionPt: string;
	titleEn: string;
	summaryEn: string;
	descriptionEn: string;
};
