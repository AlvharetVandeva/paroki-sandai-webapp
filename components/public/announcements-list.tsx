"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Megaphone, Search, ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
};

interface AnnouncementsListProps {
  initialItems: Announcement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  sort: "asc" | "desc";
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function plainTextExcerpt(html: string, maxLength = 200) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

function AnnouncementCard({ item, featured = false }: { item: Announcement; featured?: boolean }) {
  return (
    <Card className={`transition-shadow hover:shadow-md ${featured ? "border-blue-200 bg-blue-50/40" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Megaphone className="h-3.5 w-3.5" />
          {dateFormatter.format(new Date(item.createdAt))}
          {featured && (
            <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              Terbaru
            </span>
          )}
        </div>
        <CardTitle className="mt-1 text-base">
          <Link
            href={`/pengumuman/${item.id}`}
            className="hover:text-blue-700 hover:underline"
          >
            {item.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 line-clamp-3">
          {plainTextExcerpt(item.content, featured ? 320 : 180)}
        </p>
        <Link
          href={`/pengumuman/${item.id}`}
          className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
        >
          Baca selengkapnya →
        </Link>
      </CardContent>
    </Card>
  );
}

export function AnnouncementsList({
  initialItems,
  total,
  page: initialPage,
  pageSize,
  totalPages: initialTotalPages,
  query: initialQuery,
  sort: initialSort,
}: AnnouncementsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [queryInput, setQueryInput] = useState(initialQuery);

  useEffect(() => {
    setQueryInput(initialQuery);
  }, [initialQuery]);

  const { featured, rest } = useMemo(() => {
    if (initialPage !== 1) return { featured: null, rest: initialItems };
    if (initialItems.length === 0) return { featured: null, rest: [] };
    return { featured: initialItems[0], rest: initialItems.slice(1) };
  }, [initialItems, initialPage]);

  function navigate(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    startTransition(() => {
      router.push(`?${sp.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ page: undefined, q: queryInput || undefined });
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari pengumuman..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({ sort: initialSort === "asc" ? "desc" : "asc", page: undefined })
            }
            disabled={isPending}
          >
            {initialSort === "asc" ? (
              <>
                <ArrowUpAZ className="mr-2 h-4 w-4" /> Terlama
              </>
            ) : (
              <>
                <ArrowDownAZ className="mr-2 h-4 w-4" /> Terbaru
              </>
            )}
          </Button>
          <Button type="submit" disabled={isPending}>
            Cari
          </Button>
        </div>
      </form>

      <p className="text-sm text-slate-600">
        {total === 0
          ? "Tidak ada pengumuman."
          : `Menampilkan ${initialItems.length} dari ${total} pengumuman`}
      </p>

      {initialItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Pengumuman tidak ditemukan.
        </div>
      ) : (
        <div className="space-y-6">
          {featured && <AnnouncementCard item={featured} featured />}
          {rest.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <AnnouncementCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {initialTotalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600">
            Halaman {initialPage} dari {initialTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={initialPage <= 1 || isPending}
              onClick={() => navigate({ page: String(Math.max(1, initialPage - 1)) })}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={initialPage >= initialTotalPages || isPending}
              onClick={() =>
                navigate({ page: String(Math.min(initialTotalPages, initialPage + 1)) })
              }
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
