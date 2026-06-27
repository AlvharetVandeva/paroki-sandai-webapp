import { z } from "zod";

export const ServiceRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Nama role minimal 2 karakter")
    .max(50, "Nama role maksimal 50 karakter"),
  description: z.string().optional(),
});

export const ServiceRoleUpdateSchema = ServiceRoleSchema.partial();

export type ServiceRoleInput = z.infer<typeof ServiceRoleSchema>;
export type ServiceRoleUpdate = z.infer<typeof ServiceRoleUpdateSchema>;
