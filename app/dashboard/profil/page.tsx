import { getSetting } from "@/services/site-setting.service";
import { getParishCenter, getStations } from "@/services/organization.service";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
  const videoUrl = (await getSetting("profileVideoUrl")) ?? "";
  const chartUrl = (await getSetting("organizationChartImage")) ?? "";
  const statJiwa = (await getSetting("statJiwa")) ?? "0";
  const statKK = (await getSetting("statKK")) ?? "0";
  const statTahunPelayanan = (await getSetting("statTahunPelayanan")) ?? "";

  const center = await getParishCenter();
  const stations = await getStations();

  return (
    <ProfilClient
      videoUrl={videoUrl}
      chartUrl={chartUrl}
      center={center}
      stations={stations}
      statJiwa={statJiwa}
      statKK={statKK}
      statTahunPelayanan={statTahunPelayanan}
    />
  );
}
