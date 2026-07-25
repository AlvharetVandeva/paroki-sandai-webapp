"use client";

import { User } from "lucide-react";

interface Member {
  id: number;
  name: string;
  position: string;
  photo: string | null;
}

interface OrganizationGridProps {
  members: Member[];
}

export function OrganizationGrid({ members }: OrganizationGridProps) {
  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Struktur Organisasi
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Para pelayan dan pengurus Gereja Paroki Sandai
          </p>
        </div>

        {members.length === 0 ? (
          <p className="text-center text-sm italic text-slate-500">
            Struktur organisasi belum tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="group rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-white">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{member.position}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
