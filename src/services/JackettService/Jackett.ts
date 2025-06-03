import { ParseTorznabResults } from "@/services/TorznabService/Torznab";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import {
  ParseTorznabIndexers,
  TorznabIndexer,
  TorznabResults,
} from "@/services/TorznabService/Torznab";
const { getBaseUrl, ENDPOINTS } = API_CONFIG.JACKETT;

interface JackettSearchParams {
  indexerId: string;
  searchTerm: string;
  categories: number[];
}

function getApiKey(): string {
  const apiKey = process.env.JACKETT_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("JACKETT_API_KEY is not configured");
  }
  return apiKey;
}

export class JackettURLBuilder {
  private static getBaseUrl(): string {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      throw new Error("Jackett base URL is not configured");
    }
    return baseUrl;
  }

  static buildIndexersUrl(): string {
    const baseUrl = this.getBaseUrl();
    const endpoint = ENDPOINTS.ALL_INDEXERS;

    const searchParams = new URLSearchParams({
      apikey: getApiKey(),
      t: "indexers",
    });

    searchParams.append("configured", "true");

    return `${baseUrl}${endpoint}?${searchParams.toString()}`;
  }

  static buildSearchUrl(params: JackettSearchParams): string {
    const baseUrl = this.getBaseUrl();
    const endpoint = ENDPOINTS.SEARCH_INDEXER.replace(
      "{indexerId}",
      params.indexerId
    );
    console.log(endpoint);

    const searchParams = new URLSearchParams({
      apikey: getApiKey(),
      t: "search",
      q: params.searchTerm,
    });

    if (params.categories.length > 0) {
      searchParams.append("cat", params.categories.join(","));
    }

    return `${baseUrl}${endpoint}?${searchParams.toString()}`;
  }

  static buildMultipleSearchUrl(
    indexerIds: string[],
    searchTerm: string,
    categories: number[]
  ): string[] {
    return indexerIds.map((indexerId) =>
      this.buildSearchUrl({
        indexerId,
        searchTerm,
        categories,
      })
    );
  }
}

export async function getIndexers(): Promise<TorznabIndexer[]> {
  const url = JackettURLBuilder.buildIndexersUrl();

  try {
    const { data: indexers } = await axios.get(url);
    const results = await ParseTorznabIndexers(indexers);
    return results;
  } catch (error) {
    console.error("Failed to fetch indexers:", error);
    throw error;
  }
}

export async function searchIndexer(
  indexerId: string,
  searchTerm: string,
  categories: number[]
): Promise<TorznabResults[]> {
  const url = JackettURLBuilder.buildSearchUrl({
    indexerId,
    searchTerm,
    categories,
  });
  console.log(url);

  try {
    const { data } = await axios.get(url);
    return await ParseTorznabResults(data);
  } catch (error) {
    console.error(`Failed to search indexer ${indexerId}:`, error);
    throw error;
  }
}

// Search multiple indexers for audiobooks
export async function searchAudiobooks(
  indexers: TorznabIndexer[],
  searchTerm: string
): Promise<Map<string, TorznabResults[]>> {
  const results = new Map<string, TorznabResults[]>();

  console.log("Indexers in SearchAudiobooks");
  console.log(indexers);
  // Find audiobook categories for each indexer
  const searchPromises = indexers.map(async (indexer) => {
    //TODO: Consider that some categories are "Audio Book and others are audiobook"
    const audiobookCategories = findCategoriesByName(indexer, [
      "audiobook",
      "audio book",
    ]);
    console.log(audiobookCategories);
    if (audiobookCategories.length > 0) {
      try {
        console.log("Searching indexer", indexer.id);
        const indexerResults = await searchIndexer(
          indexer.id,
          searchTerm,
          audiobookCategories
        );
        results.set(indexer.id, indexerResults);
      } catch (error) {
        console.error(`Search failed for indexer ${indexer.id}:`, error);
        results.set(indexer.id, []);
      }
    }
  });

  await Promise.all(searchPromises);
  return results;
}

function findCategoriesByName(
  indexer: TorznabIndexer,
  searchTerms: string[]
): number[] {
  const results: number[] = [];
  const terms = searchTerms.map((term) => term.toLowerCase());

  indexer.categories.forEach((name, id) => {
    const categoryName = name.toLowerCase();
    // Check if the category name includes any of the search terms
    if (terms.some((term) => categoryName.includes(term))) {
      results.push(id);
    }
  });

  return results;
}

// Helper function to flatten and sort search results
export function flattenAndSortResults(
  searchResults: Map<string, TorznabResults[]>,
  maxResults: number = 20
): TorznabResults[] {
  // Flatten all results from all indexers
  const allResults: TorznabResults[] = [];

  searchResults.forEach((results, indexerId) => {
    // Add indexer info to each result for tracking
    const resultsWithIndexer = results.map((result) => ({
      ...result,
      indexerId, // Add source indexer for reference
    }));
    allResults.push(...resultsWithIndexer);
  });

  // Sort by seeder count (descending) - much simpler now!
  const sortedResults = allResults.sort((a, b) => b.seeders - a.seeders);

  // Return top n results
  return sortedResults.slice(0, maxResults);
}

/**
 * Usage Examples:
 *
 * // Basic search with default limit (20)
 * GET /api/search?q=Harry Potter
 *
 * // Search with custom limit
 * GET /api/search?q=Harry Potter&limit=50
 *
 * // Response format:
 * {
 *   "query": "Harry Potter",
 *   "totalIndexersSearched": 5,
 *   "totalResults": 15,
 *   "maxResults": 20,
 *   "results": [
 *     {
 *       "title": "Harry Potter Audiobook Collection",
 *       "link": "https://...",
 *       "magneturl": "magnet:?xt=...",
 *       "seeders": "150",
 *       "indexerId": "audiobookbay"
 *     }
 *   ]
 * }
 */
