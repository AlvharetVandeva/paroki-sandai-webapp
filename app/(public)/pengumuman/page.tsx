import { getAnnouncementsPage } from "@/services/announcement.service";
import { AnnouncementsList } from "@/components/public/announcements-list";

export const metadata = {
  title: "Pengumuman | Paroki Sandai",
  description: "Daftar pengumuman dan informasi terbaru dari Paroki Sandai.",
};

type SearchParams = Promise<{
  page?: string;
  q?: string;
  sort?: string;
}>;

const PAGE_SIZE = 9;

export default async function PengumumanPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const query = (params.q ?? "").trim();
  const sort: "asc" | "desc" = params.sort === "asc" ? "asc" : "desc";

  const data = await getAnnouncementsPage({ page, pageSize: PAGE_SIZE, sort, query });

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengumuman</h1>
        <p className="text-slate-600">Informasi dan pengumuman terbaru Paroki Sandai</p>
      </div>

      <AnnouncementsList
        initialItems={data.items.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          createdAt: a.createdAt,
        }))}
        total={data.total}
        page={data.page}
        pageSize={data.pageSize}
        totalPages={data.totalPages}
        query={query}
        sort={sort}
      />
    </section>
  );
}
