import * as fs from "fs";
import { SETTINGS_FILE } from "../utils/folder-paths";
import servicesJson from "../resources/settings.json";

export function getSettings(): Record<string, any> {
  checkSettingsFile();

  const data = fs.readFileSync(SETTINGS_FILE(), "utf-8");
  return JSON.parse(data);
}

export function updateSettings(newSettings: Record<string, any>): void {
  checkSettingsFile();

  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  fs.writeFileSync(
    SETTINGS_FILE(),
    JSON.stringify(updatedSettings, null, 2),
    "utf-8"
  );
}

export function checkSettingsFile(): void {
  if (!fs.existsSync(SETTINGS_FILE())) {
    fs.writeFileSync(
      SETTINGS_FILE(),
      JSON.stringify(servicesJson, null, 2),
      "utf-8"
    );
  }
}
