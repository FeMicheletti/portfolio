import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { DeviceType } from "@prisma/client";
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
const ANALYTICS_WINDOW_MS = 86_400_000;
const MAX_EVENTS_PER_BUCKET = 200;
const MAX_NEW_SESSIONS_PER_BUCKET = 20;

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

function analyticsSecret() {
    return process.env.ANALYTICS_COOKIE_SECRET;
}

function signAnalyticsId(value: string) {
    const secret = analyticsSecret();
    if (!secret) return undefined;
    return createHmac("sha256", secret).update(value).digest("base64url");
}

function readSignedCookie(request: Request, name: string) {
    const raw = readCookie(request, name);
    if (!raw) return undefined;

    const [value, signature, ...rest] = raw.split(".");
    if (!value || !signature || rest.length > 0 || !ID_PATTERN.test(value)) return undefined;

    const expected = signAnalyticsId(value);
    if (!expected || signature.length !== expected.length) return undefined;

    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? value : undefined;
}

function buildCookie(request: Request, name: string, value: string, maxAge: number) {
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    const signature = signAnalyticsId(value);
    if (!signature) return undefined;
    const signedValue = `${value}.${signature}`;
    return `${name}=${encodeURIComponent(signedValue)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

function clientAddress(request: Request) {
    const candidates = [
        request.headers.get("cf-connecting-ip"),
        request.headers.get("x-forwarded-for"),
        request.headers.get("x-real-ip"),
        request.headers.get("x-vercel-forwarded-for"),
    ];

    for (const candidate of candidates) {
        if (!candidate) continue;
        const address = candidate.split(",")[0]?.trim().slice(0, 120);
        if (address) return address;
    }

    return "unknown";
}

function analyticsBucketKey(request: Request, userAgent: string, namespace: string) {
    const basis = `${clientAddress(request)}:${userAgent.slice(0, 255) || "unknown"}`;
    return createHash("sha256").update(`${namespace}:${analyticsSecret()}:${basis}`).digest("hex");
}

async function consumeAnalyticsLimit(key: string, maxAttempts: number, windowMs: number) {
    const now = new Date();
    const record = await prisma.loginRateLimit.findUnique({ where: { key } });

    if (record?.blockedUntil && record.blockedUntil > now) return false;

    const expired = !record || now.getTime() - record.windowStart.getTime() > windowMs;
    const attempts = expired ? 1 : record.attempts + 1;
    const blockedUntil = attempts > maxAttempts ? new Date(now.getTime() + windowMs) : null;

    await prisma.loginRateLimit.upsert({
        where: { key },
        create: {
            key,
            attempts,
            windowStart: now,
            blockedUntil,
        },
        update: {
            attempts,
            windowStart: expired ? now : record!.windowStart,
            blockedUntil,
        },
    });

    return attempts <= maxAttempts;
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

    const trustedVisitorId = readSignedCookie(request, VISITOR_COOKIE);
    const trustedSessionId = readSignedCookie(request, SESSION_COOKIE);
    const sessionBucketKey = analyticsBucketKey(request, userAgent, "analytics-session");
    const eventBucketKey = analyticsBucketKey(request, userAgent, "analytics-event");

    if ((!trustedVisitorId || !trustedSessionId) && !(await consumeAnalyticsLimit(sessionBucketKey, MAX_NEW_SESSIONS_PER_BUCKET, ANALYTICS_WINDOW_MS))) {
        return new Response(null, { status: 204 });
    }

    if (!(await consumeAnalyticsLimit(eventBucketKey, MAX_EVENTS_PER_BUCKET, ANALYTICS_WINDOW_MS))) {
        return new Response(null, { status: 204 });
    }

    const visitorId = ensureServerId(trustedVisitorId);
    const sessionId = ensureServerId(trustedSessionId);

    const recentEvents = await prisma.analyticsEvent.count({
        where: {
            sessionId,
            createdAt: { gte: new Date(Date.now() - ANALYTICS_WINDOW_MS) },
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
    const visitorCookie = buildCookie(request, VISITOR_COOKIE, visitorId, 31_536_000);
    const sessionCookie = buildCookie(request, SESSION_COOKIE, sessionId, 1_800);

    if (visitorCookie) response.headers.append("Set-Cookie", visitorCookie);
    if (sessionCookie) response.headers.append("Set-Cookie", sessionCookie);

    return response;
}
