"use client";

import { useActionState } from "react";
import { AlertCircle, ImagePlus, Upload } from "lucide-react";
import { uploadMediaAction } from "@/app/admin/(protected)/midia/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUploadSubmitButton } from "./media-upload-submit-button";

export function MediaUploadDialog() {
    const [state, action] = useActionState(uploadMediaAction, {});

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-violet-600 text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500">
                    <ImagePlus />
                    Nova mídia
                </Button>
            </DialogTrigger>

            <DialogContent className="border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="size-4 text-violet-300" />
                        Enviar mídia
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        O arquivo será armazenado no OneDrive e ficará disponível para uso no portfólio.
                    </DialogDescription>
                </DialogHeader>

                <form action={action} className="space-y-5 pt-2">
                    {state.error ? (
                        <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            {state.error}
                        </div>
                    ) : null}

                    <div className="space-y-2">
                        <Label htmlFor="media-file">Arquivo</Label>
                        <Input
                            id="media-file"
                            name="file"
                            type="file"
                            required
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf"
                            className="border-white/10 bg-zinc-900 file:mr-3 file:text-zinc-300"
                        />
                        <p className="text-xs leading-5 text-zinc-600">JPG, PNG, WebP, GIF, AVIF ou PDF de até 20 MB.</p>
                    </div>

                    <div className="flex justify-end">
                        <MediaUploadSubmitButton />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
