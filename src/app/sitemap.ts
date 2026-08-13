import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const projects = await prisma.project.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
	return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          "pt-BR": absoluteUrl("/"),
          "en-US": absoluteUrl("/?lang=en"),
          "x-default": absoluteUrl("/"),
        },
      },
    },
		{ url: absoluteUrl("/privacidade"), changeFrequency: "yearly", priority: 0.2 },
		...projects.map((project) => ({ url: absoluteUrl(`/projetos/${project.slug}`), lastModified: project.updatedAt, changeFrequency: "monthly" as const, priority: 0.8, alternates: { languages: { "pt-BR": absoluteUrl(`/projetos/${project.slug}`), "en-US": absoluteUrl(`/projetos/${project.slug}?lang=en`), "x-default": absoluteUrl(`/projetos/${project.slug}`) } } })),
	];
}
