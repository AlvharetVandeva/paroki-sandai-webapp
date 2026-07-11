"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  { href: "/hubungi", label: "Hubungi" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-900">Paroki Sandai</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-700 ${
                  isActive ? "text-blue-700" : "text-slate-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger 
              render={<Button variant="ghost" size="icon" />}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left text-blue-900">Paroki Sandai</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-base font-medium transition-colors hover:text-blue-700 ${
                        isActive ? "text-blue-700" : "text-slate-600"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
