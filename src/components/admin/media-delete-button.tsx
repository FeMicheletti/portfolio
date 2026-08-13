"use client";

import { Trash2 } from "lucide-react";
import { deleteMediaAction } from "@/app/admin/(protected)/midia/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function MediaDeleteButton({ mediaId, fileName}: { mediaId: string; fileName: string; }) {
	const action = deleteMediaAction.bind(null, mediaId);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon-sm" className="text-zinc-500 hover:bg-red-500/10 hover:text-red-300">
					<Trash2 />
					<span className="sr-only">Excluir {fileName}</span>
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir mídia permanentemente?</AlertDialogTitle>
					<AlertDialogDescription className="text-zinc-400">
						“{fileName}” será removido do OneDrive e do catálogo. Essa ação não poderá ser desfeita.
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