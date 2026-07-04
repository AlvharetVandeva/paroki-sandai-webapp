import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

// Menggunakan konfigurasi object secara langsung untuk menghindari bug parsing URL
// Menggunakan konfigurasi object secara langsung untuk adapter MariaDB Prisma
const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'paroki_sandai',
  connectionLimit: 10
});
const prisma = new PrismaClient({ adapter });

// ── Permission definitions ────────────────────────────────────────────────────
const PERMISSIONS = [
  // Dashboard
  { action: "read", resource: "dashboard", description: "Melihat halaman dashboard admin" },
  // Schedules
  { action: "create", resource: "schedules", description: "Membuat jadwal pelayanan baru" },
  { action: "read",   resource: "schedules", description: "Melihat data jadwal pelayanan" },
  { action: "update", resource: "schedules", description: "Mengubah jadwal pelayanan" },
  { action: "delete", resource: "schedules", description: "Menghapus jadwal pelayanan" },
  // Persons
  { action: "create", resource: "persons", description: "Menambah petugas/pelayan baru" },
  { action: "read",   resource: "persons", description: "Melihat data petugas/pelayan" },
  { action: "update", resource: "persons", description: "Mengubah data petugas/pelayan" },
  { action: "delete", resource: "persons", description: "Menghapus data petugas/pelayan" },
  // Service Roles (role pelayanan gereja)
  { action: "create", resource: "service_roles", description: "Membuat role pelayanan baru" },
  { action: "read",   resource: "service_roles", description: "Melihat role pelayanan" },
  { action: "update", resource: "service_roles", description: "Mengubah role pelayanan" },
  { action: "delete", resource: "service_roles", description: "Menghapus role pelayanan" },
  // Events
  { action: "create", resource: "events", description: "Membuat kegiatan mendatang baru" },
  { action: "read",   resource: "events", description: "Melihat data kegiatan mendatang" },
  { action: "update", resource: "events", description: "Mengubah kegiatan mendatang" },
  { action: "delete", resource: "events", description: "Menghapus kegiatan mendatang" },
  // Announcements
  { action: "create", resource: "announcements", description: "Membuat pengumuman baru" },
  { action: "read",   resource: "announcements", description: "Melihat data pengumuman" },
  { action: "update", resource: "announcements", description: "Mengubah pengumuman" },
  { action: "delete", resource: "announcements", description: "Menghapus pengumuman" },
  // Settings
  { action: "read",   resource: "settings", description: "Melihat pengaturan website" },
  { action: "update", resource: "settings", description: "Mengubah pengaturan website" },
  // Users (manajemen akun admin)
  { action: "create", resource: "users", description: "Membuat akun pengguna admin baru" },
  { action: "read",   resource: "users", description: "Melihat daftar pengguna admin" },
  { action: "update", resource: "users", description: "Mengubah data pengguna admin" },
  { action: "delete", resource: "users", description: "Menghapus akun pengguna admin" },
  // RBAC (manajemen role & permission)
  { action: "create", resource: "rbac", description: "Membuat role dan permission baru" },
  { action: "read",   resource: "rbac", description: "Melihat data role dan permission" },
  { action: "update", resource: "rbac", description: "Mengubah role dan permission" },
  { action: "delete", resource: "rbac", description: "Menghapus role dan permission" },
] as const;

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Permissions ───────────────────────────────────────────────────────────
  console.log("  → Seeding permissions...");
  const createdPermissions = await Promise.all(
    PERMISSIONS.map((p) =>
      prisma.permission.upsert({
        where: { action_resource: { action: p.action, resource: p.resource } },
        update: { description: p.description },
        create: p,
      })
    )
  );
  console.log(`  ✓ ${createdPermissions.length} permissions`);

  // ── 2. Role: Superadmin ──────────────────────────────────────────────────────
  console.log("  → Seeding role Superadmin...");
  const superadminRole = await prisma.role.upsert({
    where: { name: "Superadmin" },
    update: { description: "Role dengan akses penuh ke semua fitur dashboard" },
    create: {
      name: "Superadmin",
      description: "Role dengan akses penuh ke semua fitur dashboard",
    },
  });

  // Assign semua permission ke Superadmin
  await Promise.all(
    createdPermissions.map((p) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superadminRole.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: { roleId: superadminRole.id, permissionId: p.id },
      })
    )
  );
  console.log(`  ✓ Role Superadmin dengan ${createdPermissions.length} permissions`);

  // ── 3. User Superadmin ───────────────────────────────────────────────────────
  console.log("  → Seeding user superadmin...");
  const hashedPassword = await bcrypt.hash("Admin@12345", 12);
  const superadminUser = await prisma.user.upsert({
    where: { email: "superadmin@parokisandai.org" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@parokisandai.org",
      password: hashedPassword,
    },
  });

  // Assign role Superadmin ke user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superadminUser.id,
        roleId: superadminRole.id,
      },
    },
    update: {},
    create: { userId: superadminUser.id, roleId: superadminRole.id },
  });
  console.log(`  ✓ User superadmin: ${superadminUser.email}`);

  // ── 4. ServiceRoles (role pelayanan gereja) ──────────────────────────────────
  console.log("\n  → Seeding data paroki...");
  const serviceRoles = await Promise.all([
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
  console.log(`  ✓ ${serviceRoles.length} service roles`);

  // ── 5. Persons ───────────────────────────────────────────────────────────────
  const persons = await Promise.all([
    prisma.person.upsert({
      where: { email: "romo.yohanes@parokisandai.org" },
      update: {},
      create: { fullName: "Romo Yohanes Prasetyo", email: "romo.yohanes@parokisandai.org", roleId: serviceRoles[0].id },
    }),
    prisma.person.upsert({
      where: { email: "dion.simanjuntak@parokisandai.org" },
      update: {},
      create: { fullName: "Dion Simanjuntak", email: "dion.simanjuntak@parokisandai.org", roleId: serviceRoles[1].id },
    }),
    prisma.person.upsert({
      where: { email: "agus.suwanto@parokisandai.org" },
      update: {},
      create: { fullName: "Agus Suwanto", email: "agus.suwanto@parokisandai.org", roleId: serviceRoles[2].id },
    }),
    prisma.person.upsert({
      where: { email: "maria.lestari@parokisandai.org" },
      update: {},
      create: { fullName: "Maria Lestari", email: "maria.lestari@parokisandai.org", roleId: serviceRoles[2].id },
    }),
    prisma.person.upsert({
      where: { email: "petrus.wijaya@parokisandai.org" },
      update: {},
      create: { fullName: "Petrus Wijaya", email: "petrus.wijaya@parokisandai.org", roleId: serviceRoles[3].id },
    }),
    prisma.person.upsert({
      where: { email: "veronika.sari@parokisandai.org" },
      update: {},
      create: { fullName: "Veronika Sari", email: "veronika.sari@parokisandai.org", roleId: serviceRoles[3].id },
    }),
    prisma.person.upsert({
      where: { email: "misdinar.koordinator@parokisandai.org" },
      update: {},
      create: { fullName: "Fransiskus Ari", email: "misdinar.koordinator@parokisandai.org", roleId: serviceRoles[4].id },
    }),
    prisma.person.upsert({
      where: { email: "koster.utama@parokisandai.org" },
      update: {},
      create: { fullName: "Bapak Karno", email: "koster.utama@parokisandai.org", roleId: serviceRoles[5].id },
    }),
  ]);
  console.log(`  ✓ ${persons.length} persons`);

  // ── 6. Schedules ─────────────────────────────────────────────────────────────
  const sundayMass = await prisma.schedule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Misa Harian",
      startAt: new Date("2026-06-28T06:00:00+07:00"),
      endAt:   new Date("2026-06-28T07:00:00+07:00"),
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
      endAt:   new Date("2026-07-05T11:00:00+07:00"),
      location: "Gereja Paroki Sandai",
      description: "Baptisan bayi untuk bulan Juli",
    },
  });
  console.log(`  ✓ 2 schedules`);

  // ── 7. Schedule Assignments ──────────────────────────────────────────────────
  await prisma.scheduleAssignment.createMany({
    data: [
      { scheduleId: sundayMass.id, personName: persons[0].fullName, roleId: serviceRoles[0].id },
      { scheduleId: sundayMass.id, personName: persons[1].fullName, roleId: serviceRoles[1].id },
      { scheduleId: sundayMass.id, personName: persons[2].fullName, roleId: serviceRoles[2].id },
      { scheduleId: sundayMass.id, personName: persons[4].fullName, roleId: serviceRoles[3].id },
      { scheduleId: baptism.id,    personName: persons[0].fullName, roleId: serviceRoles[0].id },
      { scheduleId: baptism.id,    personName: persons[3].fullName, roleId: serviceRoles[2].id },
    ],
    skipDuplicates: true,
  });
  console.log(`  ✓ schedule assignments`);

  // ── 8. Events ────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.event.upsert({ where: { id: 1 }, update: {}, create: { title: "Rapat Pengurus Paroki", description: "Rapat rutin bulanan pengurus paroki membahas program kerja dan jadwal kegiatan", date: new Date("2026-07-10T19:00:00+07:00"), location: "Aula Paroki Sandai", address: "Jl. Gereja No. 1, Sandai, Ketapang" } }),
    prisma.event.upsert({ where: { id: 2 }, update: {}, create: { title: "Pelatihan Misdinar", description: "Pelatihan untuk para putra altar tentang tata cara pelayanan misa", date: new Date("2026-07-12T08:00:00+07:00"), location: "Gereja Paroki Sandai" } }),
    prisma.event.upsert({ where: { id: 3 }, update: {}, create: { title: "Kunjungan Pastoral", description: "Kunjungan romo ke stasi-stasi wilayah paroki Sandai", date: new Date("2026-07-15T09:00:00+07:00") } }),
    prisma.event.upsert({ where: { id: 4 }, update: {}, create: { title: "Pemberkatan Pernikahan", description: "Pemberkatan pernikahan dua umat paroki Sandai", date: new Date("2026-07-20T10:00:00+07:00"), location: "Gereja Paroki Sandai", address: "Jl. Gereja No. 1, Sandai, Ketapang" } }),
    prisma.event.upsert({ where: { id: 5 }, update: {}, create: { title: "Kerja Bakti Lingkungan", description: "Kegiatan bersih-bersih lingkungan gereja, diikuti oleh seluruh wilayah", date: new Date("2026-07-26T07:00:00+07:00") } }),
  ]);
  console.log(`  ✓ 5 events`);

  // ── 9. Announcements ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.announcement.upsert({ where: { id: 1 }, update: {}, create: { title: "Jadwal Misa Hari Minggu", content: "Misa Hari Minggu dilaksanakan pukul 07.00 dan 09.00 WIB. Mohon kehadiran umat tepat waktu." } }),
    prisma.announcement.upsert({ where: { id: 2 }, update: {}, create: { title: "Pendaftaran Baptisan Bayi", content: "Pendaftaran baptisan bayi bulan Juli dibuka sampai tanggal 3 Juli. Hubungi sekretariat paroki." } }),
    prisma.announcement.upsert({ where: { id: 3 }, update: {}, create: { title: "Jadwal Pengakuan Dosa", content: "Pengakuan dosa rutin setiap hari Sabtu pukul 17.00-18.00 WIB di ruang sakristi." } }),
  ]);
  console.log(`  ✓ 3 announcements`);

  // ── 10. SiteSettings ─────────────────────────────────────────────────────────
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
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log(`  ✓ ${Object.keys(settings).length} site settings`);

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Kredensial Superadmin:");
  console.log("   Email   : superadmin@parokisandai.org");
  console.log("   Password: Admin@12345");
  console.log("   ⚠️  Segera ganti password setelah login pertama!\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
