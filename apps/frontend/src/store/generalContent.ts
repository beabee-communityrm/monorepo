import { generalContent } from '@beabee/vue/store/generalContent';

import { client } from '@utils/api';
import { resolveImageUrl } from '@utils/url';
import { computed } from 'vue';

export { generalContent };

export const initGeneralContent = () =>
  client.content.get('general').then((content) => {
    generalContent.value = content;
    return content;
  });

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${resolveImageUrl(generalContent.value.backgroundUrl)})`,
}));
