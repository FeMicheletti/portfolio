import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
