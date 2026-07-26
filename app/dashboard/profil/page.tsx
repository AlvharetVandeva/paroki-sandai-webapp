import { getSetting } from "@/services/site-setting.service";
import { getParishCenter, getStations } from "@/services/organization.service";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
  const videoUrl = (await getSetting("profileVideoUrl")) ?? "";
  const chartUrl = (await getSetting("organizationChartImage")) ?? "";
  const statJiwa = (await getSetting("statJiwa")) ?? "0";
  const statKK = (await getSetting("statKK")) ?? "0";
  const statTahunPelayanan = (await getSetting("statTahunPelayanan")) ?? "";
  const pastorPhoto = (await getSetting("pastorPhoto")) ?? "";
  const pastorGreeting = (await getSetting("pastorGreeting")) ?? "";
  const pastorName = (await getSetting("pastorName")) ?? "";
  const pastorTitle = (await getSetting("pastorTitle")) ?? "";

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
      pastorPhoto={pastorPhoto}
      pastorGreeting={pastorGreeting}
      pastorName={pastorName}
      pastorTitle={pastorTitle}
    />
  );
}
