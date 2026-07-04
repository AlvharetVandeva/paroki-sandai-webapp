import { getScheduleById } from "@/services/schedule.service";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const schedule = await getScheduleById(parseInt(params.id, 10));
  return {
    title: schedule ? `${schedule.title} | Paroki Sandai` : "Jadwal Tidak Ditemukan",
  };
}

export default async function ScheduleDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "schedules", "read")) {
    redirect("/dashboard");
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return notFound();

  const schedule = await getScheduleById(id);
  if (!schedule) return notFound();

  const startDate = new Date(schedule.startAt);
  const endDate = new Date(schedule.endAt);
  
  const canEdit = hasPermission(session.user.permissions || [], "schedules", "update");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/schedules" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{schedule.title}</h1>
        </div>
        {canEdit && (
          <Link href={`/dashboard/schedules/${schedule.id}/edit`} className={buttonVariants()}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Jadwal
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                    <p className="font-medium">
                      {startDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Waktu</p>
                    <p className="font-medium">
                      {startDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - 
                      {endDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:col-span-2 mt-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lokasi</p>
                    <p className="font-medium">{schedule.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deskripsi / Keterangan Tambahan</CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.description ? (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-primary" 
                  dangerouslySetInnerHTML={{ __html: schedule.description }} 
                />
              ) : (
                <p className="text-muted-foreground italic">Tidak ada deskripsi yang ditambahkan.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Petugas Pelayanan</CardTitle>
              <CardDescription>Daftar petugas yang ditugaskan</CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.assignments.length > 0 ? (
                <div className="space-y-4">
                  {schedule.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex flex-col gap-1 border-b pb-3 last:border-0">
                      <Badge variant="outline" className="w-fit">{assignment.role.name}</Badge>
                      <p className="font-medium text-sm mt-1">
                        {assignment.person ? assignment.person.fullName : <span className="text-muted-foreground italic">Belum Ditentukan</span>}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                  <p className="text-sm">Belum ada petugas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
