import path from "path";
import { GAME_FOLDER } from "../utils/locations";
import { readFileSync, writeFileSync } from "fs";

export function getStoragePath(): string {
  return path.join(GAME_FOLDER, "auth.json");
}

export function getAuthStorage() {
  try {
    const data = readFileSync(getStoragePath(), "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {
      profile: {
        id: "",
        name: "",
      },
      accessToken: "",
    };
  }
}

export function updateAuth(data: {
  profile: { id: string; name: string };
  accessToken: string;
}) {
  try {
    writeFileSync(getStoragePath(), JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save auth data", error);
  }
}
