import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return new Response(null, { status: 401 });
  const configuredDays = Number(process.env.ANALYTICS_RETENTION_DAYS ?? 180);
  const retentionDays =
    Number.isInteger(configuredDays) && configuredDays >= 30
      ? configuredDays
      : 180;
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000);
  const [events, sessions, loginLimits] = await prisma.$transaction([
    prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.adminSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    }),
    prisma.loginRateLimit.deleteMany({
      where: { updatedAt: { lt: new Date(Date.now() - 86_400_000) } },
    }),
  ]);
  return Response.json({
    deleted: {
      analyticsEvents: events.count,
      sessions: sessions.count,
      loginLimits: loginLimits.count,
    },
    retentionDays,
  });
}
