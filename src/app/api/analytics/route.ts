import { type DeviceType } from "@prisma/client";
import {
  analyticsEventSchema,
  type AnalyticsEventInput,
} from "@/lib/analytics/schema";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_SIZE = 8_192;
const BOT_PATTERN =
  /bot|crawler|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp/i;

function detectDevice(userAgent: string): DeviceType {
  if (!userAgent) return "UNKNOWN";
  if (BOT_PATTERN.test(userAgent)) return "BOT";
  if (/ipad|tablet|kindle|silk|playbook/i.test(userAgent)) return "TABLET";
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return "MOBILE";
  return "DESKTOP";
}

function locationFromHeaders(headers: Headers) {
  const rawCountry =
    headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country");
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

async function isDuplicate(input: AnalyticsEventInput) {
  const seconds =
    input.eventType === "PAGE_VIEW"
      ? 15
      : input.eventType === "PROJECT_VIEW"
        ? 1_800
        : 2;
  const since = new Date(Date.now() - seconds * 1_000);

  return Boolean(
    await prisma.analyticsEvent.findFirst({
      where: {
        sessionId: input.sessionId,
        eventType: input.eventType,
        path: input.path,
        projectId: input.projectId ?? null,
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
    return Response.json(
      { error: "Não foi possível ler o evento." },
      { status: 400 },
    );
  }
  if (text.length > MAX_BODY_SIZE) return new Response(null, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = analyticsEventSchema.safeParse(json);
  if (!parsed.success)
    return Response.json({ error: "Evento inválido." }, { status: 400 });
  const input = parsed.data;

  const recentEvents = await prisma.analyticsEvent.count({
    where: {
      sessionId: input.sessionId,
      createdAt: { gte: new Date(Date.now() - 86_400_000) },
    },
  });
  if (recentEvents >= 200 || (await isDuplicate(input)))
    return new Response(null, { status: 204 });

  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!project)
      return Response.json({ error: "Projeto inválido." }, { status: 400 });
  }

  const { countryCode, city } = locationFromHeaders(request.headers);
  await prisma.analyticsEvent.create({
    data: {
      eventType: input.eventType,
      visitorId: input.visitorId,
      sessionId: input.sessionId,
      path: input.path,
      locale: input.locale,
      projectId: input.projectId,
      targetUrl: input.targetUrl,
      referrerHost: input.referrerHost,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      countryCode,
      city,
      deviceType,
    },
  });

  return new Response(null, { status: 204 });
}
