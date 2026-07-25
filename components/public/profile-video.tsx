"use client";

interface ProfileVideoProps {
  url: string | null;
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export function ProfileVideo({ url }: ProfileVideoProps) {
  if (!url) return null;

  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Video Profil
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Mengenal lebih dekat kehidupan Gereja Paroki Sandai
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="Video Profil Paroki Sandai"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
