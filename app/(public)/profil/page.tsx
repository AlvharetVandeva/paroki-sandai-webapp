import { Metadata } from "next";
import { getSetting } from "@/services/site-setting.service";
import { PageHeader } from "@/components/public/page-header";
import { ProfileVideo } from "@/components/public/profile-video";
import { OrganizationChart } from "@/components/public/organization-chart";

export const dynamic = "force-dynamic";
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
      <section className="mx-auto max-w-5xl px-4 pt-12 md:pt-16">
        <PageHeader
          title="Profil Paroki"
          description="Mengenal lebih dekat kehidupan dan pelayanan Gereja Paroki Sandai."
        />
      </section>
      <ProfileVideo url={profileVideoUrl} />
      <OrganizationChart imageUrl={organizationChartImage} />
      <ParishRegion />
    </>
  );
}
