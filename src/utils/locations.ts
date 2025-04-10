import os from "os";
import path from "path";

export const ROOT_FOLDER = "./"; //path.join(os.homedir(), "AppData", "Roaming");

export const GAME_FOLDER = path.join(ROOT_FOLDER, ".creatia");

export const MODS_FOLDER = path.join(GAME_FOLDER, "mods");
export const SAVES_FOLDER = path.join(GAME_FOLDER, "saves");
export const SCHEMATIC_FOLDER = path.join(GAME_FOLDER, "schematics");
