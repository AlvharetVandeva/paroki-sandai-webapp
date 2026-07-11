# Phase 5 Public Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build public home page with navbar, static hero carousel, schedule previews, upcoming events, announcements, hardcoded pastor greeting, and footer.

**Architecture:** Keep `app/page.tsx` as Server Component and fetch database data through existing `services/*`. Put Flowbite browser-interactive widgets behind tiny Client Component wrappers inside `components/public/`. Keep layout sections small and data-shape props explicit.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma, MySQL/MariaDB adapter, Flowbite React, Tailwind CSS.

## Global Constraints

- Use Bahasa Indonesia for explanations and UI copy.
- Server Components by default; use Client Components only for Flowbite interactive widgets like navbar toggle and carousel.
- No new dependency.
- Hero images are static and hardcoded.
- Pastor greeting is static and hardcoded.
- Navbar must include all public page links from CLAUDE.md even when target pages are still Phase 6.
- Data reads use existing services from `services/`.
- Verification commands: `npm run lint`, `npm run build`.

---

## File Structure

- Create `components/public/public-navbar.tsx`: Client Component wrapping Flowbite `Navbar`, full public links.
- Create `components/public/hero-carousel.tsx`: Client Component wrapping Flowbite `Carousel`, static slides.
- Create `components/public/public-footer.tsx`: Server Component footer using settings props.
- Create `components/public/home-sections.tsx`: Server-friendly presentational sections for schedule, events, announcements, pastor greeting.
- Modify `app/page.tsx`: async Server Component fetching public data in parallel, composing public UI.

---

### Task 1: Public navigation and hero

**Files:**
- Create: `components/public/public-navbar.tsx`
- Create: `components/public/hero-carousel.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `PublicNavbar(): JSX.Element`
- Produces: `HeroCarousel(): JSX.Element`
- Consumes: Next.js `Link`, Flowbite React `Navbar`, `Carousel`, `Button`

- [ ] Step 1: Create client navbar with all public links.

```tsx
"use client";

import Link from "next/link";
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/profil", label: "Profil" },
  { href: "/sakramen", label: "Sakramen" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/sejarah", label: "Sejarah" },
  { href: "/hubungi", label: "Hubungi Kami" },
];

export function PublicNavbar() {
  return (
    <Navbar fluid rounded className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <NavbarBrand as={Link} href="/">
        <span className="self-center whitespace-nowrap text-xl font-bold text-blue-900">
          Paroki Sandai
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        {navLinks.map((link) => (
          <NavbarLink key={link.href} as={Link} href={link.href}>
            {link.label}
          </NavbarLink>
        ))}
      </NavbarCollapse>
    </Navbar>
  );
}
```

- [ ] Step 2: Create static hero carousel.

```tsx
"use client";

import Link from "next/link";
import { Button, Carousel } from "flowbite-react";

const slides = [
  {
    title: "Selamat Datang di Paroki Sandai",
    description: "Pusat informasi jadwal misa, pelayanan, kegiatan, dan pengumuman paroki.",
    image: "/uploads/b041b5f4fa8964d2.webp",
  },
  {
    title: "Kalender Pelayanan Paroki",
    description: "Lihat jadwal pelayanan dan petugas dalam satu tempat yang mudah diakses.",
    image: "/uploads/0f9ca69e06418322.webp",
  },
  {
    title: "Bersama Membangun Komunitas Iman",
    description: "Ikuti kegiatan paroki dan temukan informasi terbaru untuk umat.",
    image: "/uploads/f9708d7416a0d62a.webp",
  },
];

