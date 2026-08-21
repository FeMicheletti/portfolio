import { type DeviceType } from "@prisma/client";
import { analyticsEventSchema, type AnalyticsEventInput } from "@/lib/analytics/schema";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_SIZE = 8_192;
const BOT_PATTERN = /bot|crawler|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp/i;

function detectDevice(userAgent: string): DeviceType {
    if (!userAgent) return "UNKNOWN";
    if (BOT_PATTERN.test(userAgent)) return "BOT";
    if (/ipad|tablet|kindle|silk|playbook/i.test(userAgent)) return "TABLET";
    if (/mobi|iphone|ipod|android/i.test(userAgent)) return "MOBILE";
    return "DESKTOP";
}

function locationFromHeaders(headers: Headers) {
    const rawCountry = headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country");
    const countryCode = rawCountry?.toUpperCase().match(/^[A-Z]{2}$/)?.[0];
    const rawCity = headers.get("x-vercel-ip-city");
    let city: string | undefined;

    if (rawCity) {
        try {
            city = decodeURIComponent(rawCity).slice(0, 120);
        } catch {
            city = rawCity.slice(0, 120);
        }
    }

    return { countryCode, city };
}

const VISITOR_COOKIE = "portfolio_analytics_visitor";
const SESSION_COOKIE = "portfolio_analytics_session";
const ID_PATTERN = /^[a-zA-Z0-9_-]{16,64}$/;

function readCookie(request: Request, name: string) {
    const header = request.headers.get("cookie");
    if (!header) return undefined;

    for (const part of header.split(";")) {
        const [cookieName, ...rest] = part.trim().split("=");
        if (cookieName === name) return decodeURIComponent(rest.join("="));
    }

    return undefined;
}

function ensureServerId(value?: string) {
    if (value && ID_PATTERN.test(value)) return value;
    return crypto.randomUUID().replaceAll("-", "");
}

function buildCookie(request: Request, name: string, value: string, maxAge: number) {
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

function referrerHostFromRequest(request: Request) {
    const referer = request.headers.get("referer");
    if (!referer) return undefined;

    try {
        const refererUrl = new URL(referer);
        const requestUrl = new URL(request.url);
        if (refererUrl.host === requestUrl.host) return undefined;
        return refererUrl.hostname.slice(0, 255);
    } catch {
        return undefined;
    }
}

async function isDuplicate(sessionId: string, input: AnalyticsEventInput) {
    const seconds = input.eventType === "PAGE_VIEW" ? 15 : input.eventType === "PROJECT_VIEW" ? 1_800 : 2;
    const since = new Date(Date.now() - seconds * 1_000);

    return Boolean(
        await prisma.analyticsEvent.findFirst({
            where: {
                sessionId,
                eventType: input.eventType,
                path: input.path,
                createdAt: { gte: since },
            },
            select: { id: true },
        }),
    );
}

export async function POST(request: Request) {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_SIZE) return new Response(null, { status: 413 });

    const userAgent = request.headers.get("user-agent") ?? "";
    const deviceType = detectDevice(userAgent);
    if (deviceType === "BOT") return new Response(null, { status: 204 });

    let text: string;
    try {
        text = await request.text();
    } catch {
        return Response.json({ error: "Não foi possível ler o evento." }, { status: 400 });
    }
    if (text.length > MAX_BODY_SIZE) return new Response(null, { status: 413 });

    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        return Response.json({ error: "JSON inválido." }, { status: 400 });
    }

    const parsed = analyticsEventSchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Evento inválido." }, { status: 400 });
    const input = parsed.data;

    const visitorId = ensureServerId(readCookie(request, VISITOR_COOKIE));
    const sessionId = ensureServerId(readCookie(request, SESSION_COOKIE));

    const recentEvents = await prisma.analyticsEvent.count({
        where: {
            sessionId,
            createdAt: { gte: new Date(Date.now() - 86_400_000) },
        },
    });

    if (recentEvents >= 200 || (await isDuplicate(sessionId, input))) return new Response(null, { status: 204 });

    const { countryCode, city } = locationFromHeaders(request.headers);
    await prisma.analyticsEvent.create({
        data: {
            eventType: input.eventType,
            visitorId,
            sessionId,
            path: input.path,
            locale: input.locale,
            targetUrl: input.targetUrl,
            referrerHost: referrerHostFromRequest(request),
            countryCode,
            city,
            deviceType,
        },
    });

    const response = new Response(null, { status: 204 });
    response.headers.append("Set-Cookie", buildCookie(request, VISITOR_COOKIE, visitorId, 31_536_000));
    response.headers.append("Set-Cookie", buildCookie(request, SESSION_COOKIE, sessionId, 1_800));
    return response;
}
