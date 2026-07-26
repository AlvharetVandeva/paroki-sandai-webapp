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
      latitude: parsed.latitude ?? null,
      longitude: parsed.longitude ?? null,
      address: parsed.address ?? null,
      assignments: parsed.assignments && parsed.assignments.length > 0
        ? { create: parsed.assignments.map((a) => ({ roleId: a.roleId, personId: a.personId ?? undefined })) }
        : undefined,
    },
  });

  revalidatePath("/dashboard/schedules");
  revalidatePath("/jadwal");
  revalidatePath("/", "layout");
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
    assignments?: { roleId: number; personId?: number | null }[];
  },
) {
  if (data.assignments) {
    await prisma.scheduleAssignment.deleteMany({ where: { scheduleId: id } });
    if (data.assignments.length > 0) {
      await prisma.scheduleAssignment.createMany({
        data: data.assignments.map((a) => ({
          scheduleId: id,
          roleId: a.roleId,
          personId: a.personId ?? undefined,
        })),
      });
    }
  }

  const { assignments: _, ...updateData } = data;
  await prisma.schedule.update({ where: { id }, data: updateData });
  revalidatePath("/dashboard/schedules");
  revalidatePath("/jadwal");
  revalidatePath("/", "layout");
  return { success: true, error: null };
}

export async function deleteSchedule(id: number) {
  await prisma.schedule.delete({ where: { id } });
  revalidatePath("/dashboard/schedules");
  revalidatePath("/jadwal");
  revalidatePath("/", "layout");
}
