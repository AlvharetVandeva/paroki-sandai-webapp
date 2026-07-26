# Statistik Beranda Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add animated statistics counter section on home page with CMS tab for editing values.

**Architecture:** Three SiteSetting keys store integer values as strings. One new server action saves all three at once. One client component renders animated counters via IntersectionObserver. CMS gets a 4th tab. Home page gets new section between SchedulePreviewSection and CalendarSection.

**Tech Stack:** Next.js App Router, TypeScript, shadcn/ui, Tailwind CSS

## Global Constraints

- Bahasa Indonesia for user-facing text
- Server Components by default; Client Components only for interactive features
- Mutations via Server Actions in `actions/`
- Use existing `SiteSetting` model for storage
- `revalidatePath("/dashboard/profil")` AND `revalidatePath("/")` in actions

---

### Task 1: Create server action for statistics

**Files:**
- Create: `actions/statistics.action.ts`

- [ ] **Step 1: Create `actions/statistics.action.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function saveStatistics(data: {
  jiwa: string;
  kk: string;
  tahunPelayanan: string;
}) {
  try {
    const entries: { key: string; value: string }[] = [
      { key: "statJiwa", value: data.jiwa },
      { key: "statKK", value: data.kk },
      { key: "statTahunPelayanan", value: data.tahunPelayanan },
    ];

    for (const entry of entries) {
      await prisma.siteSetting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      });
    }

    revalidatePath("/dashboard/profil");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan statistik" };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add actions/statistics.action.ts
git commit -m "feat: add saveStatistics server action"
```

---

### Task 2: Create statistics counter component

**Files:**
- Create: `components/public/statistics-counter.tsx`

- [ ] **Step 1: Create `components/public/statistics-counter.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface StatisticsCounterProps {
  jiwa: string;
  kk: string;
  tahunPelayanan: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({ target, label }: { target: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || target === 0) {
      setDone(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return;
        hasStarted.current = true;

        const duration = 2000;
        const start = performance.now();

        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutCubic(progress);
          const current = Math.round(eased * target);
          if (el) el.textContent = current.toLocaleString("id-ID");
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setDone(true);
          }
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="flex flex-col items-center">
      <span
        ref={ref}
        className="text-4xl font-extrabold tabular-nums"
      >
        {done ? target.toLocaleString("id-ID") : "0"}
      </span>
      <span className="mt-1 text-sm font-medium text-blue-100">{label}</span>
    </div>
  );
}

export function StatisticsCounter({ jiwa, kk, tahunPelayanan }: StatisticsCounterProps) {
  const jiwaNum = parseInt(jiwa, 10) || 0;
  const kkNum = parseInt(kk, 10) || 0;
  const tahunNum = parseInt(tahunPelayanan, 10) || 0;

  const showTahun = tahunPelayanan !== "" && tahunPelayanan !== "0";

  if (jiwaNum === 0 && kkNum === 0 && !showTahun) return null;

  return (
    <section className="bg-blue-600 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div
          className={`grid gap-8 ${
            showTahun ? "grid-cols-3" : "grid-cols-2"
          } sm:grid-cols-2 md:grid-cols-${showTahun ? "3" : "2"}`}
          style={{
            gridTemplateColumns: `repeat(${showTahun ? 3 : 2}, minmax(0, 1fr))`,
          }}
        >
          {jiwaNum > 0 && <AnimatedNumber target={jiwaNum} label="Jiwa Penduduk" />}
          {kkNum > 0 && <AnimatedNumber target={kkNum} label="Kepala Keluarga" />}
          {showTahun && (
            <AnimatedNumber target={tahunNum} label="Tahun Pelayanan" />
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/public/statistics-counter.tsx
git commit -m "feat: add statistics counter component with animated count-up"
```

---

### Task 3: Update home page and CMS dashboard

**Files:**
- Modify: `app/(public)/page.tsx`
- Modify: `app/dashboard/profil/page.tsx`
- Modify: `app/dashboard/profil/profil-client.tsx`

- [ ] **Step 1: Update `app/(public)/page.tsx`**

Add import and component between `SchedulePreviewSection` and `CalendarSection`:

```tsx
import { StatisticsCounter } from "@/components/public/statistics-counter";
import { getSetting } from "@/services/site-setting.service";
```

In the async component, add fetches and section:

