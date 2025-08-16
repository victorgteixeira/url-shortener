import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

@Injectable()
export class ShortUrlService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShortUrlDto) {
    const code = dto.alias ?? nano();
    const exists = await this.prisma.shortUrl.findUnique({ where: { code } });
    if (exists) throw new ConflictException('Alias já está em uso');

    return this.prisma.shortUrl.create({
      data: { code, original: dto.original, expiresAt: dto.expiresAt ?? null },
    });
  }

  async resolve(code: string) {
    const item = await this.prisma.shortUrl.findUnique({ where: { code } });
    if (!item) throw new NotFoundException('Código não encontrado');
    if (item.expiresAt && item.expiresAt < new Date()) throw new NotFoundException('Link expirado');

    this.prisma.shortUrl.update({
      where: { code },
      data: { clicks: { increment: 1 }, lastAccess: new Date() },
    }).catch(() => {});

    return item.original;
  }

  async stats(code: string) {
    const item = await this.prisma.shortUrl.findUnique({ where: { code } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async list() {
    return this.prisma.shortUrl.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
