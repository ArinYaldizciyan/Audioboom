import xml2js from 'xml2js';

export interface TorznabResults {
    title : string;
    link: string;
    comments: string;
    magneturl: string;
    seeders: string;
}


export async function Torznab(xmlData: string): Promise<TorznabResults[]>{

    // 5. Parse the XML using xml2js
    const parsedResult = await xml2js.parseStringPromise(xmlData);

    // 6. The Torznab RSS items are usually at: parsedResult.rss.channel[0].item
    const items = parsedResult?.rss?.channel?.[0]?.item || [];

    // 7. Transform them into a simpler JSON structure for the frontend
    //    We'll pick out a few fields (title, link, seeders, etc.)
    const results: TorznabResults[] = items.map((item: any) => {
      const title = item.title?.[0] || '';
      const link = item.enclosure?.[0].$.url || '';
      const comments = item.comments?.[0] || '';
      const magneturl = item.magneturl?.[0] || '';
      // Torznab attributes appear as item['torznab:attr'] with name/value
      const torznabAttrs = item['torznab:attr'] || [];
      // Let's pick out seeders, size, or any other attributes you care about
      const seedersAttr = torznabAttrs.find(
        (attr: any) => attr.$.name === 'seeders'
      );
      const seeders = seedersAttr ? seedersAttr.$.value : null;

      return {
        title,
        link,
        comments,
        magneturl,
        seeders
        };
    });

    return results
}