"use client";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import BookSearchCard, { BookSearchDetails } from "../BookSearchCard";
import SearchResults from "../SearchResults";
import { redirect } from "next/navigation";
import { TorznabResults } from "@/services/TorznabService/Torznab";

interface SearchResponse {
  query: string;
  totalIndexersSearched: number;
  totalResults: number;
  maxResults: number;
  results: TorznabResults[];
}

async function searchFetcher(
  url: string,
  { arg }: { arg: string }
): Promise<TorznabResults[]> {
  const response = await fetch(`${url}?q=${encodeURIComponent(arg)}`);
  if (!response.ok) {
    throw new Error("Search Failed" + response.status);
  }

  const data: SearchResponse = await response.json();

  return data.results;
}

async function add_torrent_fetcher(
  url: string,
  { arg }: { arg: { link: string; cover_edition_key: string } }
) {
  console.log(arg);
  const response = await fetch(
    `${url}${encodeURIComponent(
      arg.link
    )}&cover_edition_key=${encodeURIComponent(arg.cover_edition_key)}`,
    {
      method: "POST",
    }
  );

  return await response.json();
}

export function SearchPage() {
  const [cover_edition_key, setCoverEditionKey] = useState<string>("");

  const {
    trigger: indexerTrigger,
    data: indexerData,
    error: indexerError,
    isMutating: indexerIsLoading,
  } = useSWRMutation<TorznabResults[], Error, string, string>(
    "/api/search",
    searchFetcher
  );

  const {
    trigger: addTorrentTrigger,
    data: addTorrentData,
    error: addTorrentError,
    isMutating: addTorrentIsLoading,
  } = useSWRMutation("/api/torrents/addTorrent?link=", add_torrent_fetcher);

  const handleDownload = async (link: string) => {
    //set query params

    //Sends link through mediaflow-proxy to debrid
    const torrent_id = await addTorrentTrigger({
      link: link,
      cover_edition_key: cover_edition_key,
    });
    console.log(torrent_id);

    //Rediect to download page
    redirect("/downloads");
  };

  async function handleSearch(details: BookSearchDetails) {
    try {
      if (details.cover_edition_key) {
        setCoverEditionKey(details.cover_edition_key);
      }
      await indexerTrigger(details.search);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message || "Unknown error occurred");
      } else {
        console.log("Unknown error occurred");
      }
    }
  }

  return (
    <>
      <BookSearchCard
        handleSearch={(details: BookSearchDetails) => handleSearch(details)}
      />
      <SearchResults
        isLoading={indexerIsLoading}
        data={indexerData}
        handleDownload={handleDownload}
        downloadLoading={addTorrentIsLoading}
      />
    </>
  );
}
