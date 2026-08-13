import { z } from "zod";

const optionalUrl = z.union([
	z.literal(""),
	z.string().trim().url("Informe uma URL válida.").max(1000),
]);

export const siteSettingsFormSchema = z.object({
	contactEmail: z.string().trim().email("Informe um e-mail válido.").max(191),
	githubUrl: z.string().trim().url("Informe uma URL válida para o GitHub.").max(1000),
	linkedinUrl: z.string().trim().url("Informe uma URL válida para o LinkedIn.").max(1000),
	whatsappUrl: optionalUrl,
	location: z.string().trim().min(2, "Informe a localização.").max(120),
	timezone: z.string().trim().min(2, "Informe o fuso horário.").max(64),
	availableForWork: z.boolean(),
	availabilityPt: z.string().trim().max(255),
	availabilityEn: z.string().trim().max(255),
	heroTitlePt: z.string().trim().max(255),
	heroTitleEn: z.string().trim().max(255),
	heroSubtitlePt: z.string().trim().max(500),
	heroSubtitleEn: z.string().trim().max(500),
	heroMediaId: z.string().trim(),
	resumePtMediaId: z.string().trim(),
	resumeEnMediaId: z.string().trim(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

export type SiteSettingsFormState = {
	error?: string;
	success?: string;
	fieldErrors?: Record<string, string[]>;
};
