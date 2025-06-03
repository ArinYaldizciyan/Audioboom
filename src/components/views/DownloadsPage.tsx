"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { Progress } from "../ui/progress";
import { useState } from "react";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { redirect } from "next/navigation";

interface TorrentData {
  id: string;
  title: string;
  debrid_id: string;
  status: string;
  progress: number;
  debrid_links: string[];
  cover_edition_key: string | null;
  date_added: string;
}

const fetcher: (url: string) => Promise<TorrentData[]> = async (
  url: string
) => {
  const res = await fetch(url);
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

export default function DownloadsPage() {
  const { data, error, isLoading } = useSWR<TorrentData[]>(
    "/api/torrents",
    fetcher,
    {
      refreshInterval: 1000 * 5,
    }
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Filter downloads based on search query
  const filteredData = data?.filter((item: TorrentData) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    if (error.message === "Unauthorized") {
      return null; // Don't show any error as we're redirecting
    }
    //return <div>Error loading downloads</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Command className="rounded-lg border shadow-md mb-4">
        <CommandInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Search your downloads..."
        />
        <CommandList className="hidden" />
      </Command>

      <ul className="flex flex-wrap w-full">
        {filteredData?.map((item: TorrentData) => (
          <li className="w-full sm:w-1/2 lg:w-1/3 p-1" key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle className="truncate">{item.title}</CardTitle>
                <CardDescription>{item.status}</CardDescription>
                <div className="h-2">
                  {item.status !== "downloaded" && (
                    <Progress value={item.progress} />
                  )}
                </div>
              </CardHeader>
              <CardFooter>
                <Button
                  disabled={item.status !== "downloaded"}
                  onClick={() =>
                    window.open(
                      `/api/torrents/downloadTorrent?id=${item.id}`,
                      "_blank"
                    )
                  }
                >
                  Download
                </Button>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
