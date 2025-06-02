// pages/api/search.ts
import { NextRequest, NextResponse } from "next/server";
import {
  add_magnet,
  add_torrent,
  download_torrent_file,
  get_torrent_info,
  select_torrent_files,
} from "@/services/RealDebridService/RealDebrid";
import { get_book_info } from "@/services/OpenLibraryService/OpenLibrary";
import { AudiobookRepository } from "@/services/RepositoryService/AudiobookRepository";

const audiobookRepository = new AudiobookRepository();

export async function POST(req: NextRequest) {
  // 1. Get the search query from the request
  const link = req.nextUrl.searchParams.get("link");
  const cover_edition_key = req.nextUrl.searchParams.get("cover_edition_key");
  console.log("IN POST");
  console.log(link);
  if (!link) {
    return new NextResponse("No link provided", { status: 400 });
  }

  //TODO: Handle case where link is IMMEDIATELY a magnet link. Where no redirect is needed.
  try {
    let torrent_id = "";

    // Check if the link is already a magnet link
    if (link.startsWith("magnet:")) {
      console.log("Direct magnet link detected");
      torrent_id = await add_magnet(link);
    } else {
      // Handle HTTP/HTTPS links that might redirect to magnets or torrent files
      const response = await fetch(link, {
        redirect: "manual",
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        console.log(location);
        if (location?.startsWith("magnet:")) {
          const magnet = location;
          torrent_id = await add_magnet(magnet);
        } else {
          const torrent_file = await download_torrent_file(link);
          torrent_id = await add_torrent(torrent_file);
        }
      } else {
        console.log("NOT REDIRECT");
        console.log(response);
        // Direct torrent file download
        const torrent_file = await download_torrent_file(link);
        torrent_id = await add_torrent(torrent_file);
      }
    }
    await select_torrent_files(torrent_id);
    const torrent_info = await get_torrent_info(torrent_id);
    let book_title = torrent_info.filename;
    if (cover_edition_key) {
      const book_info = await get_book_info(cover_edition_key);
      book_title = book_info.title;
    }

    const existing_book = await audiobookRepository.findByDebridId(torrent_id);
    if (existing_book) {
      console.log("EXISTING BOOK");
      //Torrent already added
      return NextResponse.json(
        {
          id: existing_book.id,
        },
        {
          status: 200,
        }
      );
    } else {
      console.log("NEW BOOK");
      //Might want to do this after the torrent is finished downloading
      //await create_dir(torrent_id)
      const audiobook = await audiobookRepository.create({
        title: book_title,
        debrid_id: torrent_id,
        status: torrent_info.status,
        progress: torrent_info.progress,
        debrid_links: torrent_info.links,
      });
    }

    //TODO: ID not needed in response, store it in DB
    return NextResponse.json(
      {
        id: torrent_id,
      },
      {
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("Error adding torrent:", err);
    return NextResponse.json(
      { error: "Failed to add torrent" },
      {
        status: 500,
      }
    );
  }
}
