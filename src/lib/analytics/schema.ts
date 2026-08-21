import { z } from "zod";
import { analyticsEventTypes } from "@/lib/analytics/types";

const optionalText = (maximum: number) => z.string().trim().min(1).max(maximum).optional();

export const analyticsEventSchema = z.object({
    eventType: z.enum(analyticsEventTypes),
    path: z.string().trim().startsWith("/").max(500),
    locale: z.enum(["PT_BR", "EN_US"]),
    targetUrl: optionalText(1000).refine((value) => {
        if (!value) return true;
        try {
            return ["http:", "https:", "mailto:"].includes(new URL(value, "https://portfolio.local").protocol);
        } catch {
            return false;
        }
    }, "Destino inválido"),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
