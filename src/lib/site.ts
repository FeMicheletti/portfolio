const fallbackSiteUrl = "https://felipemicheletti.com";

function resolveSiteUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    try {
        return new URL(configuredUrl || fallbackSiteUrl);
    } catch {
        return new URL(fallbackSiteUrl);
    }
}

export const site = {
    name: "Felipe Micheletti",
    url: resolveSiteUrl(),
    description: "Portfólio de Felipe Micheletti, desenvolvedor Full-Stack especializado em produtos web, APIs, mobile e cloud.",
} as const;

export function absoluteUrl(path = "/") {
    return new URL(path, site.url).toString();
}
