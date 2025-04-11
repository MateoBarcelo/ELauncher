import path from "path";
import fs from "fs";
import os from "os";
import process from "process";
import { MODS_FOLDER } from "./locations";

const destinationPath = MODS_FOLDER;
const sourcePath = path.join(process.cwd(), "./src/resources", "mods"); //path.join(process.resourcesPath, "mods");

const createDestinationPath = () => {
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }
};

export const insertMods = () => {
  createDestinationPath();
  console.log("Copying mods from resources to mods folder...");
  console.log(`Source path: ${sourcePath}`);
  console.log(`Destination path: ${destinationPath}`);

  const files = fs.readdirSync(sourcePath);
  files.forEach((file) => {
    const sourceFile = path.join(sourcePath, file);
    const destFile = path.join(destinationPath, file);
    if (!fs.existsSync(destFile)) {
      fs.copyFileSync(sourceFile, destFile);
      console.log(`Copied ${file} to ${destinationPath}`);
    }
  });
};
