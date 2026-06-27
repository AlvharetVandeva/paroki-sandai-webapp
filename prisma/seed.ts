import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ── ServiceRoles ──────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.serviceRole.upsert({
      where: { name: "Romo" },
      update: {},
      create: { name: "Romo", description: "Imam yang memimpin misa dan pelayanan sakramen" },
    }),
    prisma.serviceRole.upsert({
      where: { name: "Prodiakon" },
      update: {},
      create: { name: "Prodiakon", description: "Pelayan tetap yang membantu misa dan pelayanan" },
    }),
    prisma.serviceRole.upsert({
      where: { name: "Lektor" },
      update: {},
      create: { name: "Lektor", description: "Pembaca sabda dan doa umat" },
    }),
    prisma.serviceRole.upsert({
      where: { name: "Pemazmur" },
      update: {},
      create: { name: "Pemazmur", description: "Pemimpin pujian dan mazmur" },
    }),
    prisma.serviceRole.upsert({
      where: { name: "Misdinar" },
      update: {},
      create: { name: "Misdinar", description: "Para putra/putri altar yang melayani misa" },
    }),
    prisma.serviceRole.upsert({
      where: { name: "Koster" },
      update: {},
      create: { name: "Koster", description: "Petugas kebersihan dan perlengkapan gereja" },
    }),
  ]);
  console.log(`  ✓ ${roles.length} roles created`);

  // ── Persons ────────────────────────────────────────────────────
  const persons = await Promise.all([
    prisma.person.upsert({
      where: { email: "romo.yohanes@parokisandai.org" },
      update: {},
      create: { fullName: "Romo Yohanes Prasetyo", email: "romo.yohanes@parokisandai.org", roleId: roles[0].id },
    }),
    prisma.person.upsert({
      where: { email: "dion.simanjuntak@parokisandai.org" },
      update: {},
      create: { fullName: "Dion Simanjuntak", email: "dion.simanjuntak@parokisandai.org", roleId: roles[1].id },
    }),
    prisma.person.upsert({
      where: { email: "agus.suwanto@parokisandai.org" },
      update: {},
      create: { fullName: "Agus Suwanto", email: "agus.suwanto@parokisandai.org", roleId: roles[2].id },
    }),
    prisma.person.upsert({
      where: { email: "maria.lestari@parokisandai.org" },
      update: {},
      create: { fullName: "Maria Lestari", email: "maria.lestari@parokisandai.org", roleId: roles[2].id },
    }),
    prisma.person.upsert({
      where: { email: "petrus.wijaya@parokisandai.org" },
      update: {},
      create: { fullName: "Petrus Wijaya", email: "petrus.wijaya@parokisandai.org", roleId: roles[3].id },
    }),
    prisma.person.upsert({
      where: { email: "veronika.sari@parokisandai.org" },
      update: {},
      create: { fullName: "Veronika Sari", email: "veronika.sari@parokisandai.org", roleId: roles[3].id },
    }),
    prisma.person.upsert({
      where: { email: "misdinar.koordinator@parokisandai.org" },
      update: {},
      create: { fullName: "Fransiskus Ari", email: "misdinar.koordinator@parokisandai.org", roleId: roles[4].id },
    }),
    prisma.person.upsert({
      where: { email: "koster.utama@parokisandai.org" },
      update: {},
      create: { fullName: "Bapak Karno", email: "koster.utama@parokisandai.org", roleId: roles[5].id },
    }),
  ]);
  console.log(`  ✓ ${persons.length} persons created`);

  // ── Schedules ──────────────────────────────────────────────────
  const sundayMass = await prisma.schedule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Misa Harian",
      startAt: new Date("2026-06-28T06:00:00+07:00"),
      endAt: new Date("2026-06-28T07:00:00+07:00"),
      location: "Gereja Paroki Sandai",
      description: "Misa harian pagi",
    },
  });

  const baptism = await prisma.schedule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Baptisan Bayi Umum",
      startAt: new Date("2026-07-05T09:00:00+07:00"),
      endAt: new Date("2026-07-05T11:00:00+07:00"),
      location: "Gereja Paroki Sandai",
      description: "Baptisan bayi untuk bulan Juli",
    },
  });
  console.log(`  ✓ ${2} schedules created`);

  // ── ScheduleAssignments ───────────────────────────────────────
  await prisma.scheduleAssignment.createMany({
    data: [
      { scheduleId: sundayMass.id, personId: persons[0].id, roleId: roles[0].id },
      { scheduleId: sundayMass.id, personId: persons[1].id, roleId: roles[1].id },
      { scheduleId: sundayMass.id, personId: persons[2].id, roleId: roles[2].id },
      { scheduleId: sundayMass.id, personId: persons[4].id, roleId: roles[3].id },
      { scheduleId: baptism.id, personId: persons[0].id, roleId: roles[0].id },
      { scheduleId: baptism.id, personId: persons[3].id, roleId: roles[2].id },
    ],
    skipDuplicates: true,
  });
  console.log(`  ✓ assignments created`);

  // ── Events ─────────────────────────────────────────────────────
  await Promise.all([
    prisma.event.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Rapat Pengurus Paroki",
        description: "Rapat rutin bulanan pengurus paroki membahas program kerja dan jadwal kegiatan",
        date: new Date("2026-07-10T19:00:00+07:00"),
        location: "Aula Paroki Sandai",
        address: "Jl. Gereja No. 1, Sandai, Ketapang",
      },
    }),
    prisma.event.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Pelatihan Misdinar",
        description: "Pelatihan untuk para putra altar tentang tata cara pelayanan misa",
        date: new Date("2026-07-12T08:00:00+07:00"),
        location: "Gereja Paroki Sandai",
      },
    }),
    prisma.event.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "Kunjungan Pastoral",
        description: "Kunjungan romo ke stasi-stasi wilayah paroki Sandai",
        date: new Date("2026-07-15T09:00:00+07:00"),
      },
    }),
    prisma.event.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: "Pemberkatan Pernikahan",
        description: "Pemberkatan pernikahan dua umat paroki Sandai",
        date: new Date("2026-07-20T10:00:00+07:00"),
        location: "Gereja Paroki Sandai",
        address: "Jl. Gereja No. 1, Sandai, Ketapang",
      },
    }),
    prisma.event.upsert({
      where: { id: 5 },
      update: {},
      create: {
        title: "Kerja Bakti Lingkungan",
        description: "Kegiatan bersih-bersih lingkungan gereja, diikuti oleh seluruh wilayah",
        date: new Date("2026-07-26T07:00:00+07:00"),
      },
    }),
  ]);
  console.log(`  ✓ 5 events created`);

  // ── Announcements ──────────────────────────────────────────────
  await Promise.all([
    prisma.announcement.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Jadwal Misa Hari Minggu",
        content: "Misa Hari Minggu dilaksanakan pukul 07.00 dan 09.00 WIB. Mohon kehadiran umat tepat waktu.",
      },
    }),
    prisma.announcement.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Pendaftaran Baptisan Bayi",
        content: "Pendaftaran baptisan bayi bulan Juli dibuka sampai tanggal 3 Juli. Hubungi sekretariat paroki.",
      },
    }),
    prisma.announcement.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "Jadwal Pengakuan Dosa",
        content: "Pengakuan dosa rutin setiap hari Sabtu pukul 17.00-18.00 WIB di ruang sakristi.",
      },
    }),
  ]);
  console.log(`  ✓ 3 announcements created`);

  // ── SiteSettings ──────────────────────────────────────────────
  const settings: Record<string, string> = {
    siteName: "Paroki Sandai",
    address: "Jl. Gereja No. 1, Sandai, Ketapang, Kalimantan Barat",
    phone: "(0534) 3033344",
    email: "info@parokisandai.org",
    pastorGreeting: "Selamat datang di website resmi Paroki Sandai. Tuhan memberkati kita semua.",
    pastorName: "Romo Yohanes Prasetyo",
    socialMediaFacebook: "Paroki Sandai",
    socialMediaInstagram: "@parokisandai",
    socialMediaYoutube: "Paroki Sandai TV",
    mapEmbedUrl: "https://maps.google.com/maps?q=Sandai+Ketapang&output=embed",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`  ✓ ${Object.keys(settings).length} site settings saved`);

  console.log("\n✅ Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
