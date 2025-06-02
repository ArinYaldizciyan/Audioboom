export const API_CONFIG = {
  REALDEBRID: {
    BASE_URL: "https://api.real-debrid.com/rest/1.0",
    ENDPOINTS: {
      ADD_MAGNET: "/torrents/addMagnet",
      ADD_TORRENT: "/torrents/addTorrent",
      GET_INFO: "/torrents/info",
      SELECT_FILES: "/torrents/selectFiles",
    },
  },
  JACKETT: {
    getBaseUrl: () => process.env.JACKETT_BASE_URL,
    ENDPOINTS: {
      ALL_INDEXERS: "/api/v2.0/indexers/all/results/torznab/api",
      SEARCH_INDEXER: "/api/v2.0/indexers/{indexerId}/results/torznab/api",
    },
    CATEGORIES: {
      AUDIOBOOK: "3030", // Standard category code for audiobooks
    },
  },
  MEDIAFLOW: {
    BASE_URL: "https://arinyaldizciyan-mediaflow-proxy.elfhosted.com", // Default local development URL
    ENDPOINTS: {
      PROXY: "/proxy/stream",
    },
  },
} as const;
