import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "portfolio_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

function hashSessionToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(userId: string) {
    await prisma.adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.adminSession.create({
        data: {
            tokenHash: hashSessionToken(token),
            userId,
            expiresAt,
        },
    });

    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
    });
}

export const getCurrentAdmin = cache(async () => {
    const cookieStore = await cookies();

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.adminSession.findUnique({
        where: { tokenHash: hashSessionToken(token) },
        include: { user: true },
    });

    if (!session || session.expiresAt <= new Date() || !session.user.active) return null;

    return { id: session.user.id, name: session.user.name, email: session.user.email };
});

export async function requireAdmin() {
    const admin = await getCurrentAdmin();
    if (!admin) redirect("/admin/login");

    return admin;
}

export async function deleteCurrentAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
        await prisma.adminSession.deleteMany({
            where: { tokenHash: hashSessionToken(token) },
        });
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
}
