import { AudiobookData } from "@prisma/client";
import { API_CONFIG } from "@/config/api";
import { AudiobookRepository } from "@/services/RepositoryService/AudiobookRepository";

const { BASE_URL, ENDPOINTS } = API_CONFIG.REALDEBRID;
const audiobookRepository = new AudiobookRepository();

export async function add_magnet(magneturl: string): Promise<string> {
  const add_magnet_url = `${BASE_URL}${ENDPOINTS.ADD_MAGNET}`;
  const params = new URLSearchParams({ magnet: magneturl }).toString();

  const response = await fetch(add_magnet_url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REALDEBRID_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    console.log(response);
    throw new Error("Failed to add magnet");
  }

  const data = await response.json();

  return data.id;
}

export async function download_torrent_file(
  link: string
): Promise<ArrayBuffer> {
  console.log(link);
  //TODO: Sometimes link returns a magnet: which makes link fail to be a proper url
  const url = new URL(link);
  console.log(url);
  const response = await fetch(url.toString());
  if (!response.ok) {
    console.log(response);
    throw new Error("Failed to download torrent file");
  }

  return await response.arrayBuffer();
}

//figure out how to pass bytes
// export async function add_torrent()
export async function add_torrent(torrent: ArrayBuffer): Promise<string> {
  console.log("IN ADD TORRENT");
  const add_torrent_url = `${BASE_URL}${ENDPOINTS.ADD_TORRENT}`;
  const uint8_torrent = new Uint8Array(torrent);
  const response = await fetch(add_torrent_url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.REALDEBRID_API_KEY}`,
    },
    body: uint8_torrent,
  });

  if (!response.ok) {
    console.log(response);
    throw new Error("Failed to add torrent");
  }

  const json = await response.json();
  return json.id;
}

export async function get_torrent_info(debrid_id: string) {
  const torrent_info_url = `${BASE_URL}${ENDPOINTS.GET_INFO}/${debrid_id}`;
  const response = await fetch(torrent_info_url, {
    headers: {
      Authorization: `Bearer ${process.env.REALDEBRID_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await response.json();
  return data;
}

export async function update_torrent_info() {
  const audiobooks = await audiobookRepository.findDownloading();
  const updates = await Promise.all(
    audiobooks.map(async (item) => {
      const torrent_info = await get_torrent_info(item.debrid_id);
      return {
        debrid_id: item.debrid_id,
        status: torrent_info.status,
        progress: torrent_info.progress,
      };
    })
  );
  await audiobookRepository.updateAllTorrentInfo(updates);
}

export async function select_torrent_files(
  torrent_id: string,
  files: string[] | "all" = "all"
) {
  const param_value = files === "all" ? "all" : files.join(",");
  const body = new URLSearchParams({ files: param_value }).toString();
  const torrent_info_url = `${BASE_URL}${ENDPOINTS.SELECT_FILES}/${torrent_id}`;
  const response = await fetch(torrent_info_url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REALDEBRID_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });

  if (!response.ok) {
    console.log(response);
    throw new Error("HTTP error! status code: " + response.status);
  }
}

export async function get_all_torrents() {
  await update_torrent_info();
  return await audiobookRepository.getAllFormatted();
}

export type DownloadInfo = {
  fileName: string;
  download_link: string;
};

export async function create_download_link(
  link: string
): Promise<DownloadInfo> {
  const create_download_link_url = `${BASE_URL}/unrestrict/link`;
  const body = new URLSearchParams({ link: link }).toString();

  const response = await fetch(`${create_download_link_url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REALDEBRID_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });

  if (!response.ok) {
    throw new Error("HTTP error! status code: " + response.status);
  }

  const data = await response.json();

  return {
    fileName: data.filename,
    download_link: data.download,
  };
}

export async function create_download_links(links: string[]) {
  const download_links_promise = links.map((link) => {
    return create_download_link(link);
  });

  const download_links = await Promise.all(download_links_promise);

  return download_links;
}
