import type { CalloutComponentType } from '../data/index.js';
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentBaseRules,
} from './index.js';

export interface CalloutComponentInputAudioRecorderSchema extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_AUDIO_RECORDER;
  filePattern?: string;
  /** E.g. `"0KB"` */
  fileMinSize?: string;
  /** E.g. `"1GB"` */
  fileMaxSize?: string;
  /** The storage target for the uploaded/recorded audio file */
  storage?: string;
  validate?: CalloutComponentBaseRules;
}
