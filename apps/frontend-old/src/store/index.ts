import { initCurrentUser } from './currentUser';
import { initGeneralContent } from './generalContent';

export const initStore = async () => {
  await initCurrentUser();
  await initGeneralContent();
};

export const isEmbed = window.self !== window.top;

export { generalContent } from './generalContent';

export {
  currentUser,
  updateCurrentUser,
  currentUserCan,
  canAdmin,
} from './currentUser';
