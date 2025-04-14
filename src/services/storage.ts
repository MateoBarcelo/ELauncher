import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { GAME_FOLDER } from "../utils/locations";

const streamPipeline = promisify(pipeline);

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const BUCKET_NAME = process.env.R2_BUCKET_MODS || "";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function listBuckets() {
  try {
    const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const response = await S3.send(command);
    return response;
  } catch (error) {
    console.error("Error listing buckets:", error);
    throw error;
  }
}

export async function downloadMods() {
  const modList = await S3.send(
    new ListObjectsV2Command({ Bucket: BUCKET_NAME })
  );

  if (!modList.Contents || modList.Contents.length === 0) {
    console.log("No mods found, skipping...");
    return;
  }

  for (const file of modList.Contents) {
    const fileName = file.Key;
    const dest = path.join(GAME_FOLDER, fileName || "");

    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);

      const fileSize = file.Size || 0;

      if (stats.size === fileSize) {
        continue;
      }
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const response = await S3.send(command);

    const streamBody = response.Body;

    if (response.Body) {
      await streamPipeline(
        streamBody as NodeJS.ReadableStream,
        fs.createWriteStream(GAME_FOLDER + `/${fileName}`)
      );
      console.log(`Downloaded ${fileName}`);
    } else {
      console.error(`Failed to download ${fileName}`);
    }
  }
}
