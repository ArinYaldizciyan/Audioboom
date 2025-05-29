// pages/api/search.ts
import { NextResponse } from "next/server";
import { get_all_torrents } from "@/services/RealDebridService/RealDebrid";

export async function GET() {
  console.log("IN GET ALL TORRENTS");
  const data = await get_all_torrents();

  return NextResponse.json(data, {
    status: 200,
  });
}
