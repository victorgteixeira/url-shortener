import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl({}, { message: 'URL inválida' })
  original!: string;

  @IsOptional()
  @IsString()
  @Length(4, 32)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Alias só pode conter a-z A-Z 0-9 _ -' })
  alias?: string;

  @IsOptional()
  expiresAt?: Date;
}
