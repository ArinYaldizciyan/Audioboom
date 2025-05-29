// pages/api/search.ts
import { NextRequest, NextResponse } from "next/server";
import { get_all_torrents } from "@/services/RealDebridService/RealDebrid";
import { AudiobookRepository } from "@/services/RepositoryService/AudiobookRepository";

const audiobookRepository = new AudiobookRepository();

export async function DELETE(req: NextRequest) {
  console.log("IN DELETE TORRENT");

  const { id } = await req.json();

  const audiobook = await audiobookRepository.delete(id);

  return NextResponse.json(
    {
      message: "Record deleted successfully",
    },
    {
      status: 200,
    }
  );
}
