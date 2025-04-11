import { installNeoForged } from "@xmcl/installer";
import { GAME_FOLDER } from "../utils/locations";
import { Agent } from "undici";

export async function loadNeoforge(
  version: string
): Promise<string | undefined> {
  const neoForgeVersion = "";
  const agent = new Agent({
    connections: 8,
  });

  // add suport for neoforge version list
  const ver = await installNeoForged("neoforge", "20.2.88", GAME_FOLDER, {
    agent: {
      //@ts-ignore
      dispatcher: agent,
    },
  });

  console.log(ver);
  return ver;
}
