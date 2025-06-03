import { computed } from 'vue';
import { client } from '@utils/api';
import { resolveImageUrl } from '@utils/url';
import { generalContent } from '@beabee/vue/store/generalContent';

export { generalContent };

// Don't make API call on import, provide an init function instead
export const initGeneralContent = async () => {
  console.log('[generalContent] Initializing general content...');
  try {
    const content = await client.content.get('general');
    generalContent.value = content;
    console.log('[generalContent] General content loaded successfully');
    return content;
  } catch (error) {
    console.error('[generalContent] Failed to load general content:', error);
    throw error;
  }
};

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${resolveImageUrl(generalContent.value.backgroundUrl)})`,
}));
