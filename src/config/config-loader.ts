import { BUCKET_NAME, getContent } from "../services/storage";

export interface Config {
  version: string;
  modLoader: string;
  modLoaderVersion: string;
}

export async function getVersionConfig(): Promise<Config> {
  let config: any = {};

  try {
    config = await getContent(BUCKET_NAME, "config/versions.json");

    return JSON.parse(config);
  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
}

export async function getWhitelist(): Promise<string[]> {
  let config: any = {};

  try {
    config = await getContent(BUCKET_NAME, "config/whitelist.txt");

    const players = config.split("\n").map((line: string) => line.trim());
    return players;
  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
}
