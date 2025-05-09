import { ipcRenderer, contextBridge } from "electron";

import log from "electron-log/renderer";
// "api" will be exposed just like the "window" object, to use methods from the main process in the renderer process
contextBridge.exposeInMainWorld("api", {
  launchApp: (loader: string) => ipcRenderer.send("launch-app", loader),
  log: (message: string) => log.info(message),
});
