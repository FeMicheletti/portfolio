"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ImageIcon, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectMediaFormValue } from "@/lib/projects/project-form";

export type ProjectMediaOption = {
    id: string;
    fileName: string;
};

type ProjectMediaFieldsProps = {
    mediaAssets: ProjectMediaOption[];
    value: ProjectMediaFormValue[];
    errors?: string[];
    onChange: (value: ProjectMediaFormValue[]) => void;
};

function MediaPreview({ asset }: { asset: ProjectMediaOption }) {
    return (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-white/5 bg-zinc-950/70">
            <Image src={`/api/media/${asset.id}`} alt={asset.fileName} fill unoptimized className="object-cover" />
        </div>
    );
}

export function ProjectMediaFields({ mediaAssets, value, errors, onChange }: ProjectMediaFieldsProps) {
    const cover = value.find((item) => item.role === "COVER");
    const gallery = value.filter((item) => item.role === "GALLERY");
    const assetById = new Map(mediaAssets.map((asset) => [asset.id, asset]));

    function setCover(mediaId: string) {
        const withoutCover = value.filter((item) => item.role !== "COVER" && item.mediaId !== mediaId);

        if (!mediaId) {
            onChange(withoutCover);
            return;
        }

        const existing = value.find((item) => item.mediaId === mediaId);
        onChange([
            {
                mediaId,
                role: "COVER",
                altPt: existing?.altPt ?? "",
                altEn: existing?.altEn ?? "",
            },
            ...withoutCover,
        ]);
    }

    function toggleGallery(mediaId: string, checked: boolean) {
        if (!checked) {
            onChange(value.filter((item) => item.mediaId !== mediaId));
            return;
        }

        if (cover?.mediaId === mediaId || value.some((item) => item.mediaId === mediaId)) return;

        onChange([...value, { mediaId, role: "GALLERY", altPt: "", altEn: "" }]);
    }

    function updateItem(mediaId: string, field: "altPt" | "altEn", fieldValue: string) {
        onChange(value.map((item) => (item.mediaId === mediaId ? { ...item, [field]: fieldValue } : item)));
    }

    function moveGallery(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= gallery.length) return;

        const reordered = [...gallery];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        onChange(cover ? [cover, ...reordered] : reordered);
    }

    return (
        <Card className="w-full min-w-0 border-violet-500/10 bg-zinc-900/70 shadow-lg shadow-black/10 ring-0">
            <CardHeader className="border-b border-white/5">
                <div className="flex items-center gap-2 text-violet-300">
                    <Images className="size-4" />
                    <CardTitle>Mídias do projeto</CardTitle>
                </div>
                <CardDescription className="text-zinc-500">Escolha a capa, monte a galeria e descreva as imagens nos dois idiomas.</CardDescription>
            </CardHeader>

            <CardContent className="min-w-0 space-y-6">
                <input type="hidden" name="projectMedia" value={JSON.stringify(value)} />

                {mediaAssets.length ? (
                    <>
                        <div className="space-y-3">
                            <Label htmlFor="coverMediaId">Imagem de capa</Label>
                            <select
                                id="coverMediaId"
                                value={cover?.mediaId ?? ""}
                                onChange={(event) => setCover(event.target.value)}
                                className="h-9 w-full min-w-0 max-w-full rounded-md border border-white/10 bg-zinc-950/50 px-2.5 text-sm outline-none focus:border-violet-500/60 focus:ring-3 focus:ring-violet-500/20"
                            >
                                <option value="">Sem capa</option>
                                {mediaAssets.map((asset) => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.fileName}
                                    </option>
                                ))}
                            </select>

                            {cover && assetById.get(cover.mediaId) ? (
                                <div className="grid min-w-0 gap-4 rounded-xl border border-violet-500/10 bg-violet-500/2.5 p-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                                    <MediaPreview asset={assetById.get(cover.mediaId)!} />
                                    <div className="grid min-w-0 content-start gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cover-alt-pt">Texto alternativo (PT)</Label>
                                            <Input
                                                id="cover-alt-pt"
                                                value={cover.altPt}
                                                maxLength={255}
                                                onChange={(event) => updateItem(cover.mediaId, "altPt", event.target.value)}
                                                className="border-white/10 bg-zinc-950/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cover-alt-en">Alt text (EN)</Label>
                                            <Input
                                                id="cover-alt-en"
                                                value={cover.altEn}
                                                maxLength={255}
                                                onChange={(event) => updateItem(cover.mediaId, "altEn", event.target.value)}
                                                className="border-white/10 bg-zinc-950/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label>Galeria</Label>
                                <p className="mt-1 text-xs text-zinc-600">A capa não é repetida na galeria.</p>
                            </div>

                            <div className="grid min-w-0 gap-2 md:grid-cols-2">
                                {mediaAssets.map((asset) => {
                                    const selected = gallery.some((item) => item.mediaId === asset.id);
                                    const isCover = cover?.mediaId === asset.id;

                                    return (
                                        <label
                                            key={asset.id}
                                            className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-zinc-950/30 px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:border-violet-500/20 hover:bg-violet-500/5 has-disabled:cursor-not-allowed has-disabled:opacity-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                disabled={isCover}
                                                onChange={(event) => toggleGallery(asset.id, event.target.checked)}
                                                className="size-4 shrink-0 accent-violet-600"
                                            />
                                            <span className="min-w-0 flex-1 truncate">{asset.fileName}</span>
                                            {isCover ? <span className="text-[10px] text-violet-300 uppercase">Capa</span> : null}
                                        </label>
                                    );
                                })}
                            </div>

                            {gallery.length ? (
                                <div className="space-y-3">
                                    {gallery.map((item, index) => {
                                        const asset = assetById.get(item.mediaId);
                                        if (!asset) return null;

                                        return (
                                            <div
                                                key={item.mediaId}
                                                className="grid min-w-0 gap-3 rounded-xl border border-white/5 bg-white/2.5 p-3 md:grid-cols-[8rem_minmax(0,1fr)]"
                                            >
                                                <div className="space-y-2">
                                                    <MediaPreview asset={asset} />
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            disabled={index === 0}
                                                            onClick={() => moveGallery(index, -1)}
                                                            className="text-zinc-500 hover:text-violet-300"
                                                        >
                                                            <ArrowUp />
                                                            <span className="sr-only">Mover para cima</span>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            disabled={index === gallery.length - 1}
                                                            onClick={() => moveGallery(index, 1)}
                                                            className="text-zinc-500 hover:text-violet-300"
                                                        >
                                                            <ArrowDown />
                                                            <span className="sr-only">Mover para baixo</span>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => toggleGallery(item.mediaId, false)}
                                                            className="text-zinc-500 hover:text-red-300"
                                                        >
                                                            <X />
                                                            <span className="sr-only">Remover da galeria</span>
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid min-w-0 content-start gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor={`gallery-${item.mediaId}-alt-pt`}>Texto alternativo (PT)</Label>
                                                        <Input
                                                            id={`gallery-${item.mediaId}-alt-pt`}
                                                            value={item.altPt}
                                                            maxLength={255}
                                                            onChange={(event) => updateItem(item.mediaId, "altPt", event.target.value)}
                                                            className="border-white/10 bg-zinc-950/50"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor={`gallery-${item.mediaId}-alt-en`}>Alt text (EN)</Label>
                                                        <Input
                                                            id={`gallery-${item.mediaId}-alt-en`}
                                                            value={item.altEn}
                                                            maxLength={255}
                                                            onChange={(event) => updateItem(item.mediaId, "altEn", event.target.value)}
                                                            className="border-white/10 bg-zinc-950/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-zinc-600">
                                    Nenhuma imagem selecionada para a galeria.
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center rounded-xl border border-dashed border-violet-500/20 px-4 py-8 text-center">
                        <ImageIcon className="mb-3 size-8 text-violet-300/60" />
                        <p className="text-sm text-zinc-400">Nenhuma imagem disponível.</p>
                        <Button asChild type="button" variant="ghost" className="mt-2 text-violet-300">
                            <Link href="/admin/midia">Enviar imagens</Link>
                        </Button>
                    </div>
                )}

                {errors?.[0] ? <p className="text-xs text-red-400">{errors[0]}</p> : null}
            </CardContent>
        </Card>
    );
}
