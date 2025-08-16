import { Module } from '@nestjs/common';
import { ShortUrlController } from './short-url.controller';
import { ShortUrlService } from './short-url.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShortUrlController],
  providers: [ShortUrlService],
  exports: [ShortUrlService],
})
export class ShortUrlModule {}
