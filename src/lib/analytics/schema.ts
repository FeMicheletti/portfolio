import { z } from "zod";
import { analyticsEventTypes } from "@/lib/analytics/types";

const optionalText = (maximum: number) =>
  z.string().trim().min(1).max(maximum).optional();

export const analyticsEventSchema = z.object({
  eventType: z.enum(analyticsEventTypes),
  visitorId: z.string().regex(/^[a-zA-Z0-9_-]{16,64}$/),
  sessionId: z.string().regex(/^[a-zA-Z0-9_-]{16,64}$/),
  path: z.string().trim().startsWith("/").max(500),
  locale: z.enum(["PT_BR", "EN_US"]),
  projectId: optionalText(191),
  targetUrl: optionalText(1000).refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:", "mailto:"].includes(
        new URL(value, "https://portfolio.local").protocol,
      );
    } catch {
      return false;
    }
  }, "Destino inválido"),
  referrerHost: optionalText(255),
  utmSource: optionalText(191),
  utmMedium: optionalText(191),
  utmCampaign: optionalText(191),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
