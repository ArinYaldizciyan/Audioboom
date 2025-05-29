import { create_download_links } from "@/services/RealDebridService/RealDebrid";
import archiver from "archiver";
import { whatwgToNodeStream } from "@/services/FileService/File";
import { NextRequest, NextResponse } from "next/server";
import { PassThrough } from "stream";
import { AudiobookRepository } from "@/services/RepositoryService/AudiobookRepository";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const audiobookRepository = new AudiobookRepository();

  if (!id) {
    return new NextResponse("No id provided", { status: 400 });
  }

  const recordInfo = await audiobookRepository.findById(id);

  if (!recordInfo) {
    return new NextResponse("Record not found", { status: 404 });
  }

  if (recordInfo?.debrid_id.length === 0) {
    return new NextResponse("No links found", { status: 404 });
  }

  const downloadable_links = await create_download_links(
    recordInfo.debrid_links
  );

  const { readable, writable } = new TransformStream();

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    archive.abort();
    throw err;
  });

  const passThrough = new PassThrough();
  archive.pipe(passThrough);

  passThrough.on("error", (err) => {
    console.error("PassThrough Error", err);
    archive.abort();
  });

  //handle abort
  req.signal.onabort = () => {
    console.log("Aborted");
    archive.abort();
  };

  (async () => {
    try {
      const writer = writable.getWriter();
      for await (const chunk of passThrough) {
        const uint8 = new Uint8Array(chunk);
        writer.write(uint8);
      }
      await writer.close();
    } catch (err) {
      console.error("Writable Error", err);
      archive.abort();
    }
  })().catch((err) => {
    console.error("Pipeline Error", err);
  });

  for (const link of downloadable_links) {
    const response = await fetch(link.download_link);
    if (!response.ok) {
      throw new Error(
        `Download failed for ${link.download_link} – status ${response.status}`
      );
    }

    const nodeStream = whatwgToNodeStream(response.body);
    archive.append(nodeStream, { name: link.fileName });
  }

  archive.finalize();

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=${recordInfo.title}.zip`,
    },
  });
}
