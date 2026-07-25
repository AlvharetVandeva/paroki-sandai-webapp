import { Metadata } from "next";
import { getSetting } from "@/services/site-setting.service";
import { getAllMembers } from "@/services/organization.service";
import { ProfileVideo } from "@/components/public/profile-video";
import { OrganizationGrid } from "@/components/public/organization-grid";

export const metadata: Metadata = {
  title: "Profil Paroki | Paroki Sandai",
  description:
    "Profil Gereja Katolik Paroki Sandai — video profil dan struktur organisasi pelayan paroki.",
};

export default async function ProfilPage() {
  const profileVideoUrl = await getSetting("profileVideoUrl");
  const members = await getAllMembers();

  return (
    <>
      <ProfileVideo url={profileVideoUrl} />
      <OrganizationGrid members={members} />
    </>
  );
}
