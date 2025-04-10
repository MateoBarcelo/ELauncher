import {
  FabricArtifacts,
  FabricArtifactVersion,
  FabricLoaderArtifact,
  getFabricArtifacts,
  getFabricLoaderArtifact,
  installFabric,
} from "@xmcl/installer";
import { GAME_FOLDER } from "../utils/locations";

export async function loadFabric(version: string): Promise<string | undefined> {
  const fabricArtifacts: FabricArtifacts = await getFabricArtifacts();
  const fabricLoader: FabricArtifactVersion =
    fabricArtifacts.loader.find((v) => v.gameVersion === version) ||
    fabricArtifacts.loader[0];
  console.log("Fabric loader version: ", fabricLoader.version);

  let fabricLoaderArtifact: FabricLoaderArtifact | null = null;

  try {
    fabricLoaderArtifact = await getFabricLoaderArtifact(
      version,
      fabricLoader.version
    );
  } catch (e) {
    console.log("Failed to get fabric loader artifact", e);
    return undefined;
  }

  await installFabric(fabricLoaderArtifact, GAME_FOLDER);

  console.log("Installed version", `${version}-fabric${fabricLoader.version}`);

  return `${version}-fabric${fabricLoader.version}`;
}
