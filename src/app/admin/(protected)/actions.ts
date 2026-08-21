"use server";

import { redirect } from "next/navigation";
import { deleteCurrentAdminSession } from "@/lib/auth/session";

export async function logoutAction() {
    await deleteCurrentAdminSession();
    redirect("/admin/login");
}
