import { app, BrowserWindow, ipcMain as emitter } from "electron";
import log from "electron-log/main"
import { Client, Authenticator } from "minecraft-launcher-core";
import { Auth } from "msmc";

const authManager = new Auth("select_account")


log.initialize()
log.info('Log from the main process');
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
}

app.whenReady().then(createWindow);

emitter.on("launch-app", async () => {
  await startLauncher()
})

async function startLauncher() {

  const xboxManager = await authManager.launch("raw")

  const token = await xboxManager.getMinecraft();

  if(!token || !token.profile) {
    return console.log('Failed to get Minecraft token')
  }

  const launcher = new Client();
  
  let opts = {
      // For production launchers, I recommend not passing 
      // the getAuth function through the authorization field and instead
      // handling authentication outside before you initialize
      // MCLC so you can handle auth based errors and validation!
      authorization: token.mclc(),
      root: "./minecraft",
      version: {
          number: "1.19.3",
          type: "release"
      },
      memory: {
          max: "6G",
          min: "4G"
      }
  }
  
  //@ts-ignore
  launcher.launch(opts);
  
  launcher.on('debug', (e) => console.log(e));
  launcher.on('data', (e) => console.log(e));

}
