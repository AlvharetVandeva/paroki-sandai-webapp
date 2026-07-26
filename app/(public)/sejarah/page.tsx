import { Metadata } from "next";
import { getSetting } from "@/services/site-setting.service";
import { PageHeader } from "@/components/public/page-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sejarah Gereja | Paroki Sandai",
  description: "Sejarah berdirinya Gereja Katolik Paroki Sandai.",
};

export default async function SejarahPage() {
  const historyContent = await getSetting("history");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <PageHeader
        title="Sejarah Gereja"
        description="Sejarah berdirinya Gereja Katolik Paroki Sandai."
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-10 prose prose-slate prose-lg max-w-none prose-img:rounded-lg prose-a:text-blue-600 hover:prose-a:text-blue-500">
          {historyContent ? (
            <div dangerouslySetInnerHTML={{ __html: historyContent }} />
          ) : (
            <p className="text-center text-slate-500 italic">Data sejarah belum tersedia.</p>
          )}
        </div>
      </div>
    </div>
  );
}
