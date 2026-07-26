import { Church, MapPin } from "lucide-react";
import { getParishCenter, getStations } from "@/services/organization.service";

export async function ParishRegion() {
  const center = await getParishCenter();
  const stations = await getStations();

  if (!center && stations.length === 0) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Wilayah
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pusat paroki dan stasi dalam naungan Paroki Sandai
          </p>
        </div>

        {center && (
          <div className="mb-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Church className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="text-lg font-bold text-blue-900">{center.name}</h3>
            <p className="mt-1 text-sm text-blue-700">
              Pelindung: {center.patron}
            </p>
          </div>
        )}

        {stations.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {stations.map((station) => (
              <div
                key={station.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-base font-bold text-slate-900">
                  {station.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Pelindung: {station.patron}
                </p>
                {station.address && (
                  <p className="mt-2 flex items-start gap-1 text-xs text-slate-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{station.address}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm italic text-slate-500">
            Belum ada data stasi.
          </p>
        )}
      </div>
    </section>
  );
}
