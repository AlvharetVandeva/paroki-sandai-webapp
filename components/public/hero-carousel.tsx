"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "Selamat Datang di Paroki Sandai",
    description: "Pusat informasi jadwal misa, pelayanan, kegiatan, dan pengumuman paroki.",
    image: "/hero/image1.jpeg",
  },
  {
    title: "Kalender Pelayanan Paroki",
    description: "Lihat jadwal pelayanan dan petugas dalam satu tempat yang mudah diakses.",
    image: "/hero/image2.jpeg",
  },
  {
    title: "Bersama Membangun Komunitas Iman",
    description: "Ikuti kegiatan paroki dan temukan informasi terbaru untuk umat.",
    image: "/hero/image3.jpeg",
  },
  {
    title: "Informasi Paroki Dalam Satu Tempat",
    description: "Akses berita, pengumuman, galeri, dan kontak Paroki Sandai dengan mudah.",
    image: "/hero/image4.jpeg",
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  function goToPrevious() {
    setActiveIndex((index) => (index === 0 ? slides.length - 1 : index - 1));
  }

  function goToNext() {
    setActiveIndex((index) => (index + 1) % slides.length);
  }

  return (
    <section className="relative h-[520px] overflow-hidden bg-slate-900 sm:h-[600px]">
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            <Image
              fill
              priority={index === 0}
              src={slide.image}
              alt="Foto kegiatan Paroki Sandai"
              className={`object-cover transition-transform duration-[6500ms] ease-out ${
                isActive ? "scale-100" : "scale-105"
              }`}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/85 via-blue-950/45 to-transparent" />
          </div>
        );
      })}

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-5xl px-6 text-center text-white sm:text-left">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
            Website Resmi
          </p>
          <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            {slides[activeIndex].title}
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-blue-50 sm:text-xl">
            {slides[activeIndex].description}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:inline-flex"
        onClick={goToPrevious}
        aria-label="Slide sebelumnya"
      >
        ‹
      </button>
      <button
        type="button"
        className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:inline-flex"
        onClick={goToNext}
        aria-label="Slide berikutnya"
      >
        ›
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Tampilkan slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
