"use client";

import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteExperienceAction } from "@/app/admin/(protected)/carreira/actions";

export function ExperienceDeleteButton({ experienceId, title }: {experienceId: string;title: string; }) {
	const action = deleteExperienceAction.bind(null, experienceId);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon-sm" className="text-zinc-500 hover:bg-red-500/10 hover:text-red-300">
					<Trash2 />
					<span className="sr-only">Excluir {title}</span>
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir experiência permanentemente?</AlertDialogTitle>

					<AlertDialogDescription className="text-zinc-400">
						“{title}” e todos os seus conteúdos vinculados serão excluídos. Essa ação não poderá ser desfeita.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel className="border-white/10 bg-zinc-900 hover:bg-zinc-800 hover:text-white">
						Cancelar
					</AlertDialogCancel>

					<form action={action}>
						<AlertDialogAction type="submit" className="bg-red-600 text-white hover:bg-red-500">
							Excluir permanentemente
						</AlertDialogAction>
					</form>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}