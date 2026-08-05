import { IsString } from 'class-validator';

export class GetContactOriginDto {
  @IsString()
  source!: string;

  @IsString()
  referrer!: string;

  @IsString()
  campaign!: string;
}