export function HeroCarousel() {
  return (
    <section className="h-[520px] bg-slate-900 sm:h-[600px]">
      <Carousel slideInterval={6000} pauseOnHover>
        {slides.map((slide) => (
          <div key={slide.title} className="relative flex h-full items-center justify-center overflow-hidden">
            <img
              src={slide.image}
              alt="Foto kegiatan Paroki Sandai"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/85 via-blue-950/45 to-transparent" />
            <div className="relative mx-auto max-w-5xl px-6 text-center text-white sm:text-left">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
                Website Resmi
              </p>
              <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
                {slide.title}
              </h1>
              <p className="mb-8 max-w-2xl text-lg text-blue-50 sm:text-xl">
                {slide.description}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button as={Link} href="/jadwal" color="blue" size="lg">
                  Lihat Jadwal
                </Button>
                <Button as={Link} href="/hubungi" color="light" size="lg">
                  Hubungi Paroki
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}
```

- [ ] Step 3: Wire temporary page with navbar and hero.

```tsx
import { HeroCarousel } from "@/components/public/hero-carousel";
import { PublicNavbar } from "@/components/public/public-navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <HeroCarousel />
    </main>
  );
}
```

- [ ] Step 4: Run lint.

Run: `npm run lint`
Expected: PASS or actionable lint output.

---

### Task 2: Home content sections

**Files:**
- Create: `components/public/home-sections.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `SchedulePreviewSection({ schedules }: { schedules: UpcomingSchedule[] }): JSX.Element`
- Produces: `EventsSection({ events }: { events: UpcomingEvent[] }): JSX.Element`
- Produces: `AnnouncementsSection({ announcements }: { announcements: RecentAnnouncement[] }): JSX.Element`
- Produces: `PastorGreetingSection(): JSX.Element`
- Types are local to `home-sections.tsx` and match current Prisma result shapes used by existing services.

- [ ] Step 1: Create presentational sections.

```tsx
import Link from "next/link";
import { Badge, Button, Card } from "flowbite-react";

export type UpcomingSchedule = {
  id: number;
  title: string;
  startAt: Date;
  endAt: Date;
  location: string;
  assignments: {
    person: { fullName: string } | null;
    role: { name: string };
  }[];
};

export type UpcomingEvent = {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
};

export type RecentAnnouncement = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function formatTimeRange(start: Date, end: Date) {
  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function excerpt(text: string, maxLength = 140) {
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

export function SchedulePreviewSection({ schedules }: { schedules: UpcomingSchedule[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge color="info" className="mb-3 w-fit">Jadwal Pelayanan</Badge>
          <h2 className="text-3xl font-bold text-slate-900">Jadwal misa dan pelayanan terdekat</h2>
          <p className="mt-2 text-slate-600">Ringkasan kegiatan pelayanan yang akan datang.</p>
        </div>
        <Button as={Link} href="/jadwal" color="light">Lihat Semua Jadwal</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {schedules.length === 0 ? (
          <p className="p-6 text-slate-600">Belum ada jadwal pelayanan mendatang.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {schedules.map((schedule) => (
              <article key={schedule.id} className="grid gap-4 p-6 md:grid-cols-[220px_1fr]">
                <div>
                  <p className="font-semibold text-blue-900">{formatDate(schedule.startAt)}</p>
                  <p className="text-sm text-slate-600">{formatTimeRange(schedule.startAt, schedule.endAt)}</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{schedule.title}</h3>
                  <p className="mt-1 text-slate-600">{schedule.location}</p>
                  {schedule.assignments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {schedule.assignments.slice(0, 4).map((assignment) => (
                        <Badge key={`${schedule.id}-${assignment.role.name}-${assignment.person?.fullName ?? "kosong"}`} color="gray">
                          {assignment.role.name}: {assignment.person?.fullName ?? "Belum ditentukan"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function EventsSection({ events }: { events: UpcomingEvent[] }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge color="success" className="mb-3 w-fit">Kegiatan</Badge>
            <h2 className="text-3xl font-bold text-slate-900">5 kegiatan mendatang</h2>
            <p className="mt-2 text-slate-600">Agenda paroki yang dapat diikuti umat.</p>
          </div>
          <Button as={Link} href="/kegiatan" color="light">Lihat Semua Kegiatan</Button>
        </div>

        {events.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 p-6 text-slate-600">Belum ada kegiatan mendatang.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="h-full">
                <p className="text-sm font-semibold text-blue-700">{formatDate(event.date)}</p>
                <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                {event.location && <p className="text-sm text-slate-600">{event.location}</p>}
                {event.description && <p className="text-slate-700">{excerpt(event.description)}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function AnnouncementsSection({ announcements }: { announcements: RecentAnnouncement[] }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px]">
      <div>
        <Badge color="warning" className="mb-3 w-fit">Pengumuman</Badge>
        <h2 className="text-3xl font-bold text-slate-900">Pengumuman singkat</h2>
        <p className="mt-2 text-slate-600">Informasi terbaru dari sekretariat dan pelayanan paroki.</p>
        <Button as={Link} href="/pengumuman" color="light" className="mt-6">Lihat Arsip Pengumuman</Button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Belum ada pengumuman.</p>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {formatDate(announcement.createdAt)}
              </p>
              <h3 className="text-lg font-bold text-slate-900">{announcement.title}</h3>
              <p className="text-slate-700">{excerpt(announcement.content, 120)}</p>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

export function PastorGreetingSection() {
  return (
    <section className="bg-blue-950 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[280px_1fr] lg:items-center">
        <div className="h-72 overflow-hidden rounded-3xl bg-blue-900 shadow-xl">
          <img
            src="/uploads/c85e0f03265664b6.webp"
            alt="Pastor Paroki Sandai"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
        <blockquote>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Sambutan Pastor</p>
          <p className="mt-4 text-2xl font-semibold leading-relaxed sm:text-3xl">
            “Semoga website ini membantu umat menemukan informasi pelayanan, jadwal misa, dan kegiatan paroki dengan lebih mudah.”
          </p>
          <footer className="mt-6 text-blue-100">
            <strong>Pastor Paroki Sandai</strong>
            <span className="block text-sm">Paroki Sandai</span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
```

- [ ] Step 2: Update home page to fetch data and render sections.

```tsx
import { getRecentAnnouncements } from "@/services/announcement.service";
import { getUpcomingEvents } from "@/services/event.service";
import { getUpcomingSchedules } from "@/services/schedule.service";
import { getPublicSettings } from "@/services/site-setting.service";
import { HeroCarousel } from "@/components/public/hero-carousel";
import {
  AnnouncementsSection,
  EventsSection,
  PastorGreetingSection,
  SchedulePreviewSection,
} from "@/components/public/home-sections";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

export default async function Home() {
  const [schedules, events, announcements, settings] = await Promise.all([
    getUpcomingSchedules(5),
    getUpcomingEvents(5),
    getRecentAnnouncements(4),
    getPublicSettings(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <HeroCarousel />
      <SchedulePreviewSection schedules={schedules} />
      <EventsSection events={events} />
      <AnnouncementsSection announcements={announcements} />
      <PastorGreetingSection />
      <PublicFooter settings={settings} />
    </main>
  );
}
```

- [ ] Step 3: Run lint.

Run: `npm run lint`
Expected: PASS or actionable lint output.

---

### Task 3: Public footer and final verification

**Files:**
- Create: `components/public/public-footer.tsx`
- Modify: `app/page.tsx` only if import mismatch occurs.

**Interfaces:**
- Produces: `PublicFooter({ settings }: { settings: Record<string, string> }): JSX.Element`
- Consumes: `settings.siteName`, `settings.address`, `settings.phone`, `settings.email`, `settings.socialMediaFacebook`, `settings.socialMediaInstagram`, `settings.socialMediaYoutube`, `settings.mapEmbedUrl`

- [ ] Step 1: Create footer.

```tsx
import Link from "next/link";

const footerLinks = [
  { href: "/jadwal", label: "Jadwal Pelayanan" },
  { href: "/profil", label: "Profil Paroki" },
  { href: "/sakramen", label: "Informasi Sakramen" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/hubungi", label: "Hubungi Kami" },
];

export function PublicFooter({ settings }: { settings: Record<string, string> }) {
  const siteName = settings.siteName || "Paroki Sandai";
  const address = settings.address || "Sandai, Ketapang, Kalimantan Barat";
  const phone = settings.phone || "-";
  const email = settings.email || "-";

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold text-white">{siteName}</h2>
          <p className="mt-4 text-slate-300">{address}</p>
          <div className="mt-4 space-y-1 text-sm text-slate-400">
            <p>Telepon: {phone}</p>
            <p>Email: {email}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Navigasi</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-300 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Sosial Media</h3>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {settings.socialMediaFacebook && (
              <a className="text-slate-300 hover:text-white" href={settings.socialMediaFacebook}>Facebook</a>
            )}
            {settings.socialMediaInstagram && (
              <a className="text-slate-300 hover:text-white" href={settings.socialMediaInstagram}>Instagram</a>
            )}
            {settings.socialMediaYoutube && (
              <a className="text-slate-300 hover:text-white" href={settings.socialMediaYoutube}>YouTube</a>
            )}
          </div>
          {settings.mapEmbedUrl && (
            <iframe
              src={settings.mapEmbedUrl}
              title="Peta lokasi Paroki Sandai"
              className="mt-6 h-44 w-full rounded-2xl border-0"
              loading="lazy"
            />
          )}
        </div>
      </div>
      <div className="border-t border-slate-800 px-6 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {siteName}. Semua hak dilindungi.
      </div>
    </footer>
  );
}
```

- [ ] Step 2: Run lint.

Run: `npm run lint`
Expected: PASS.

- [ ] Step 3: Run production build.

Run: `npm run build`
Expected: PASS.

- [ ] Step 4: Commit changes.

```bash
git add app/page.tsx components/public docs/superpowers/plans/2026-07-07-phase-5-public-home.md
git commit -m "feat(public): build home page layout"
```

---

## Self-Review

- Spec coverage: Phase 5 home tasks covered except real responsive visual QA, which is covered by Tailwind responsive classes and final manual review later in Phase 7.
- Placeholder scan: no TODO/TBD remains.
- Type consistency: props in `app/page.tsx` match exports from public components.
