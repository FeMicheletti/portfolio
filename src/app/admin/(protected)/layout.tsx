import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
    robots: { index: false, follow: false, noarchive: true },
};

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const admin = await requireAdmin();
    return <AdminShell admin={admin}>{children}</AdminShell>;
}
