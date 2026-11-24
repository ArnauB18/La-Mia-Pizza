"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endAdminSession, isAdmin, startAdminSession } from "@/lib/admin-auth";
import { checkLoginAllowed, clientIp, recordLoginFailure, recordLoginSuccess } from "@/lib/login-guard";
import { updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";

export async function login(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  // Retard fix en tots els casos: fa més lent qualsevol intent automàtic
  await new Promise((r) => setTimeout(r, 600));
  const ip = await clientIp();

  // Primer el bloqueig: si està bloquejat, ni tan sols es comprova la contrasenya
  const guard = await checkLoginAllowed(ip);
  if (!guard.allowed) {
    return { error: `Massa intents fallits. Torna-ho a provar d'aquí a ${guard.retryAfterMinutes} minut${guard.retryAfterMinutes === 1 ? "" : "s"}.` };
  }

  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!checkPassword(password)) {
    await recordLoginFailure(ip);
    return { error: "Contrasenya incorrecta." };
  }
  await recordLoginSuccess(ip);
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
