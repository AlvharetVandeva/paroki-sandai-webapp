import { z } from "zod";

export const SiteSettingSchema = z.object({
  key: z.string().min(1, "Key harus diisi").max(100),
  value: z.string().max(5000, "Nilai maksimal 5000 karakter"),
});

export const SiteSettingUpdateSchema = z.object({
  value: z.string().max(5000, "Nilai maksimal 5000 karakter"),
});

export const SiteSettingsBulkSchema = z.record(
  z.string().min(1).max(100),
  z.string().max(5000),
);

export type SiteSettingInput = z.infer<typeof SiteSettingSchema>;
export type SiteSettingUpdate = z.infer<typeof SiteSettingUpdateSchema>;
