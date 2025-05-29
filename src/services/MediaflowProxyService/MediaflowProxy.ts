import { API_CONFIG } from "@/config/api";

const { BASE_URL, ENDPOINTS } = API_CONFIG.MEDIAFLOW;

export async function proxy_stream(link: string) {
  const proxyUrl = `${BASE_URL}${ENDPOINTS.PROXY}`;
  // Add your proxy implementation here
}
