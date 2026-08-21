"use client";

import { Layers3, PackagePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryForm, TechnologyForm } from "@/components/admin/stack-forms";

type CategoryOption = { id: string; namePt: string };

export function StackCreateButtons({ categoryOptions }: { categoryOptions: CategoryOption[] }) {
    const hasCategories = categoryOptions.length > 0;

    return (
        <section className="flex flex-col gap-3 sm:flex-row justify-end">
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="bg-violet-600 text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500">
                        <Plus />
                        Nova categoria
                    </Button>
                </DialogTrigger>

                <DialogContent className="border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layers3 className="size-4 text-violet-300" />
                            Nova categoria
                        </DialogTitle>

                        <DialogDescription className="text-zinc-500">Agrupe as tecnologias por área de atuação.</DialogDescription>
                    </DialogHeader>

                    <div className="pt-2">
                        <CategoryForm />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={!hasCategories}
                        className="border-violet-500/20 bg-violet-500/5 text-violet-200 hover:bg-violet-500/10 hover:text-violet-100"
                    >
                        <PackagePlus />
                        Nova tecnologia
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackagePlus className="size-4 text-violet-300" />
                            Nova tecnologia
                        </DialogTitle>

                        <DialogDescription className="text-zinc-500">Cadastre uma stack dentro de uma categoria existente.</DialogDescription>
                    </DialogHeader>

                    <div className="pt-2">
                        <TechnologyForm categories={categoryOptions} />
                    </div>
                </DialogContent>
            </Dialog>

            {!hasCategories ? <p className="self-center text-xs text-zinc-500">Crie uma categoria antes de cadastrar tecnologias.</p> : null}
        </section>
    );
}
