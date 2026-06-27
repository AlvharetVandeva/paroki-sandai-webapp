import { getAllSettings } from "@/services/site-setting.service";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const settings = await getAllSettings();
  return <SettingsClient settings={settings} />;
}
