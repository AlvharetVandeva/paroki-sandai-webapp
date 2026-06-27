"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ScheduleSchema, type ScheduleInput } from "@/schemas/schedule.schema";

export async function createSchedule(data: ScheduleInput) {
  const result = ScheduleSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues.map((e) => e.message).join(", ") };
  }

  const parsed = result.data;

  await prisma.schedule.create({
    data: {
      title: parsed.title,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      location: parsed.location ?? "Gereja Paroki",
      description: parsed.description,
      assignments: parsed.assignments && parsed.assignments.length > 0
        ? { create: parsed.assignments.map((a) => ({ roleId: a.roleId, personId: a.personId ?? undefined })) }
        : undefined,
    },
  });

  revalidatePath("/dashboard/schedules");
  return { success: true, error: null };
}

export async function updateSchedule(
  id: number,
  data: {
    title?: string;
    startAt?: Date;
    endAt?: Date;
    location?: string;
    description?: string;
  },
) {
  await prisma.schedule.update({ where: { id }, data });
  revalidatePath("/dashboard/schedules");
}

export async function deleteSchedule(id: number) {
  await prisma.schedule.delete({ where: { id } });
  revalidatePath("/dashboard/schedules");
}
