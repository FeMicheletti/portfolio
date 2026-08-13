"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MediaUploadSubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" disabled={pending} className="bg-violet-600 text-white hover:bg-violet-500">
			{pending ? <Loader2 className="animate-spin" /> : <Upload />}
			{pending ? "Enviando..." : "Enviar arquivo"}
		</Button>
	);
}