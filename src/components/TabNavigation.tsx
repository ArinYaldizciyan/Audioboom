"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export default function TabNavigation() {
  const segment = useSelectedLayoutSegment();

  const value = segment === "downloads" ? "downloads" : "search";

  return (
    <Tabs value={value} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search" asChild>
          <Link href="/search">Search</Link>
        </TabsTrigger>
        <TabsTrigger value="downloads" asChild>
          <Link href="/downloads">Downloads</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
