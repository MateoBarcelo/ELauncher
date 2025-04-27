import os from "os";
import path from "path";
import { getSettings } from "../config/settings";
import { LAUNCHER_GAME_FOLDER } from "./names";
import { app } from "electron";

//console.log(getSettings().gamePath);
export const SETTINGS_FILE = path.join(
  app.getPath("userData"),
  "settings.json"
);

export function getRootFolder(): string {
  const settings = getSettings();
  if (settings?.gamePath) {
    return settings.gamePath;
  }

  const platform = os.platform();
  switch (platform) {
    case "win32":
      return path.join(os.homedir(), "AppData", "Roaming");
    case "darwin":
      return path.join(os.homedir(), "Library", "Application Support");
    case "linux":
      return path.join(os.homedir(), ".local", "share");
    default:
      throw new Error("Unsupported platform: " + platform);
  }
}

export const ROOT_FOLDER = getRootFolder();

export const GAME_FOLDER = path.join(ROOT_FOLDER, LAUNCHER_GAME_FOLDER);

export const MODS_FOLDER = path.join(GAME_FOLDER, "mods");
export const SAVES_FOLDER = path.join(GAME_FOLDER, "saves");
export const SCHEMATIC_FOLDER = path.join(GAME_FOLDER, "schematics");
