"use client";

import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Types & Helpers                                                           */
/* -------------------------------------------------------------------------- */

interface StatisticsCounterProps {
  jiwa: string;
  kk: string;
  tahunPelayanan: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* -------------------------------------------------------------------------- */
/*  Animated Card                                                              */
/* -------------------------------------------------------------------------- */

function StatCard({
  target,
  label,
  suffix,
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [pulse, setPulse] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;

    const el = numberRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return;
        hasStarted.current = true;

        const duration = 2400;
        const start = performance.now();

        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutCubic(progress);
          const current = Math.round(eased * target);
          if (el) el.textContent = current.toLocaleString("id-ID");
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setDone(true);
            // delayed pulse — the "candle lit" moment
            setTimeout(() => setPulse(true), 150);
          }
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl bg-white px-6 py-8 text-center shadow-sm ring-1 ring-slate-200 transition-shadow duration-500 hover:shadow-lg ${
        pulse ? "ring-amber-400/60" : ""
      }`}
    >
      {/* Top accent bar — glows briefly on completion */}
      <div
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 transition-[opacity,box-shadow] duration-1000 ${
          pulse
            ? "opacity-100 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
            : "opacity-60"
        }`}
        aria-hidden="true"
      />

      {/* Number */}
      <span
        ref={numberRef}
        className="block font-serif text-5xl font-bold tabular-nums tracking-tight text-slate-800"
      >
        {done ? target.toLocaleString("id-ID") : "0"}
      </span>
      {suffix && (
        <sup className="ml-0.5 text-xl font-semibold text-amber-600">
          {suffix}
        </sup>
      )}

      {/* Separator */}
      <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* Label */}
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                    */
/* -------------------------------------------------------------------------- */

export function StatisticsCounter({
  jiwa,
  kk,
  tahunPelayanan,
}: StatisticsCounterProps) {
  const jiwaNum = parseInt(jiwa, 10) || 0;
  const kkNum = parseInt(kk, 10) || 0;
  const tahunNum = parseInt(tahunPelayanan, 10) || 0;
  const showTahun = tahunPelayanan !== "" && tahunPelayanan !== "0";

  if (jiwaNum === 0 && kkNum === 0 && !showTahun) return null;

  const cols = showTahun ? 3 : 2;

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Subtle section eyebrow */}
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          Sekilas Paroki
        </p>

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {jiwaNum > 0 && (
            <StatCard target={jiwaNum} label="Jiwa Penduduk" />
          )}
          {kkNum > 0 && (
            <StatCard target={kkNum} label="Kepala Keluarga" />
          )}
          {showTahun && (
            <StatCard target={tahunNum} label="Tahun Melayani" suffix="th" />
          )}
        </div>
      </div>
    </section>
  );
}
