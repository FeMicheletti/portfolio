"use client";

import { Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function ProjectSubmitButton({ editing }: { editing: boolean }) {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" disabled={pending} className="bg-violet-600 text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500">
			{pending ? <Loader2 className="animate-spin" /> : <Save />}
			{pending ? "Salvando..." : editing ? "Salvar alterações" : "Criar projeto"}
		</Button>
	);
}