```tsx
const [statJiwa, statKK, statTahunPelayanan, schedules, monthlySchedules, monthlyEvents, events, announcements, news] = await Promise.all([
  getSetting("statJiwa"),
  getSetting("statKK"),
  getSetting("statTahunPelayanan"),
  getUpcomingSchedules(3),
  getSchedulesForMonth(now.getFullYear(), now.getMonth()),
  getEventsForMonth(now.getFullYear(), now.getMonth()),
  getUpcomingEvents(3),
  getRecentAnnouncements(4),
  getPublishedNews(10),
]);
```

Between `<SchedulePreviewSection>` and `<CalendarSection>`:

```tsx
<StatisticsCounter
  jiwa={statJiwa ?? "0"}
  kk={statKK ?? "0"}
  tahunPelayanan={statTahunPelayanan ?? ""}
/>
```

- [ ] **Step 2: Update `app/dashboard/profil/page.tsx`**

Add stat fetches:

```tsx
const statJiwa = (await getSetting("statJiwa")) ?? "0";
const statKK = (await getSetting("statKK")) ?? "0";
const statTahunPelayanan = (await getSetting("statTahunPelayanan")) ?? "";
```

Pass to ProfilClient:

```tsx
<ProfilClient
  videoUrl={videoUrl}
  chartUrl={chartUrl}
  center={center}
  stations={stations}
  statJiwa={statJiwa}
  statKK={statKK}
  statTahunPelayanan={statTahunPelayanan}
/>
```

- [ ] **Step 3: Update `app/dashboard/profil/profil-client.tsx`**

Add `saveStatistics` import, new props, state, and tab. Key additions:

Import:
```tsx
import { saveStatistics } from "@/actions/statistics.action";
```

Props interface:
```tsx
interface ProfilClientProps {
  videoUrl: string;
  chartUrl: string;
  center: ParishCenterData | null;
  stations: StationData[];
  statJiwa: string;
  statKK: string;
  statTahunPelayanan: string;
}
```

State + handler:
```tsx
const [statJiwa, setStatJiwa] = useState(props.statJiwa);
const [statKK, setStatKK] = useState(props.statKK);
const [statTahunPelayanan, setStatTahunPelayanan] = useState(props.statTahunPelayanan);
const [savingStats, setSavingStats] = useState(false);

const handleSaveStatistics = async () => {
  setSavingStats(true);
  const result = await saveStatistics({
    jiwa: statJiwa || "0",
    kk: statKK || "0",
    tahunPelayanan: statTahunPelayanan,
  });
  setSavingStats(false);
  if (!result?.success) {
    toast.error(result?.error ?? "Gagal menyimpan statistik");
    return;
  }
  toast.success("Statistik berhasil disimpan");
  router.refresh();
};
```

New tab in TabsList:
```tsx
<TabsTrigger value="statistik">Statistik</TabsTrigger>
```

New TabsContent (after wilayah tab):
```tsx
<TabsContent value="statistik">
  <Card>
    <CardHeader>
      <CardTitle>Statistik Paroki</CardTitle>
      <CardDescription>
        Data statistik ditampilkan di halaman beranda dengan animasi hitung.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stat-jiwa">Jiwa Penduduk</Label>
        <Input
          id="stat-jiwa"
          type="number"
          min={0}
          value={statJiwa}
          onChange={(e) => setStatJiwa(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stat-kk">Kepala Keluarga</Label>
        <Input
          id="stat-kk"
          type="number"
          min={0}
          value={statKK}
          onChange={(e) => setStatKK(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stat-tahun">Tahun Pelayanan</Label>
        <Input
          id="stat-tahun"
          type="number"
          min={0}
          value={statTahunPelayanan}
          onChange={(e) => setStatTahunPelayanan(e.target.value)}
          placeholder="30"
        />
        <p className="text-xs text-muted-foreground">
          Kosongkan jika tidak ingin ditampilkan di beranda.
        </p>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSaveStatistics} disabled={savingStats}>
          {savingStats && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          Simpan Statistik
        </Button>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

- [ ] **Step 4: Commit**

```bash
git add app/\(public\)/page.tsx app/dashboard/profil/page.tsx app/dashboard/profil/profil-client.tsx
git commit -m "feat: add statistics section to home page and CMS dashboard tab"
```

---

### Task 4: Verify build

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: successful build.

- [ ] **Step 2: Commit any fixes if needed**
