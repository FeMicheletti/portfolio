export function safeDownloadFileName(requested: string | null, fallback: string) {
    const value = (requested || fallback).replace(/[\r\n]/g, "").trim();
    return value.slice(0, 255) || fallback;
}
