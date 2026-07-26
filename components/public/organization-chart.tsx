"use client";

interface OrganizationChartProps {
  imageUrl: string | null;
}

export function OrganizationChart({ imageUrl }: OrganizationChartProps) {
  if (!imageUrl) return null;

  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Struktur Organisasi
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Bagan struktur organisasi Gereja Paroki Sandai
          </p>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <img
            src={imageUrl}
            alt="Struktur Organisasi Paroki Sandai"
            className="mx-auto h-auto w-full max-w-4xl object-contain p-4"
          />
        </div>
      </div>
    </section>
  );
}
