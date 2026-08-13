"use client";

import { ArchiveRestore } from "lucide-react";
import { restoreProjectAction } from "@/app/admin/(protected)/projetos/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function ProjectRestoreButton({ projectId, title }: { projectId: string; title: string; }) {
	const action = restoreProjectAction.bind(null, projectId);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon-sm" className="text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-300">
					<ArchiveRestore />
					<span className="sr-only">Reativar {title}</span>
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
				<AlertDialogHeader>
					<AlertDialogTitle>Reativar projeto?</AlertDialogTitle>

					<AlertDialogDescription className="text-zinc-400">
						“{title}” voltará como rascunho. Você poderá revisá-lo e publicá-lo novamente pela edição.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel className="border-white/10 bg-zinc-900 hover:bg-zinc-800 hover:text-white">
						Cancelar
					</AlertDialogCancel>

					<form action={action}>
						<AlertDialogAction type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500">
							Reativar
						</AlertDialogAction>
					</form>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}