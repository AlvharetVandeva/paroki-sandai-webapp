"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const SIDEBAR_ITEMS = [
  { label: "Beranda", href: "/dashboard", icon: "📊" },
  { label: "Jadwal", href: "/dashboard/schedules", icon: "📅" },
  { label: "Petugas", href: "/dashboard/persons", icon: "👤" },
  { label: "Role", href: "/dashboard/roles", icon: "🏷️" },
  { label: "Kegiatan", href: "/dashboard/events", icon: "🎉" },
  { label: "Pengumuman", href: "/dashboard/announcements", icon: "📢" },
  { label: "Pengaturan", href: "/dashboard/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="text-lg font-bold">
          Paroki Sandai
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
          Keluar
        </button>
      </div>
    </aside>
  );
}
