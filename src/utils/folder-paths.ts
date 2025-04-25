import os from "os";
import path from "path";

export const ROOT_FOLDER = "./"; //path.join(os.homedir(), "AppData", "Roaming");

export const GAME_FOLDER = path.join(ROOT_FOLDER, ".elauncher");

export const MODS_FOLDER = path.join(GAME_FOLDER, "mods");
export const SAVES_FOLDER = path.join(GAME_FOLDER, "saves");
export const SCHEMATIC_FOLDER = path.join(GAME_FOLDER, "schematics");

export const SETTINGS_FILE = path.join(GAME_FOLDER, "launcher_settings.json");

const getDefaultRootFolder = () => {
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
};
