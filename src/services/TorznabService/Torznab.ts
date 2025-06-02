import xml2js from "xml2js";

export interface TorznabResults {
  title: string;
  link: string;
  comments: string;
  magneturl: string;
  seeders: number;
  indexerId?: string; // Optional field to track source indexer
}

export interface TorznabIndexer {
  id: string;
  categories: Map<number, string>;
}

export async function ParseTorznabResults(
  xmlData: string
): Promise<TorznabResults[]> {
  // 5. Parse the XML using xml2js
  const parsedResult = await xml2js.parseStringPromise(xmlData);

  // 6. The Torznab RSS items are usually at: parsedResult.rss.channel[0].item
  const items = parsedResult?.rss?.channel?.[0]?.item || [];

  // 7. Transform them into a simpler JSON structure for the frontend
  //    We'll pick out a few fields (title, link, seeders, etc.)
  const results: TorznabResults[] = items.map((item: any) => {
    const title = item.title?.[0] || "";
    const link = item.enclosure?.[0].$.url || "";
    const comments = item.comments?.[0] || "";
    const magneturl = item.magneturl?.[0] || "";
    // Torznab attributes appear as item['torznab:attr'] with name/value
    const torznabAttrs = item["torznab:attr"] || [];
    // Let's pick out seeders, size, or any other attributes you care about
    const seedersAttr = torznabAttrs.find(
      (attr: any) => attr.$.name === "seeders"
    );
    const seeders = seedersAttr ? parseInt(seedersAttr.$.value) || 0 : 0;

    return {
      title,
      link,
      comments,
      magneturl,
      seeders,
    };
  });

  return results;
}

export async function ParseTorznabIndexers(
  xmlData: string
): Promise<TorznabIndexer[]> {
  const parsedResult = await xml2js.parseStringPromise(xmlData);
  const items = parsedResult?.indexers?.indexer || [];

  const results: TorznabIndexer[] = items.map((item: any) => {
    // Extract indexer id and name
    const indexerId = item.$.id;
    const name = item.title?.[0] || indexerId;

    // Parse categories from caps
    const categories = new Map<number, string>();

    // Navigate to categories: item.caps[0].categories[0].category
    const caps = item.caps?.[0];
    const categoryList = caps?.categories?.[0]?.category || [];

    // Flatten parent and child categories
    categoryList.forEach((category: any) => {
      // Add parent category
      const parentId = parseInt(category.$.id);
      const parentName = category.$.name;
      categories.set(parentId, parentName);

      // Add subcategories if they exist
      const subcats = category.subcat || [];
      subcats.forEach((subcat: any) => {
        const subcatId = parseInt(subcat.$.id);
        const subcatName = subcat.$.name;
        categories.set(subcatId, subcatName);
      });
    });

    return {
      id: indexerId,
      categories,
    };
  });

  return results;
}
