import { AudiobookRepository } from "@/services/RepositoryService/AudiobookRepository";

const audiobookRepository = new AudiobookRepository();

export async function get_record(id: string) {
  return await audiobookRepository.findById(id);
}
