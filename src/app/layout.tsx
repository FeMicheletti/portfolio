import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: site.url,
	applicationName: site.name,
	title: {
		default: "Felipe Micheletti",
		template: "%s | Felipe Micheletti",
	},
	description: site.description,
	keywords: [
		"Felipe Micheletti",
		"Full-Stack Developer",
		"Software Engineer",
		"Next.js",
		"Node.js",
		"React",
		"Java",
	],
	authors: [{ name: "Felipe Micheletti" }],
	creator: "Felipe Micheletti",
	publisher: "Felipe Micheletti",
	category: "technology",
	alternates: {
		canonical: "/",
		languages: {
			"pt-BR": "/",
			"en-US": "/?lang=en",
			"x-default": "/",
		},
	},
	openGraph: {
		type: "website",
		url: "/",
		title: "Felipe Micheletti | Full-Stack Developer",
		description: site.description,
		siteName: site.name,
		locale: "pt_BR",
		alternateLocale: ["en_US"],
		images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Felipe Micheletti — Full-Stack Developer" }],
	},
	twitter: {
		card: "summary_large_image",
		title: "Felipe Micheletti — Full-Stack Developer",
		description: site.description,
		images: ["/twitter-image"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="pt-BR" className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
			<body className="min-h-full flex flex-col bg-black">{children}</body>
		</html>
	);
}
