import { getAllSchedules } from "@/services/schedule.service";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Eye } from "lucide-react";
import Link from "next/link";
import { DeleteScheduleButton } from "./delete-schedule-button";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Jadwal Pelayanan | Paroki Sandai",
};

export default async function SchedulesPage() {
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "schedules", "read")) {
    redirect("/dashboard");
  }

  const schedules = await getAllSchedules();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jadwal Pelayanan</h1>
          <p className="text-muted-foreground">Kelola jadwal misa dan kegiatan pelayanan.</p>
        </div>
        
        {hasPermission(session.user.permissions || [], "schedules", "create") && (
          <Link href="/dashboard/schedules/create" className={buttonVariants({ className: "flex items-center" })}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kegiatan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                  Belum ada jadwal yang ditambahkan.
                </TableCell>
              </TableRow>
            )}
            {schedules.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>
                  {new Date(s.startAt).toLocaleDateString("id-ID", { 
                    weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" 
                  })}
                </TableCell>
                <TableCell>{s.location}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/dashboard/schedules/${s.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Lihat Detail">
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    {hasPermission(session.user.permissions || [], "schedules", "update") && (
                      <Link href={`/dashboard/schedules/${s.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Edit Jadwal">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    )}
                    
                    {hasPermission(session.user.permissions || [], "schedules", "delete") && (
                      <DeleteScheduleButton id={s.id} title={s.title} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
