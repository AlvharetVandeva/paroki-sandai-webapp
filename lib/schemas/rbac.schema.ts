import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter"),
  description: z.string().optional(),
  permissions: z.array(z.number()).min(1, "Pilih minimal 1 permission"),
});

export const updateRoleSchema = createRoleSchema.extend({
  id: z.number(),
});

export const assignUserRoleSchema = z.object({
  userId: z.string(),
  roleIds: z.array(z.number()),
});

export const createPermissionSchema = z.object({
  action: z.string().min(2, "Action minimal 2 karakter"),
  resource: z.string().min(2, "Resource minimal 2 karakter"),
  description: z.string().optional(),
});

export const updatePermissionSchema = createPermissionSchema.extend({
  id: z.number(),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().optional().or(z.literal("")),
});
