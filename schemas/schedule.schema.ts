import { z } from "zod";

export const ScheduleAssignmentSchema = z.object({
  roleId: z.number().int().positive("Role harus dipilih"),
  personId: z.number().int().positive("Petugas harus dipilih").optional().nullable(),
});

const ScheduleBase = z.object({
  title: z
    .string()
    .min(3, "Judul kegiatan minimal 3 karakter")
    .max(200, "Judul kegiatan maksimal 200 karakter"),
  startAt: z.coerce.date({ message: "Tanggal mulai harus diisi" }),
  endAt: z.coerce.date({ message: "Tanggal selesai harus diisi" }),
  location: z.string().max(200).optional().default("Gereja Paroki"),
  description: z.string().optional(),
  assignments: z.array(ScheduleAssignmentSchema).optional().default([]),
});

export const ScheduleSchema = ScheduleBase.refine(
  (data) => data.endAt > data.startAt,
  { message: "Tanggal selesai harus setelah tanggal mulai", path: ["endAt"] },
);

export const ScheduleUpdateSchema = ScheduleBase.partial();

export type ScheduleInput = z.infer<typeof ScheduleSchema>;
export type ScheduleUpdate = z.infer<typeof ScheduleUpdateSchema>;
export type ScheduleAssignmentInput = z.infer<typeof ScheduleAssignmentSchema>;
