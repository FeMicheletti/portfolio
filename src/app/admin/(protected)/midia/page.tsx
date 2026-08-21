import Image from "next/image";
import { FileText, HardDrive, ImageIcon, Sparkles } from "lucide-react";
import { MediaDeleteButton } from "@/components/admin/media-delete-button";
import { MediaUploadDialog } from "@/components/admin/media-upload-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type MediaAssetWithCount = Prisma.MediaAssetGetPayload<{
    include: {
        _count: {
            select: {
                projectMedia: true;
                resumes: true;
                heroSettings: true;
            };
        };
    };
}>;

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaPage() {
    const mediaAssets = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    projectMedia: true,
                    resumes: true,
                    heroSettings: true,
                },
            },
        },
    });

    const images = mediaAssets.filter((asset: MediaAssetWithCount) => asset.kind === "IMAGE").length;
    const documents = mediaAssets.length - images;

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
                        <Sparkles className="size-4" />
                        Biblioteca de mídia
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Arquivos do portfólio</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                        Envie imagens e documentos ao OneDrive e acompanhe onde cada arquivo está sendo utilizado.
                    </p>
                </div>

                <MediaUploadDialog />
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
                {[
                    { label: "Total", value: mediaAssets.length },
                    { label: "Imagens", value: images },
                    { label: "Documentos", value: documents },
                ].map((item) => (
                    <Card key={item.label} className="border-violet-500/10 bg-zinc-900/70 py-4 ring-0">
                        <CardContent>
                            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{item.label}</p>
                            <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {mediaAssets.length ? (
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {mediaAssets.map((asset: MediaAssetWithCount, index: number) => {
                        const references = asset._count.projectMedia + asset._count.resumes + asset._count.heroSettings;

                        return (
                            <Card key={asset.id} className="overflow-hidden border-violet-500/10 bg-zinc-900/70 py-0 ring-0">
                                <div className="relative flex aspect-video items-center justify-center overflow-hidden border-b border-white/5 bg-zinc-950/70">
                                    {asset.kind === "IMAGE" ? (
                                        <Image
                                            src={`/api/media/${asset.id}`}
                                            alt={asset.fileName}
                                            fill
                                            unoptimized
                                            loading={index < 3 ? "eager" : "lazy"}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <FileText className="size-12 text-violet-300/60" />
                                    )}
                                </div>

                                <CardContent className="space-y-4 py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-zinc-200" title={asset.fileName}>
                                                {asset.fileName}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-600">
                                                {formatBytes(asset.sizeBytes)} · {asset.mimeType}
                                            </p>
                                        </div>

                                        {references === 0 ? (
                                            <MediaDeleteButton mediaId={asset.id} fileName={asset.fileName} />
                                        ) : (
                                            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Em uso</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span className="flex items-center gap-1.5">
                                            {asset.kind === "IMAGE" ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
                                            {asset.kind === "IMAGE" ? "Imagem" : "PDF"}
                                        </span>
                                        <span>
                                            {references} vínculo{references === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </section>
            ) : (
                <Card className="border-dashed border-violet-500/20 bg-violet-500/2.5 py-14 text-center ring-0">
                    <CardContent className="flex flex-col items-center">
                        <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                            <HardDrive />
                        </span>
                        <h3 className="font-medium text-zinc-100">Nenhuma mídia enviada</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">Envie a primeira imagem ou documento para começar sua biblioteca.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
