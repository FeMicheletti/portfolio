import { clsx, type ClassValue } from "clsx";
import { z } from "zod";
import { twMerge } from "tailwind-merge";

const publicExternalProtocols = new Set(["http:", "https:"]);

function hasAllowedPublicExternalProtocol(value: string) {
    try {
        return publicExternalProtocols.has(new URL(value).protocol);
    } catch {
        return false;
    }
}

export function publicExternalUrl(message = "Informe uma URL válida.", maximum?: number) {
    const schema = maximum ? z.string().trim().max(maximum) : z.string().trim();

    return schema.url(message).refine(hasAllowedPublicExternalProtocol, "Use uma URL iniciada por http:// ou https://.");
}

export function optionalPublicExternalUrl(message = "Informe uma URL válida.", maximum?: number) {
    return z.union([z.literal(""), publicExternalUrl(message, maximum)]);
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
