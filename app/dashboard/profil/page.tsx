import { getSetting } from "@/services/site-setting.service";
import { getParishCenter, getStations } from "@/services/organization.service";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
  const videoUrl = (await getSetting("profileVideoUrl")) ?? "";
  const chartUrl = (await getSetting("organizationChartImage")) ?? "";

  const center = await getParishCenter();
  const stations = await getStations();

  return (
    <ProfilClient
      videoUrl={videoUrl}
      chartUrl={chartUrl}
      center={center}
      stations={stations}
    />
  );
}
