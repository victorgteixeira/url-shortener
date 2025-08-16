// src/short-url/short-url.controller.ts
import { Body, Controller, Get, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { ShortUrlService } from './short-url.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import * as QRCode from 'qrcode';

@Controller()
@UseGuards(ThrottlerGuard)
export class ShortUrlController {
  constructor(private svc: ShortUrlService) {}

  @Post('api/shorten')
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) // 10 req/60s
  async create(@Body() dto: CreateShortUrlDto) {
    const created = await this.svc.create(dto);
    return {
      code: created.code,
      shortUrl: `${process.env.BASE_URL ?? 'http://localhost:3000'}/${created.code}`,
    };
  }

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const target = await this.svc.resolve(code).catch(() => null);
    if (!target) throw new NotFoundException();
    return res.redirect(302, target);
  }

  @Get('api/stats/:code')
  stats(@Param('code') code: string) {
    return this.svc.stats(code);
  }

  @Get('api/qr/:code')
  async qr(@Param('code') code: string, @Res() res: Response) {
    const url = `${process.env.BASE_URL ?? 'http://localhost:3000'}/${code}`;
    const png = await QRCode.toBuffer(url, { width: 256 });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  }

  @Get('api/urls')
  list() {
    return this.svc.list();
  }
}
