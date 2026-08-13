import { prisma } from "@/lib/prisma";
import { oneDriveContentUrl } from "@/lib/onedrive/client";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> },) {
	const { id } = await params;
	const url = new URL(request.url);

	const download = url.searchParams.get("download") === "1";
	const requestedFileName = url.searchParams.get("filename");

	const media = await prisma.mediaAsset.findUnique({
		where: { id },
		select: { drivePath: true, fileName: true, mimeType: true },
	});

	if (!media) return new Response("Mídia não encontrada.", { status: 404 });

	const contentUrl = oneDriveContentUrl(media.drivePath);
	if (!contentUrl) return new Response("A integração com o OneDrive não está configurada.", { status: 503 });

	const upstream = await fetch(contentUrl, { cache: "no-store" });
	if (!upstream.ok || !upstream.body) return new Response("Não foi possível carregar a mídia.", { status: upstream.status || 502 });

	const downloadFileName = requestedFileName || media.fileName;

	const headers = new Headers({
		"Content-Type": upstream.headers.get("content-type") || media.mimeType,
		"Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(downloadFileName)}`,
		"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
	});

	const contentLength = upstream.headers.get("content-length");
	if (contentLength) headers.set("Content-Length", contentLength);

	return new Response(upstream.body, { headers });
}