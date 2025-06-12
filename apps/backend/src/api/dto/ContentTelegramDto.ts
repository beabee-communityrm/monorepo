import type { ContentTelegramData } from '@beabee/beabee-common';

import { IsString } from 'class-validator';

export class GetContentTelegramDto implements ContentTelegramData {
  /** Markdown formatted welcome message */
  @IsString()
  welcomeMessageMd!: string;
}
