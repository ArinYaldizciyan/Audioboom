import prisma from "@/lib/prisma";
import { AudiobookData, Prisma } from "@prisma/client";

export class AudiobookRepository {
  async findById(id: string): Promise<AudiobookData | null> {
    return prisma.audiobookData.findUnique({
      where: { id },
    });
  }

  async findByDebridId(debridId: string): Promise<AudiobookData | null> {
    return prisma.audiobookData.findUnique({
      where: { debrid_id: debridId },
    });
  }

  async findAll(): Promise<AudiobookData[]> {
    return prisma.audiobookData.findMany();
  }

  async create(data: Prisma.AudiobookDataCreateInput): Promise<AudiobookData> {
    return prisma.audiobookData.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.AudiobookDataUpdateInput
  ): Promise<AudiobookData> {
    return prisma.audiobookData.update({
      where: { id },
      data,
    });
  }

  async updateByDebridId(
    debridId: string,
    data: Prisma.AudiobookDataUpdateInput
  ): Promise<AudiobookData> {
    return prisma.audiobookData.update({
      where: { debrid_id: debridId },
      data,
    });
  }

  async delete(id: string): Promise<AudiobookData> {
    return prisma.audiobookData.delete({
      where: { id },
    });
  }

  async getAllFormatted(): Promise<FormattedAudiobook[]> {
    const audiobooks = await prisma.audiobookData.findMany();
    return audiobooks.map((book: AudiobookData) => ({
      id: book.id,
      title: book.title,
      debrid_id: book.debrid_id,
      status: book.status,
      progress: book.progress,
      debrid_links: book.debrid_links,
      cover_edition_key: book.cover_edition_key,
      date_added: book.date_added.toISOString(),
    }));
  }

  async updateAllTorrentInfo(updates: TorrentInfoUpdate[]): Promise<void> {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.audiobookData.update({
          where: { debrid_id: update.debrid_id },
          data: {
            status: update.status,
            progress: update.progress,
          },
        })
      )
    );
  }

  async findByStatus(status: string): Promise<AudiobookData[]> {
    return prisma.audiobookData.findMany({
      where: { status },
    });
  }

  async findDownloading(): Promise<AudiobookData[]> {
    return prisma.audiobookData.findMany({
      where: {
        status: {
          in: ["downloading", "queued", "processing"],
        },
      },
    });
  }
  
}

// Types
export interface FormattedAudiobook {
  id: string;
  title: string;
  debrid_id: string;
  status: string;
  progress: number;
  debrid_links: string[];
  cover_edition_key: string | null;
  date_added: string;
}

export interface TorrentInfoUpdate {
  debrid_id: string;
  status: string;
  progress: number;
}
