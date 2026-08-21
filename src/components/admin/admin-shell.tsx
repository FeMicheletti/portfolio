"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, Code2, Database, ExternalLink, Gauge, History, Image, Layers3, LogOut, Menu, Settings, X } from "lucide-react";
import { logoutAction } from "@/app/admin/(protected)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminShellProps = {
    admin: {
        name: string;
        email: string;
    };
    children: React.ReactNode;
};

const navigation = [
    { label: "Dashboard", href: "/admin", icon: Gauge, available: true },
    {
        label: "Projetos",
        href: "/admin/projetos",
        icon: BriefcaseBusiness,
        available: true,
    },
    {
        label: "Carreira",
        href: "/admin/carreira",
        icon: History,
        available: true,
    },
    { label: "Stacks", href: "/admin/stacks", icon: Layers3, available: true },
    { label: "Mídia", href: "/admin/midia", icon: Image, available: true },
    {
        label: "Métricas",
        href: "/admin/metricas",
        icon: BarChart3,
        available: true,
    },
    {
        label: "Configurações",
        href: "/admin/configuracoes",
        icon: Settings,
        available: true,
    },
] as const;

const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/projetos": "Projetos",
    "/admin/carreira": "Carreira",
    "/admin/stacks": "Stacks",
    "/admin/midia": "Mídia",
    "/admin/metricas": "Métricas",
    "/admin/configuracoes": "Configurações",
};

export function AdminShell({ admin, children }: AdminShellProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const pageTitle =
        pathname === "/admin/projetos/novo"
            ? "Novo projeto"
            : pathname.startsWith("/admin/projetos/")
              ? "Editar projeto"
              : (pageTitles[pathname] ?? "Administração");

    return (
        <div className="dark scheme-dark min-h-screen bg-zinc-950 text-zinc-100">
            {mobileMenuOpen ? (
                <button
                    type="button"
                    aria-label="Fechar menu"
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            ) : null}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-violet-500/15 bg-zinc-950/95 shadow-2xl shadow-violet-950/20 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
                    <Link href="/admin" className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-900/30">
                            <Code2 className="size-5" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold tracking-wide">Felipe Micheletti</span>
                            <span className="block text-xs text-zinc-500">Portfolio CMS</span>
                        </span>
                    </Link>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="size-5" />
                        <span className="sr-only">Fechar menu</span>
                    </Button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-[11px] font-medium tracking-[0.18em] text-zinc-600 uppercase">Gerenciamento</p>

                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

                        if (!item.available) {
                            return (
                                <div
                                    key={item.href}
                                    aria-disabled="true"
                                    className="flex h-10 cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm text-zinc-600"
                                >
                                    <Icon className="size-4" />
                                    <span className="flex-1">{item.label}</span>
                                    <span className="text-[10px] tracking-wide uppercase">Em breve</span>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                                    active ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                                )}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-white/5 p-3">
                    <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/2.5 p-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300 ring-1 ring-violet-500/20">
                            {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-200">{admin.name}</p>
                            <p className="truncate text-xs text-zinc-500">{admin.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Button asChild variant="ghost" className="justify-start text-zinc-400 hover:bg-white/5 hover:text-white">
                            <Link href="/" target="_blank">
                                <ExternalLink className="size-4" />
                                Ver portfólio
                            </Link>
                        </Button>

                        <form action={logoutAction}>
                            <Button type="submit" variant="ghost" size="icon" className="text-zinc-500 hover:bg-red-500/10 hover:text-red-400">
                                <LogOut className="size-4" />
                                <span className="sr-only">Sair</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </aside>

            <div className="min-h-screen lg:pl-72">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-zinc-950/80 px-4 backdrop-blur-xl sm:px-6">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="size-5" />
                            <span className="sr-only">Abrir menu</span>
                        </Button>
                        <div>
                            <p className="text-xs text-zinc-500">Área administrativa</p>
                            <h1 className="text-sm font-semibold sm:text-base">{pageTitle}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className="hidden border-violet-500/20 bg-violet-500/10 text-violet-300 sm:inline-flex">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            CMS online
                        </Badge>
                        <Database className="size-4 text-zinc-600" />
                    </div>
                </header>

                <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-violet-700/10 blur-3xl" />
                    <div className="relative mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
