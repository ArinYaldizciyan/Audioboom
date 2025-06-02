// pages/api/search.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getIndexers,
  searchAudiobooks,
  flattenAndSortResults,
} from "@/services/JackettService/Jackett";

export async function GET(req: NextRequest) {
  // 1. Get the search query from the request
  const query = req.nextUrl.searchParams.get("q");
  const maxResults = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  console.log("Search query:", query);

  if (!query) {
    return NextResponse.json(
      {
        error: "Missing search term ?q=",
      },
      {
        status: 400,
      }
    );
  }

  try {
    // 2. Get all available indexers
    const indexers = await getIndexers();

    if (indexers.length === 0) {
      return NextResponse.json(
        {
          error: "No indexers available",
        },
        {
          status: 404,
        }
      );
    }

    // 3. Search all indexers for audiobooks
    const searchResults = await searchAudiobooks(indexers, query);

    // 4. Flatten and sort results by seeder count
    const sortedResults = flattenAndSortResults(searchResults, maxResults);

    // 5. Return results with metadata
    return NextResponse.json(
      {
        query,
        totalIndexersSearched: searchResults.size,
        totalResults: sortedResults.length,
        maxResults,
        results: sortedResults,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error searching for audiobooks:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("JACKETT_API_KEY")) {
        return NextResponse.json(
          {
            error: "Jackett API key not configured",
          },
          {
            status: 500,
          }
        );
      }

      if (error.message.includes("base URL")) {
        return NextResponse.json(
          {
            error: "Jackett base URL not configured",
          },
          {
            status: 500,
          }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to search for audiobooks",
      },
      {
        status: 500,
      }
    );
  }
}
