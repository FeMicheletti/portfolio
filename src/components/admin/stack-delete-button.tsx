"use client";

import { Trash2 } from "lucide-react";
import { deleteCategoryAction, deleteTechnologyAction } from "@/app/admin/(protected)/stacks/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function StackDeleteButton({ id, name, type, blocked }: { id: string; name: string; type: "category" | "technology"; blocked: boolean }) {
    const action = type === "category" ? deleteCategoryAction.bind(null, id) : deleteTechnologyAction.bind(null, id);
    const dependency = type === "category" ? "tecnologias" : "projetos";

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={blocked}
                    title={blocked ? `Remova os vínculos com ${dependency} antes de excluir.` : undefined}
                    className="text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
                >
                    <Trash2 />
                    <span className="sr-only">Excluir {name}</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                        “{name}” será excluído definitivamente. Essa ação não poderá ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/10 bg-zinc-900 hover:bg-zinc-800 hover:text-white">Cancelar</AlertDialogCancel>
                    <form action={action}>
                        <AlertDialogAction type="submit" className="bg-red-600 text-white hover:bg-red-500">
                            Excluir
                        </AlertDialogAction>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
