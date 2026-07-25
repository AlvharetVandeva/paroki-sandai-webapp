"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
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

const NAV_ITEMS = [
  { label: "Beranda", href: "/dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { label: "Jadwal", href: "/dashboard/schedules", icon: Calendar, resource: "schedules" },
  { label: "Petugas", href: "/dashboard/persons", icon: Users, resource: "persons" },
  { label: "Kegiatan", href: "/dashboard/events", icon: PartyPopper, resource: "events" },
  { label: "Pengumuman", href: "/dashboard/announcements", icon: Megaphone, resource: "announcements" },
  { label: "Berita", href: "/dashboard/news", icon: Newspaper, resource: "news" },
  { label: "Galeri", href: "/dashboard/gallery", icon: ImageIcon, resource: "gallery" },
  { label: "Sejarah Gereja", href: "/dashboard/history", icon: Landmark, resource: "settings" },
  { label: "Jenis Pelayanan", href: "/dashboard/roles", icon: Tags, resource: "service_roles" },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, resource: "settings" },
];

import { hasPermission } from "@/lib/rbac";

const RBAC_ITEMS = [
  { label: "Manajemen User", href: "/dashboard/users", icon: UserCog, resource: "users" },
  { label: "Roles", href: "/dashboard/rbac/roles", icon: Tags, resource: "rbac" },
  { label: "Permissions", href: "/dashboard/rbac/permissions", icon: ShieldAlert, resource: "rbac" },
];

export default function AppSidebar({
  userRoles = [],
  userPermissions = [],
}: {
  userRoles?: string[];
  userPermissions?: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                <Image src="/logo.jpeg" alt="Logo Paroki Sandai" width={32} height={32} className="object-cover w-full h-full" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Paroki Sandai</span>
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.filter((item) => hasPermission(userPermissions, item.resource, "read")).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.href} />}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Tampilkan grup Administrator HANYA jika user memiliki salah satu akses di bawah ini */}
        {(hasPermission(userPermissions, "users", "read") || hasPermission(userPermissions, "rbac", "read")) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administrator</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {RBAC_ITEMS.filter((item) => hasPermission(userPermissions, item.resource, "read")).map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        tooltip={item.label}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

