import { getSetting } from "@/services/site-setting.service";
import { getAllMembers } from "@/services/organization.service";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
  const videoUrl = (await getSetting("profileVideoUrl")) ?? "";
  const members = await getAllMembers();

  return <ProfilClient videoUrl={videoUrl} members={members} />;
}
