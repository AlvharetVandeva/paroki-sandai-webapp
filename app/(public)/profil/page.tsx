import { Metadata } from "next";
import { getSetting } from "@/services/site-setting.service";
import { ProfileVideo } from "@/components/public/profile-video";
import { OrganizationChart } from "@/components/public/organization-chart";
import { ParishRegion } from "@/components/public/parish-region";

export const metadata: Metadata = {
  title: "Profil Paroki | Paroki Sandai",
  description:
    "Profil Gereja Katolik Paroki Sandai — video profil, struktur organisasi, dan wilayah pelayanan.",
};

export default async function ProfilPage() {
  const profileVideoUrl = await getSetting("profileVideoUrl");
  const organizationChartImage = await getSetting("organizationChartImage");

  return (
    <>
      <ProfileVideo url={profileVideoUrl} />
      <OrganizationChart imageUrl={organizationChartImage} />
      <ParishRegion />
    </>
  );
}
