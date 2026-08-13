import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function loginRateLimitKey(email: string, address: string) {
  const secret =
    process.env.LOGIN_RATE_LIMIT_SECRET || "portfolio-login-rate-limit";
  return createHash("sha256")
    .update(`${secret}:${email.toLowerCase()}:${address}`)
    .digest("hex");
}

export async function checkLoginRateLimit(key: string) {
  const record = await prisma.loginRateLimit.findUnique({ where: { key } });
  return Boolean(record?.blockedUntil && record.blockedUntil > new Date());
}

export async function registerFailedLogin(key: string) {
  const now = new Date();
  const record = await prisma.loginRateLimit.findUnique({ where: { key } });
  const expired =
    !record || now.getTime() - record.windowStart.getTime() > WINDOW_MS;
  const attempts = expired ? 1 : record.attempts + 1;
  await prisma.loginRateLimit.upsert({
    where: { key },
    create: {
      key,
      attempts,
      windowStart: now,
      blockedUntil:
        attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + WINDOW_MS) : null,
    },
    update: {
      attempts,
      windowStart: expired ? now : record!.windowStart,
      blockedUntil:
        attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + WINDOW_MS) : null,
    },
  });
}

export async function clearLoginRateLimit(key: string) {
  await prisma.loginRateLimit.deleteMany({ where: { key } });
}
