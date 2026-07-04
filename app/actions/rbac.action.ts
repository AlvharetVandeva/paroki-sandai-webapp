"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createRoleSchema, updateRoleSchema, assignUserRoleSchema, createPermissionSchema, updatePermissionSchema, createUserSchema, updateUserSchema } from "@/lib/schemas/rbac.schema";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

import { hasPermission } from "@/lib/rbac";

async function requirePermission(resource: string, action: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const userPermissions = session.user?.permissions || [];
  if (!hasPermission(userPermissions, resource, action)) {
    throw new Error(`Forbidden: Membutuhkan permission '${action} ${resource}'`);
  }
}

export async function createRole(formData: FormData) {
  await requirePermission("rbac", "create");
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const permissionsData = formData.getAll("permissions").map(p => parseInt(p as string));

  const parsed = createRoleSchema.safeParse({ name, description, permissions: permissionsData });
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  try {
    const { name, description, permissions } = parsed.data;
    
    await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions.map(permissionId => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      }
    });

    revalidatePath("/dashboard/rbac/roles");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan saat membuat role" };
  }
}

export async function updateRole(id: number, formData: FormData) {
  await requirePermission("rbac", "update");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const permissionsData = formData.getAll("permissions").map(p => parseInt(p as string));

  const parsed = updateRoleSchema.safeParse({ id, name, description, permissions: permissionsData });
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  try {
    const { name, description, permissions } = parsed.data;

    // Transaction to update role and recreate permissions
    await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: { name, description }
      });

      await tx.rolePermission.deleteMany({
        where: { roleId: id }
      });

      await tx.rolePermission.createMany({
        data: permissions.map(permissionId => ({
          roleId: id,
          permissionId,
        }))
      });
    });

    revalidatePath("/dashboard/rbac/roles");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan saat mengupdate role" };
  }
}

export async function deleteRole(id: number) {
  await requirePermission("rbac", "delete");

  try {
    await prisma.role.delete({
      where: { id }
    });
    revalidatePath("/dashboard/rbac/roles");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus role" };
  }
}

export async function assignUserRoles(formData: FormData) {
  await requirePermission("users", "update");
  
  const userId = formData.get("userId") as string;
  const roleIds = formData.getAll("roles").map(r => parseInt(r as string));

  const parsed = assignUserRoleSchema.safeParse({ userId, roleIds });
  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Clear existing roles
      await tx.userRole.deleteMany({
        where: { userId }
      });

      // Add new roles
      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map(roleId => ({
            userId,
            roleId,
          }))
        });
      }
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate role user" };
  }
}

export async function createPermission(formData: FormData) {
  await requirePermission("rbac", "create");
  
  const action = formData.get("action") as string;
  const resource = formData.get("resource") as string;
  const description = formData.get("description") as string;

  const parsed = createPermissionSchema.safeParse({ action, resource, description });
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  try {
    const { action, resource, description } = parsed.data;
    
    // Check for unique combination of action and resource
    const existing = await prisma.permission.findUnique({
      where: { action_resource: { action, resource } }
    });
    
    if (existing) {
      return { error: "Permission untuk action dan resource ini sudah ada" };
    }

    await prisma.permission.create({
      data: { action, resource, description }
    });

    revalidatePath("/dashboard/rbac/permissions");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan saat membuat permission" };
  }
}

export async function updatePermission(id: number, formData: FormData) {
  await requirePermission("rbac", "update");

  const action = formData.get("action") as string;
  const resource = formData.get("resource") as string;
  const description = formData.get("description") as string;

  const parsed = updatePermissionSchema.safeParse({ id, action, resource, description });
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  try {
    const { action, resource, description } = parsed.data;

    // Check for unique conflict
    const existing = await prisma.permission.findUnique({
      where: { action_resource: { action, resource } }
    });
    
    if (existing && existing.id !== id) {
      return { error: "Permission untuk action dan resource ini sudah ada" };
    }

    await prisma.permission.update({
      where: { id },
      data: { action, resource, description }
    });

    revalidatePath("/dashboard/rbac/permissions");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan saat mengupdate permission" };
  }
}

export async function deletePermission(id: number) {
  await requirePermission("rbac", "delete");

  try {
    await prisma.permission.delete({
      where: { id }
    });
    revalidatePath("/dashboard/rbac/permissions");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus permission (pastikan tidak ada role yang menggunakannya)" };
  }
}

export async function createUser(formData: FormData) {
  await requirePermission("users", "create");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = createUserSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  try {
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan saat membuat user" };
  }
}

export async function updateUser(id: string, formData: FormData) {
  await requirePermission("users", "update");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = updateUserSchema.safeParse({ id, name, email, password });
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  try {
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return { error: "Email sudah terdaftar oleh user lain" };
    }

    const updateData: any = { name, email };
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan saat mengupdate user" };
  }
}

export async function deleteUser(id: string) {
  await requirePermission("users", "delete");

  try {
    await prisma.user.delete({
      where: { id }
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus user" };
  }
}
