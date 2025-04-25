require("dotenv").config();
import { launch, Version } from "@xmcl/core";
import {
  getVersionList,
  install,
  installDependencies,
  MinecraftVersion,
} from "@xmcl/installer";
import { app, BrowserWindow, ipcMain as emitter } from "electron";
import log from "electron-log/main";
import { Agent } from "undici";
import { auth } from "./auth/auth-manager";
import { loadFabric } from "./loaders/fabric";
import { loadForge } from "./loaders/forge";
import { loadNeoforge } from "./loaders/neoforge";
import { downloadInstance } from "./services/storage";
import { GAME_FOLDER } from "./utils/folder-paths";
import { getVersionConfig } from "./config/config-loader";
import { getSettings } from "./config/settings";

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
  // Load config
  const versionConfig = await getVersionConfig();

  const launcherSettings = getSettings();

  console.log("Launcher settings", launcherSettings);

  if (!versionConfig) {
    console.log("Failed to load version config");
    return;
  }

  const GAME_VERSION = versionConfig.version;

  //Minecraft version
  const list: MinecraftVersion[] = (await getVersionList()).versions;
  const aVersion: MinecraftVersion =
    list.find((v) => v.id == GAME_VERSION) || list[0]; // i just pick the first version in list here

  const authentication = await auth();

  console.log("Downloading Minecraft", aVersion.id);
  await install(aVersion, GAME_FOLDER, {
    agent: {
      //@ts-ignore
      dispatcher: agent,
    },
  });

  await downloadInstance();

  let gameVersion;

  switch (loader) {
    case "fabric":
      gameVersion = await loadFabric(
        GAME_VERSION,
        versionConfig.modLoaderVersion
      );
      break;
    case "forge":
      gameVersion = await loadForge(
        GAME_VERSION,
        versionConfig.modLoaderVersion
      );
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
    accessToken: authentication.accessToken,
    gameProfile: {
      id: authentication.profile.id,
      name: authentication.profile.name,
    },
    version: gameVersion,
    gamePath: GAME_FOLDER,
    javaPath: launcherSettings.javaPath,
  });
  console.log("Installed");
}
