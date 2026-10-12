import { IsString } from 'class-validator';

export class GetContactOriginDto {
  @IsString()
  source!: string;

  @IsString()
  medium!: string;

  @IsString()
  campaign!: string;
}
