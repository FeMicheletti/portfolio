"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deleteFromOneDrive, uploadToOneDrive } from "@/lib/onedrive/client";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "application/pdf"]);

export type MediaUploadState = {
    error?: string;
};

function safeFileName(fileName: string) {
    const normalized = fileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return normalized || "arquivo";
}

export async function uploadMediaAction(_state: MediaUploadState, formData: FormData): Promise<MediaUploadState> {
    await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { error: "Selecione um arquivo para enviar." };

    if (!ALLOWED_MIME_TYPES.has(file.type)) return { error: "Envie uma imagem JPG, PNG, WebP, GIF, AVIF ou um PDF." };

    if (file.size > MAX_FILE_SIZE) return { error: "O arquivo deve ter no máximo 20 MB." };

    const path = `portfolio/media/${randomUUID()}-${safeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    let uploadedPath: string | null = null;

    try {
        const uploaded = await uploadToOneDrive({ file, path });

        uploadedPath = path;

        await prisma.mediaAsset.create({
            data: {
                driveItemId: uploaded.id,
                drivePath: path,
                fileName: uploaded.name || file.name,
                mimeType: uploaded.file?.mimeType || file.type,
                kind: file.type === "application/pdf" ? "PDF" : "IMAGE",
                sizeBytes: uploaded.size || file.size,
                checksum: createHash("sha256").update(buffer).digest("hex"),
            },
        });
    } catch (error) {
        if (uploadedPath) await deleteFromOneDrive(uploadedPath).catch(() => undefined);
        return { error: error instanceof Error ? error.message : "Não foi possível enviar o arquivo." };
    }

    revalidatePath("/admin/midia");
    redirect("/admin/midia");
}

export async function deleteMediaAction(mediaId: string) {
    await requireAdmin();

    const media = await prisma.mediaAsset.findUnique({
        where: { id: mediaId },
        select: {
            drivePath: true,
            _count: {
                select: {
                    projectMedia: true,
                    resumes: true,
                    heroSettings: true,
                },
            },
        },
    });

    if (!media) return;

    const references = media._count.projectMedia + media._count.resumes + media._count.heroSettings;

    if (references > 0) return;

    await deleteFromOneDrive(media.drivePath);
    await prisma.mediaAsset.delete({ where: { id: mediaId } });

    revalidatePath("/admin/midia");
}
