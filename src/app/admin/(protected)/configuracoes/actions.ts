"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { siteSettingsFormSchema, type SiteSettingsFormState } from "@/lib/settings/settings-form";
import { redirect } from "next/navigation";
import { $Enums, Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/client";

function value(formData: FormData, key: string) {
    return String(formData.get(key) ?? "");
}

function optionalValue(input: string) {
    return input || null;
}

function parseSettingsForm(formData: FormData) {
    return siteSettingsFormSchema.safeParse({
        contactEmail: value(formData, "contactEmail"),
        githubUrl: value(formData, "githubUrl"),
        linkedinUrl: value(formData, "linkedinUrl"),
        whatsappUrl: value(formData, "whatsappUrl"),
        location: value(formData, "location"),
        timezone: value(formData, "timezone"),
        availableForWork: formData.get("availableForWork") === "on",
        availabilityPt: value(formData, "availabilityPt"),
        availabilityEn: value(formData, "availabilityEn"),
        heroTitlePt: value(formData, "heroTitlePt"),
        heroTitleEn: value(formData, "heroTitleEn"),
        heroSubtitlePt: value(formData, "heroSubtitlePt"),
        heroSubtitleEn: value(formData, "heroSubtitleEn"),
        heroMediaId: value(formData, "heroMediaId"),
        resumePtMediaId: value(formData, "resumePtMediaId"),
        resumeEnMediaId: value(formData, "resumeEnMediaId"),
    });
}

export async function updateSiteSettingsAction(_state: SiteSettingsFormState, formData: FormData): Promise<SiteSettingsFormState> {
    await requireAdmin();
    const result = parseSettingsForm(formData);

    if (!result.success) {
        return {
            error: "Revise os campos destacados.",
            fieldErrors: result.error.flatten().fieldErrors,
        };
    }

    const { heroMediaId, resumePtMediaId, resumeEnMediaId, ...data } = result.data;
    const selectedIds = [...new Set([heroMediaId, resumePtMediaId, resumeEnMediaId].filter(Boolean))];
    const media = selectedIds.length ? await prisma.mediaAsset.findMany({
        where: { id: { in: selectedIds } },
        select: { id: true, kind: true },
    }) : [];
    const mediaById = new Map(media.map((item: { id: string; kind: $Enums.MediaKind; }) => [item.id, item.kind]));
    const fieldErrors: Record<string, string[]> = {};

    if (heroMediaId && mediaById.get(heroMediaId) !== "IMAGE") {
        fieldErrors.heroMediaId = ["Selecione uma imagem existente."];
    }
    if (resumePtMediaId && mediaById.get(resumePtMediaId) !== "PDF") {
        fieldErrors.resumePtMediaId = ["Selecione um PDF existente."];
    }
    if (resumeEnMediaId && mediaById.get(resumeEnMediaId) !== "PDF") {
        fieldErrors.resumeEnMediaId = ["Selecione um PDF existente."];
    }

    if (Object.keys(fieldErrors).length) {
        return { error: "Revise os arquivos selecionados.", fieldErrors };
    }

    await prisma.$transaction(async (transaction: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">) => {
        await transaction.siteSettings.upsert({
            where: { id: "main" },
            update: {
                ...data,
                whatsappUrl: optionalValue(data.whatsappUrl),
                availabilityPt: optionalValue(data.availabilityPt),
                availabilityEn: optionalValue(data.availabilityEn),
                heroTitlePt: optionalValue(data.heroTitlePt),
                heroTitleEn: optionalValue(data.heroTitleEn),
                heroSubtitlePt: optionalValue(data.heroSubtitlePt),
                heroSubtitleEn: optionalValue(data.heroSubtitleEn),
                heroMediaId: optionalValue(heroMediaId),
            },
            create: {
                id: "main",
                ...data,
                whatsappUrl: optionalValue(data.whatsappUrl),
                availabilityPt: optionalValue(data.availabilityPt),
                availabilityEn: optionalValue(data.availabilityEn),
                heroTitlePt: optionalValue(data.heroTitlePt),
                heroTitleEn: optionalValue(data.heroTitleEn),
                heroSubtitlePt: optionalValue(data.heroSubtitlePt),
                heroSubtitleEn: optionalValue(data.heroSubtitleEn),
                heroMediaId: optionalValue(heroMediaId),
            },
        });

        for (const resume of [
            {
                locale: "PT_BR" as const,
                mediaId: resumePtMediaId,
                label: "Currículo em português",
            },
            {
                locale: "EN_US" as const,
                mediaId: resumeEnMediaId,
                label: "Resume in English",
            },
        ]) {
            if (resume.mediaId) {
                await transaction.resume.upsert({
                    where: { locale: resume.locale },
                    update: { mediaId: resume.mediaId, label: resume.label },
                    create: resume,
                });
            } else {
                await transaction.resume.deleteMany({
                    where: { locale: resume.locale },
                });
            }
        }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/midia");
    revalidatePath("/admin/configuracoes");
    redirect("/admin/configuracoes");
    return { success: "Configurações atualizadas com sucesso." };
}
