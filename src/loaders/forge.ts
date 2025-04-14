import {
  installForge,
  getForgeVersionList,
  ForgeVersionList,
  ForgeVersion,
} from "@xmcl/installer";
import { GAME_FOLDER } from "../utils/locations";
import { agent } from "../main";

export async function loadForge(version: string): Promise<string | undefined> {
  const list: ForgeVersionList = await getForgeVersionList({
    minecraft: version,
  });

  const versionToInstall: ForgeVersion =
    list.versions.find((ver) => ver.mcversion === version) || list.versions[0];

  console.log("Forge version to install: ", versionToInstall.version);

  const gameVersion = await installForge(versionToInstall, GAME_FOLDER, {
    agent: {
      //@ts-ignore
      dispatcher: agent,
    },
  });

  return gameVersion;
}
