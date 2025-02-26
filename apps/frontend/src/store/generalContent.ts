import { computed } from 'vue';
import { client } from '@utils/api';
import defaultBgUrl from '@assets/images/auth-bg.jpg';
import { generalContent } from '@beabee/vue/store/generalContent';

export { generalContent };

export const initGeneralContent = client.content
  .get('general')
  .then((content) => {
    generalContent.value = content;
    return content;
  });

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${generalContent.value.backgroundUrl || defaultBgUrl})`,
}));
