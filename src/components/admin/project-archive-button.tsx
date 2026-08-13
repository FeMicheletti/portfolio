"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";
import { archiveProjectAction } from "@/app/admin/(protected)/projetos/actions";

export function ProjectArchiveButton({ projectId, title }: { projectId: string; title: string; }) {
	const action = archiveProjectAction.bind(null, projectId);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon-sm" className="text-zinc-500 hover:bg-amber-500/10 hover:text-amber-300">
					<Archive />
					<span className="sr-only">Arquivar {title}</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
				<AlertDialogHeader>
						<AlertDialogTitle>Arquivar projeto?</AlertDialogTitle>
						<AlertDialogDescription className="text-zinc-400">
							“{title}” deixará de aparecer como publicado e não poderá permanecer em destaque. Você poderá reativá-lo pela edição.
						</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="border-white/10 bg-zinc-900 hover:bg-zinc-800 hover:text-white">
						Cancelar
					</AlertDialogCancel>
					<form action={action}>
						<AlertDialogAction type="submit" className="bg-amber-600 text-white hover:bg-amber-500">
							Arquivar
						</AlertDialogAction>
					</form>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}