import { prisma } from "@/lib/prisma";

export const analyticsPeriods = [7, 30, 90] as const;
export type AnalyticsPeriod = (typeof analyticsPeriods)[number];

const deviceLabels: Record<string, string> = {
    DESKTOP: "Desktop",
    MOBILE: "Celular",
    TABLET: "Tablet",
    UNKNOWN: "Desconhecido",
    BOT: "Bot",
};

const interactionEvents = new Set([
    "RESUME_DOWNLOAD",
    "PROJECT_DEMO_CLICK",
    "PROJECT_GITHUB_CLICK",
    "GITHUB_CLICK",
    "LINKEDIN_CLICK",
    "EMAIL_CLICK",
    "LANGUAGE_CHANGE",
    "WHATSAPP_CLICK",
]);

function isoDay(date: Date) {
    return date.toISOString().slice(0, 10);
}

function shortDate(day: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
    }).format(new Date(`${day}T12:00:00Z`));
}

export async function getAnalyticsDashboard(period: AnalyticsPeriod) {
    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - period + 1);

    const events = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: start } },
        orderBy: { createdAt: "asc" },
        select: {
            eventType: true,
            visitorId: true,
            sessionId: true,
            deviceType: true,
            referrerHost: true,
            utmSource: true,
            projectId: true,
            createdAt: true,
            project: {
                select: {
                    slug: true,
                    translations: {
                        where: { locale: "PT_BR" },
                        take: 1,
                        select: { title: true },
                    },
                },
            },
        },
    });

    const visitors = new Set<string>();
    const sessions = new Set<string>();
    const engagedSessions = new Set<string>();
    const daily = new Map<string, { views: number; visitors: Set<string> }>();
    const devices = new Map<string, number>();
    const sources = new Map<string, number>();
    const projects = new Map<string, { name: string; views: number; demos: number; repositories: number }>();

    for (let offset = 0; offset < period; offset += 1) {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + offset);
        daily.set(isoDay(date), { views: 0, visitors: new Set() });
    }

    for (const event of events) {
        visitors.add(event.visitorId);
        sessions.add(event.sessionId);
        if (interactionEvents.has(event.eventType)) engagedSessions.add(event.sessionId);

        if (event.eventType === "PAGE_VIEW") {
            const day = daily.get(isoDay(event.createdAt));
            if (day) {
                day.views += 1;
                day.visitors.add(event.visitorId);
            }
            const device = deviceLabels[event.deviceType] ?? event.deviceType;
            devices.set(device, (devices.get(device) ?? 0) + 1);
            const source = event.utmSource ? `Campanha: ${event.utmSource}` : event.referrerHost || "Acesso direto";
            sources.set(source, (sources.get(source) ?? 0) + 1);
        }

        if (event.projectId && event.project) {
            const current = projects.get(event.projectId) ?? {
                name: event.project.translations[0]?.title ?? event.project.slug,
                views: 0,
                demos: 0,
                repositories: 0,
            };
            if (event.eventType === "PROJECT_VIEW") current.views += 1;
            if (event.eventType === "PROJECT_DETAIL_VIEW") current.views += 1;
            if (event.eventType === "PROJECT_DEMO_CLICK") current.demos += 1;
            if (event.eventType === "PROJECT_GITHUB_CLICK") current.repositories += 1;
            projects.set(event.projectId, current);
        }
    }

    const count = (eventType: string) => events.filter((event) => event.eventType === eventType).length;
    const pageViews = count("PAGE_VIEW");
    const clicks = events.filter((event) => interactionEvents.has(event.eventType)).length;

    return {
        period,
        pageViews,
        visitors: visitors.size,
        sessions: sessions.size,
        resumeDownloads: count("RESUME_DOWNLOAD"),
        clicks,
        engagementRate: sessions.size ? Math.round((engagedSessions.size / sessions.size) * 100) : 0,
        daily: Array.from(daily, ([day, values]) => ({
            date: shortDate(day),
            views: values.views,
            visitors: values.visitors.size,
        })),
        devices: Array.from(devices, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        sources: Array.from(sources, ([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6),
        projects: Array.from(projects.values()).sort((a, b) => b.views + b.demos + b.repositories - (a.views + a.demos + a.repositories)),
    };
}
