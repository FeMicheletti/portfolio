"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1),
});

export type LoginActionState = {
	error?: string;
};

export async function loginAction(_previousState: LoginActionState, formData: FormData): Promise<LoginActionState> {
	const parsed = loginSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!parsed.success) return { error: "Informe um e-mail e uma senha válidos." };

	const admin = await prisma.adminUser.findUnique({
		where: { email: parsed.data.email.toLowerCase() },
	});

	const passwordMatches = admin ? await bcrypt.compare(parsed.data.password, admin.passwordHash) : false;

	if (!admin || !admin.active || !passwordMatches) return { error: "E-mail ou senha inválidos." };

	await createAdminSession(admin.id);
	redirect("/admin");
}