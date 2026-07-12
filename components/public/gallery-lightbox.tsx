"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type GalleryImage = {
  id: number;
  url: string;
  caption: string | null;
};

interface GalleryLightboxProps {
  images: GalleryImage[];
}

export function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, prev]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (images.length === 0) {
    return <p className="text-sm italic text-slate-500">Belum ada foto di album ini.</p>;
  }

  const active = images[activeIndex];

  return (
    <div>
      {/* Grid thumbnails */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => {
              setActiveIndex(idx);
              setOpen(true);
            }}
            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.caption ?? `Foto ${idx + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs text-white line-clamp-2">
                {img.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm">
              {activeIndex + 1} / {images.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              className="text-white hover:bg-white/10"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Image */}
          <div className="relative flex flex-1 items-center justify-center px-4">
            {images.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={prev}
                className="absolute left-2 z-10 text-white hover:bg-white/10 sm:left-4"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.caption ?? `Foto ${activeIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded object-contain"
            />
            {images.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={next}
                className="absolute right-2 z-10 text-white hover:bg-white/10 sm:right-4"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Caption */}
          {active.caption && (
            <div className="p-4 text-center text-sm text-white/90">
              {active.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
