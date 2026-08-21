import { Settings2 } from "lucide-react";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
    const [settings, media, resumes] = await Promise.all([
        prisma.siteSettings.findUnique({ where: { id: "main" } }),
        prisma.mediaAsset.findMany({
            where: { kind: { in: ["IMAGE", "PDF"] } },
            orderBy: { createdAt: "desc" },
            select: { id: true, fileName: true, kind: true },
        }),
        prisma.resume.findMany({ select: { locale: true, mediaId: true } }),
    ]);

    const resumeByLocale = new Map(resumes.map((resume) => [resume.locale, resume.mediaId]));
    const images = media.filter((item) => item.kind === "IMAGE");
    const pdfs = media.filter((item) => item.kind === "PDF");

    return (
        <div className="space-y-6">
            <div>
                <p className="flex items-center gap-2 text-sm font-medium text-violet-300">
                    <Settings2 className="size-4" />
                    Conteúdo público
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Configurações do site</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Atualize os dados gerais, o hero e os currículos sem precisar alterar o código.
                </p>
            </div>

            <SiteSettingsForm
                images={images}
                pdfs={pdfs}
                values={{
                    contactEmail: settings?.contactEmail ?? "felipemicheletti.dev@gmail.com",
                    githubUrl: settings?.githubUrl ?? "https://github.com/FeMicheletti",
                    linkedinUrl: settings?.linkedinUrl ?? "https://www.linkedin.com/in/felipe-micheletti",
                    whatsappUrl: settings?.whatsappUrl ?? "",
                    location: settings?.location ?? "Rio de Janeiro, Brazil",
                    timezone: settings?.timezone ?? "America/Sao_Paulo",
                    availableForWork: settings?.availableForWork ?? true,
                    availabilityPt: settings?.availabilityPt ?? "",
                    availabilityEn: settings?.availabilityEn ?? "",
                    heroTitlePt: settings?.heroTitlePt ?? "",
                    heroTitleEn: settings?.heroTitleEn ?? "",
                    heroSubtitlePt: settings?.heroSubtitlePt ?? "",
                    heroSubtitleEn: settings?.heroSubtitleEn ?? "",
                    heroMediaId: settings?.heroMediaId ?? "",
                    resumePtMediaId: resumeByLocale.get("PT_BR") ?? "",
                    resumeEnMediaId: resumeByLocale.get("EN_US") ?? "",
                }}
            />
        </div>
    );
}
