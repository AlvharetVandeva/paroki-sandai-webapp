import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Ambil user dari session saat ini (server-side only).
 * Mengembalikan null jika belum login.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Pastikan user sudah login, redirect ke /login jika belum.
 * Gunakan di Server Components dan Server Actions.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Cek apakah daftar permissions mengandung permission tertentu.
 * Format permission: "resource:action" — contoh: "schedules:create"
 */
export function hasPermission(
  permissions: string[],
  permission: string
): boolean {
  return permissions.includes(permission);
}

/**
 * Pastikan user memiliki permission tertentu.
 * Redirect ke /dashboard?error=forbidden jika tidak punya.
 */
export async function requirePermission(permission: string) {
  const user = await requireAuth();
  if (!hasPermission(user.permissions ?? [], permission)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}
