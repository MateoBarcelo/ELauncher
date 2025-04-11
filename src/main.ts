import { app, BrowserWindow, ipcMain as emitter } from "electron";
import log from "electron-log/main";
import { Auth } from "msmc";
import {
  getVersionList,
  MinecraftVersion,
  install,
  installFabric,
  getFabricArtifacts,
  FabricArtifacts,
  FabricArtifactVersion,
  FabricLoaderArtifact,
  getFabricLoaderArtifact,
  installDependencies,
} from "@xmcl/installer";
import { launch, MinecraftLocation, Version } from "@xmcl/core";
import { GAME_FOLDER } from "./utils/locations";
import { copyMods } from "./utils/mod-extractor";
import { Agent } from "undici";
import { loadFabric } from "./loaders/fabric";
import { loadNeoforge } from "./loaders/neoforge";
import { loadForge } from "./loaders/forge";

const authManager = new Auth("select_account");

const GAME_VERSION = "1.20.2";

//This download agent is so important, without it, the download will be very slow and sometimes fail
export const agent = new Agent({
  connections: 16,
});

log.initialize();
log.info("Log from the main process");
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + "/preload.js",
    },
  });

  win.loadFile("./index.html");
};

app.whenReady().then(createWindow);

emitter.on("launch-app", async (e, loader) => {
  console.log("Launching app", loader);
  await start(loader);
});

async function start(loader: string) {
  const list: MinecraftVersion[] = (await getVersionList()).versions;
  const aVersion: MinecraftVersion =
    list.find((v) => v.id == GAME_VERSION) || list[0]; // i just pick the first version in list here

  const xboxManager = await authManager.launch("raw");

  const token = await xboxManager.getMinecraft();

  if (!token || !token.profile) {
    return console.log("Failed to get Minecraft token");
  }

  console.log("Downloading Minecraft", aVersion.id);
  await install(aVersion, GAME_FOLDER, {
    agent: {
      //@ts-ignore
      dispatcher: agent,
    },
  });
  console.log("Installed Minecraft");

  copyMods();

  let gameVersion;

  switch (loader) {
    case "fabric":
      gameVersion = await loadFabric(GAME_VERSION);
      break;
    case "forge":
      gameVersion = await loadForge(GAME_VERSION);
      break;
    case "neoforge":
      gameVersion = await loadNeoforge(GAME_VERSION);
      break;
    default:
      gameVersion = GAME_VERSION;
  }

  console.log("Game version", gameVersion);

  if (!gameVersion) {
    return console.log("Failed to install fabric loader");
  }

  try {
    await installDependencies(await Version.parse(GAME_FOLDER, gameVersion), {
      agent: {
        //@ts-ignore
        dispatcher: agent,
      },
    });
  } catch (e) {
    console.log("Failed to install dependencies", e);
    return;
  }

  console.log("Installed dependencies");
  await launch({
    accessToken: token.mcToken,
    gameProfile: {
      id: token.profile.id,
      name: token.profile.name,
    },
    version: gameVersion,
    gamePath: GAME_FOLDER,
    javaPath: "C:/Program Files/Java/jdk-21/bin/java.exe",
  });
  console.log("Installed");
}
