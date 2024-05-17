import { initCurrentUser } from './currentUser';
import { initGeneralContent } from './generalContent';

export const initStore = Promise.all([initCurrentUser, initGeneralContent]);

export const isEmbed = window.self !== window.top;

export { generalContent, backgroundStyle } from './generalContent';

export {
  currentUser,
  updateCurrentUser,
  currentUserCan,
  canAdmin,
} from './currentUser';
