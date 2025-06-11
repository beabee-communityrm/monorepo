import type { TagData } from './tag-data.js';

export type TagCreateData = Pick<TagData, 'name' | 'description'>;
