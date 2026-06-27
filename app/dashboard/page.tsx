import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getScheduleCountThisMonth, getUpcomingSchedules } from "@/services/schedule.service";
import { getUpcomingEvents } from "@/services/event.service";
import { getAllPersons } from "@/services/person.service";
import { getAllRoles } from "@/services/service-role.service";
import {
  CalendarDays,
  Users,
  Tags,
  PartyPopper,
  Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const [scheduleCount, persons, roles, upcomingSchedules, upcomingEvents] =
    await Promise.all([
      getScheduleCountThisMonth(),
      getAllPersons(),
      getAllRoles(),
      getUpcomingSchedules(5),
      getUpcomingEvents(5),
    ]);

  const summaryCards = [
    {
      title: "Jadwal Bulan Ini",
      value: scheduleCount,
      desc: `${upcomingSchedules.length} akan datang`,
      icon: CalendarDays,
    },
    {
      title: "Petugas Terdaftar",
      value: persons.length,
      desc: `${roles.length} role pelayanan`,
      icon: Users,
    },
    {
      title: "Role Pelayanan",
      value: roles.length,
      desc: "Jenis pelayanan",
      icon: Tags,
    },
    {
      title: "Kegiatan Mendatang",
      value: upcomingEvents.length,
      desc: "Akan datang",
      icon: PartyPopper,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di dashboard admin Paroki Sandai.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Jadwal Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada jadwal.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingSchedules.map((s) => (
                  <li key={s.id} className="flex items-start gap-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.startAt).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" — "}
                        {s.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PartyPopper className="h-4 w-4" />
              Kegiatan Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kegiatan.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                        {e.location ? ` — ${e.location}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
