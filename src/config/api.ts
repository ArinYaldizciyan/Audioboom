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
    BASE_URL: "https://arinyaldizciyan-jackett.elfhosted.com",
    ENDPOINTS: {
      TORZNAB: "/api/v2.0/indexers/all/results/torznab/api",
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
