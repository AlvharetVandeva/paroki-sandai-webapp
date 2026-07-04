import { getSiteSetting } from "@/services/setting.service";
import { HistoryForm } from "./history-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function HistoryPage() {
  const historyContent = await getSiteSetting("history") || "";

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/dashboard" />} nativeButton={false}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sejarah Gereja Paroki</h1>
          <p className="text-muted-foreground">Tuliskan sejarah dan informasi tentang paroki di sini.</p>
        </div>
      </div>
      <HistoryForm initialContent={historyContent} />
    </div>
  );
}
