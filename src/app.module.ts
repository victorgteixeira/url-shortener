import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { ShortUrlModule } from './short-url/short-url.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 60, ttl: 60_000 }],
    }),
    PrismaModule,
    ShortUrlModule,
  ],
})
export class AppModule {}
