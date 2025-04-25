import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { GAME_FOLDER } from "../utils/folder-paths";

const streamPipeline = promisify(pipeline);

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
export const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";

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

export async function getBucketContent(bucketName: string) {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const response = await S3.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error("Error getting bucket content:", error);
    throw error;
  }
}

export async function getContent(bucketName: string, path: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: path,
    });
    const response = await S3.send(command);

    if (response.Body) {
      const streamBody = response.Body as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];

      for await (const chunk of streamBody) {
        chunks.push(chunk as Buffer);
      }

      return Buffer.concat(chunks).toString("utf-8");
    } else {
      console.error(`Failed to get file content for ${path}`);
      return null;
    }
  } catch (error) {
    console.error("Error getting file content:", error);
    throw error;
  }
}

export async function downloadContent(
  bucketName: string,
  path: string,
  destination: string
) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: path,
    });
    const response = await S3.send(command);

    if (response.Body) {
      const streamBody = response.Body as NodeJS.ReadableStream;
      const writeStream = fs.createWriteStream(destination);
      await streamPipeline(streamBody, writeStream);
      console.log(`Downloaded ${path} to ${destination}`);
    } else {
      console.error(`Failed to download file ${path}`);
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

export async function downloadInstance() {
  const bucketContent = await getBucketContent(BUCKET_NAME);

  const instanceContent = bucketContent.filter((file) => {
    return file.Key?.startsWith("instance/");
  });

  if (!instanceContent || instanceContent.length === 0) {
    console.log("No mods found, skipping...");
    return;
  }

  for (const file of instanceContent) {
    const fileName = file.Key || "";
    const dest = path.join(GAME_FOLDER, fileName.replace("instance/", ""));

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

    await downloadContent(BUCKET_NAME, fileName || "", dest);
  }
}
