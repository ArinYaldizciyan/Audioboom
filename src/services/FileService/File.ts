import { mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import archiver from "archiver";
import {
  create_download_link,
  create_download_links,
} from "@/services/RealDebridService/RealDebrid";
import { DownloadInfo } from "@/services/RealDebridService/RealDebrid";
const storageDir = "/app/storage";

export const create_dir = async (debrid_id: string) => {
  await mkdir(`${storageDir}/${debrid_id}`, { recursive: true });
};

export const archive = async (links: string[], debrid_id: string) => {
  const downloadable_links = await create_download_links(links);
  console.log(downloadable_links);
  console.log(`${storageDir}/${debrid_id}`);
  const targetDir = path.join(storageDir, debrid_id);
  create_dir(debrid_id);

  const download_file_promise = downloadable_links.map((download_info) => {
    return downloadFile(download_info, debrid_id);
  });

  await Promise.all(download_file_promise);

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    throw err;
  });

  // Add each downloaded file into the archive
  for (const file of downloadable_links) {
    archive.file(path.join(targetDir, file.fileName), { name: file.fileName });
  }

  archive.on("end", () => {});

  archive.finalize();

  return archive;
};

export function whatwgToNodeStream(
  whatwgStream: ReadableStream<Uint8Array> | null
) {
  if (!whatwgStream) {
    throw new Error("whatwgStream is null");
  }
  const reader = whatwgStream.getReader();

  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.destroy(err);
        } else {
          this.destroy(new Error(String(err)));
        }
      }
    },
  });
}

// Helper function to download one file
async function downloadFile(download_info: DownloadInfo, debrid_id: string) {
  const file_path = path.join(storageDir, debrid_id, download_info.fileName);
  console.log(download_info.download_link);
  const response = await fetch(new URL(download_info.download_link));
  if (!response.ok) {
    throw new Error(
      `Download failed for ${download_info.download_link} – status ${response.status}`
    );
  }

  const nodeStream = whatwgToNodeStream(response.body);
  const fileStream = fs.createWriteStream(file_path);
  await new Promise<void>((resolve, reject) => {
    nodeStream.pipe(fileStream);
    nodeStream.on("error", reject);
    fileStream.on("finish", () => {
      resolve();
    });
  });
}

export function nodeToWebStream(nodeStream: Readable) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      // When the Node stream emits data, enqueue it in the Web Stream
      nodeStream.on("data", (chunk) => {
        // Ensure it's a Uint8Array (archiver should emit Buffer chunks)
        controller.enqueue(new Uint8Array(chunk));
      });

      // When the Node stream ends, close the controller
      nodeStream.on("end", () => {
        controller.close();
      });

      // If the Node stream errors, report that to the controller
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    // If the consumer of the Web Stream cancels, destroy the Node stream
    cancel() {
      nodeStream.destroy();
    },
  });
}
