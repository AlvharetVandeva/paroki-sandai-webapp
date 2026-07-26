"use client";

import { useEffect, useRef, useState } from "react";

interface StatisticsCounterProps {
  jiwa: string;
  kk: string;
  tahunPelayanan: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({ target, label }: { target: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || target === 0) {
      setDone(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return;
        hasStarted.current = true;

        const duration = 2000;
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
          }
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="flex flex-col items-center">
      <span
        ref={ref}
        className="text-4xl font-extrabold tabular-nums"
      >
        {done ? target.toLocaleString("id-ID") : "0"}
      </span>
      <span className="mt-1 text-sm font-medium text-blue-100">{label}</span>
    </div>
  );
}

export function StatisticsCounter({ jiwa, kk, tahunPelayanan }: StatisticsCounterProps) {
  const jiwaNum = parseInt(jiwa, 10) || 0;
  const kkNum = parseInt(kk, 10) || 0;
  const tahunNum = parseInt(tahunPelayanan, 10) || 0;

  const showTahun = tahunPelayanan !== "" && tahunPelayanan !== "0";

  if (jiwaNum === 0 && kkNum === 0 && !showTahun) return null;

  return (
    <section className="bg-blue-600 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div
          className={`grid gap-8 ${
            showTahun ? "grid-cols-3" : "grid-cols-2"
          } sm:grid-cols-2 md:grid-cols-${showTahun ? "3" : "2"}`}
          style={{
            gridTemplateColumns: `repeat(${showTahun ? 3 : 2}, minmax(0, 1fr))`,
          }}
        >
          {jiwaNum > 0 && <AnimatedNumber target={jiwaNum} label="Jiwa Penduduk" />}
          {kkNum > 0 && <AnimatedNumber target={kkNum} label="Kepala Keluarga" />}
          {showTahun && (
            <AnimatedNumber target={tahunNum} label="Tahun Pelayanan" />
          )}
        </div>
      </div>
    </section>
  );
}
