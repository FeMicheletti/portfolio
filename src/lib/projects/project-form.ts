import { z } from "zod";

const optionalUrl = z.union([
	z.literal(""),
	z.string().trim().url("Informe uma URL válida."),
]);

const optionalDate = z.union([
	z.literal(""),
	z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
]);

const projectMediaSchema = z.object({
	mediaId: z.string().trim().min(1),
	role: z.enum(["COVER", "GALLERY"]),
	altPt: z.string().trim().max(255, "O texto alternativo deve ter no máximo 255 caracteres."),
	altEn: z.string().trim().max(255, "O texto alternativo deve ter no máximo 255 caracteres."),
});

export const projectFormSchema = z.object({
	slug: z.string()
		.trim()
		.min(2, "Informe o slug do projeto.")
		.max(191, "O slug deve ter no máximo 191 caracteres.")
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    featured: z.boolean(),
    sortOrder: z.coerce.number().int().min(0, "A ordem não pode ser negativa."),
    repositoryUrl: optionalUrl,
    demoUrl: optionalUrl,
    startedAt: optionalDate,
    finishedAt: optionalDate,
    titlePt: z
		.string()
		.trim()
		.min(2, "Informe o título em português.")
		.max(191),
    summaryPt: z
		.string()
		.trim()
		.min(10, "O resumo em português deve ter pelo menos 10 caracteres."),
    problemPt: z.string().trim(),
    solutionPt: z.string().trim(),
    responsibilitiesPt: z.string().trim(),
    technicalChoicesPt: z.string().trim(),
    resultsPt: z.string().trim(),
    titleEn: z.string().trim().min(2, "Informe o título em inglês.").max(191),
    summaryEn: z
		.string()
		.trim()
		.min(10, "O resumo em inglês deve ter pelo menos 10 caracteres."),
    problemEn: z.string().trim(),
    solutionEn: z.string().trim(),
    responsibilitiesEn: z.string().trim(),
    technicalChoicesEn: z.string().trim(),
    resultsEn: z.string().trim(),
	technologyIds: z.array(z.string().trim().min(1)).max(50, "Selecione no máximo 50 tecnologias."),
	projectMedia: z.array(projectMediaSchema).max(30, "Selecione no máximo 30 imagens.")
}).superRefine((data, context) => {
    if (data.startedAt && data.finishedAt && data.finishedAt < data.startedAt) {
		context.addIssue({
			code: "custom",
			path: ["finishedAt"],
			message: "A conclusão não pode ser anterior ao início."
		});
    }

	const mediaIds = data.projectMedia.map(({ mediaId }) => mediaId);
	if (new Set(mediaIds).size !== mediaIds.length) {
		context.addIssue({
			code: "custom",
			path: ["projectMedia"],
			message: "Uma mesma imagem não pode ser vinculada mais de uma vez."
		});
	}

	if (data.projectMedia.filter(({ role }) => role === "COVER").length > 1) {
		context.addIssue({
			code: "custom",
			path: ["projectMedia"],
			message: "Selecione apenas uma imagem de capa."
		});
	}
});

export type ProjectFormState = {
	error?: string;
	fieldErrors?: Record<string, string[]>;
};

export type ProjectMediaFormValue = z.infer<typeof projectMediaSchema>;

export type ProjectFormValues = {
	id?: string;
	slug: string;
	status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
	featured: boolean;
	sortOrder: number;
	repositoryUrl: string;
	demoUrl: string;
	startedAt: string;
	finishedAt: string;
	titlePt: string;
	summaryPt: string;
	problemPt: string;
	solutionPt: string;
	responsibilitiesPt: string;
	technicalChoicesPt: string;
	resultsPt: string;
	titleEn: string;
	summaryEn: string;
	problemEn: string;
	solutionEn: string;
	responsibilitiesEn: string;
	technicalChoicesEn: string;
	resultsEn: string;
	technologyIds: string[];
	projectMedia: ProjectMediaFormValue[];
};