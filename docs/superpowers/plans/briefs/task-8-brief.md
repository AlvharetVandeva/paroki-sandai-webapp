### Task 8: Dashboard Sidebar — Tambah Menu Profil Paroki

**Files:**
- Modify: `components/app-sidebar.tsx:37-48` (insert new nav item + import Church icon)

- [ ] **Step 1: Tambah icon Church dari lucide-react dan item nav**

Di file `components/app-sidebar.tsx`, tambah `Church` di import lucide-react:

```typescript
import {
  LayoutDashboard,
  Calendar,
  Users,
  Tags,
  PartyPopper,
  Megaphone,
  Newspaper,
  Settings,
  LogOut,
  ShieldAlert,
  UserCog,
  ImageIcon,
  Landmark,
  Church,
} from "lucide-react";
```

Tambah item di array `NAV_ITEMS` setelah "Sejarah Gereja":

```typescript
const NAV_ITEMS = [
  { label: "Beranda", href: "/dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { label: "Jadwal", href: "/dashboard/schedules", icon: Calendar, resource: "schedules" },
  { label: "Petugas", href: "/dashboard/persons", icon: Users, resource: "persons" },
  { label: "Kegiatan", href: "/dashboard/events", icon: PartyPopper, resource: "events" },
  { label: "Pengumuman", href: "/dashboard/announcements", icon: Megaphone, resource: "announcements" },
  { label: "Berita", href: "/dashboard/news", icon: Newspaper, resource: "news" },
  { label: "Galeri", href: "/dashboard/gallery", icon: ImageIcon, resource: "gallery" },
  { label: "Sejarah Gereja", href: "/dashboard/history", icon: Landmark, resource: "settings" },
  { label: "Profil Paroki", href: "/dashboard/profil", icon: Church, resource: "settings" },
  { label: "Jenis Pelayanan", href: "/dashboard/roles", icon: Tags, resource: "service_roles" },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, resource: "settings" },
];
```

- [ ] **Step 2: Commit**

```bash
git add components/app-sidebar.tsx
git commit -m "feat: add Profil Paroki menu to dashboard sidebar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

