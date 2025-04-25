import { computed } from 'vue';
import { client } from '@utils/api';
import defaultBgUrl from '@assets/images/auth-bg.jpg';
import { generalContent } from '@beabee/vue/store/generalContent';
import { isAbsoluteUrl } from '@beabee/beabee-common';
import env from '@env';

export { generalContent };

export const initGeneralContent = client.content
  .get('general')
  .then((content) => {
    generalContent.value = content;
    return content;
  });

// Process the image URL - add prefix if needed
function processImageUrl(url: unknown): string {
  if (!url || typeof url !== 'string') {
    return defaultBgUrl;
  }
  if (isAbsoluteUrl(url) || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith(env.apiUrl)) {
    return url;
  }
  return `${env.apiUrl}/${url.replace(/^\//, '')}`;
}

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${processImageUrl(generalContent.value.backgroundUrl)})`,
}));
