import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdmin } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
	title: "Admin | Felipe Micheletti",
	robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
	const admin = await getCurrentAdmin();

	if (admin) redirect("/admin");

	return (
		<main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-50">
			<Card className="w-full max-w-md border-white/10 bg-zinc-900 text-zinc-50">
				<CardHeader>
					<CardTitle className="text-2xl">Área administrativa</CardTitle>
					<CardDescription className="text-zinc-400">
						Entre para gerenciar o portfólio e acompanhar as métricas.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</main>
	);
}