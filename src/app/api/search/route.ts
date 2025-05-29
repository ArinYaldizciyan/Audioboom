// pages/api/search.ts
import { NextRequest, NextResponse } from "next/server";
import { Torznab } from "@/services/TorznabService/Torznab";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

const { BASE_URL, ENDPOINTS, CATEGORIES } = API_CONFIG.JACKETT;

export async function GET(req: NextRequest) {
  // 1. Get the search query from the request
  const query = req.nextUrl.searchParams.get("q"); // example: ?q=ubuntu
  console.log(query);
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

  // 2. Check for API key configuration
  const apiKey = process.env.JACKETT_API_KEY;
  console.log("API Key:", apiKey); // Debug log
  if (!apiKey || apiKey.trim() === "") {
    console.error("JACKETT_API_KEY is not configured");
    return NextResponse.json(
      {
        error: "JACKETT_API_KEY is not configured in environment variables",
      },
      {
        status: 500,
      }
    );
  }

  //Append &t=search and &q=<SEARCH_TERM> to the base Torznab URL
  const fullUrl = `${BASE_URL}${
    ENDPOINTS.TORZNAB
  }?apikey=${apiKey}&t=search&cat=${
    CATEGORIES.AUDIOBOOK
  }&q=${encodeURIComponent(String(query))}`;

  try {
    // 4. Fetch XML data from Jackett
    const { data: xmlData } = await axios.get(fullUrl);
    const results = await Torznab(xmlData);
    if (results) {
      return NextResponse.json(
        {
          results,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error fetching Jackett data:", error);
    // Check if it's an axios error with a response
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        {
          error: `Jackett API Error: ${error.response.status} - ${error.response.statusText}`,
        },
        {
          status: error.response.status,
        }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to fetch data from Jackett",
      },
      {
        status: 500,
      }
    );
  }
}
