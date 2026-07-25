import Link from "next/link";

const footerLinks = [
  { href: "/jadwal", label: "Jadwal Pelayanan" },
  { href: "/profil", label: "Profil Paroki" },
  { href: "/sakramen", label: "Informasi Sakramen" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/hubungi", label: "Hubungi Kami" },
];

export function PublicFooter({ settings }: { settings: Record<string, string> }) {
  const siteName = settings.siteName || "Paroki Sandai";
  const address = settings.address || "Sandai, Ketapang, Kalimantan Barat";
  const phone = settings.phone || "-";
  const email = settings.email || "-";

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold text-white">{siteName}</h2>
          <p className="mt-4 text-slate-300">{address}</p>
          <div className="mt-4 space-y-1 text-sm text-slate-400">
            <p>Telepon: {phone}</p>
            <p>Email: {email}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Navigasi</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-300 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Sosial Media</h3>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {settings.socialMediaFacebook && (
              <a className="text-slate-300 hover:text-white" href={settings.socialMediaFacebook}>Facebook</a>
            )}
            {settings.socialMediaInstagram && (
              <a className="text-slate-300 hover:text-white" href={settings.socialMediaInstagram}>Instagram</a>
            )}
            {settings.socialMediaYoutube && (
              <a className="text-slate-300 hover:text-white" href={settings.socialMediaYoutube}>YouTube</a>
            )}
          </div>
          {settings.mapEmbedUrl && (
            <iframe
              src={settings.mapEmbedUrl}
              title="Peta lokasi Paroki Sandai"
              className="mt-6 h-44 w-full rounded-2xl border-0"
              loading="lazy"
            />
          )}
        </div>
      </div>
      <div className="border-t border-slate-800 px-6 py-5 text-center text-sm text-slate-500 space-y-1">
        <p>© {new Date().getFullYear()} {siteName}. Semua hak dilindungi.</p>
        <p>Made with ❤️ Mahasiswa KKN UAJY 89 2026 - kelompok 75</p>
      </div>
    </footer>
  );
}
