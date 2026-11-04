"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endAdminSession, isAdmin, startAdminSession } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";

export async function login(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  // Petit retard fix: fa més lent provar contrasenyes a la força
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(String(formData.get("password") ?? ""))) return { error: "Contrasenya incorrecta." };
  await startAdminSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

export async function changeStatus(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!Number.isInteger(id) || !ORDER_STATUSES.includes(status)) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin");
}
