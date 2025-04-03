<script lang="ts" setup>
import { reactive } from 'vue';
import AppTabCard from './AppTabCard.vue';
import AppFormBox from '../form/AppFormBox.vue';
import type { TabItem } from '../../types/tabs.interface';

const state = reactive({
  selectedTab: 'en',
});

const languageTabs: TabItem[] = [
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'pt', label: 'Português' },
];

const tabsWithCounts: TabItem[] = [
  { id: 'pending', label: 'Pending', count: 3 },
  { id: 'approved', label: 'Approved', count: 12 },
  { id: 'rejected', label: 'Rejected', count: 1 },
];

// Generate long content for sticky tabs demo
const longContent = Array(20)
  .fill(null)
  .map(
    (_, i) => `This is paragraph ${i + 1} with some sample text for scrolling.`
  )
  .join('\n\n');
</script>

<template>
  <Story title="Components/Tabs/AppTabCard">
    <Variant title="Boxed Variant (Default)">
      <div class="p-4">
        <AppTabCard v-model="state.selectedTab" :items="languageTabs">
          <template #default="{ selected }">
            <div class="min-h-[100px] p-4">
              <p v-if="selected === 'en'">English content goes here</p>
              <p v-else-if="selected === 'de'">Deutscher Inhalt kommt hier</p>
              <p v-else-if="selected === 'pt'">Conteúdo em português aqui</p>
            </div>
          </template>
        </AppTabCard>
      </div>
    </Variant>

    <Variant title="Transparent Variant with AppFormBox">
      <div class="p-4">
        <AppTabCard
          v-model="state.selectedTab"
          :items="languageTabs"
          variant="transparent"
        >
          <template #default="{ selected }">
            <AppFormBox title="Translation Form">
              <div class="py-4">
                <div>
                  <label class="mb-1 block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    class="w-full rounded-md border border-primary-20 px-3 py-2"
                    :placeholder="`Enter title in ${selected}`"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium"
                    >Description</label
                  >
                  <textarea
                    class="w-full rounded-md border border-primary-20 px-3 py-2"
                    :placeholder="`Enter description in ${selected}`"
                    rows="3"
                  />
                </div>
              </div>
            </AppFormBox>
          </template>
        </AppTabCard>
      </div>
    </Variant>

    <Variant title="With Sticky Tabs">
      <div class="p-4">
        <div class="relative h-[400px] overflow-y-auto" style="contain: paint">
          <AppTabCard
            v-model="state.selectedTab"
            :items="languageTabs"
            :sticky-tabs="true"
            variant="boxed"
          >
            <template #default="{ selected }">
              <div class="py-4">
                <AppFormBox class="!px-0" title="Section 1">
                  <p v-if="selected === 'en'" v-text="longContent" />
                  <p v-else-if="selected === 'de'">
                    Langer deutscher Beispieltext...
                  </p>
                  <p v-else-if="selected === 'pt'">
                    Texto longo em português...
                  </p>
                </AppFormBox>

                <AppFormBox title="Section 2">
                  <div class="py-4">
                    <div>
                      <label class="mb-1 block text-sm font-medium"
                        >Title</label
                      >
                      <input
                        type="text"
                        class="w-full rounded-md border border-primary-20 px-3 py-2"
                        :placeholder="`Enter title in ${selected}`"
                      />
                    </div>
                    <div>
                      <label class="mb-1 block text-sm font-medium"
                        >Description</label
                      >
                      <textarea
                        class="w-full rounded-md border border-primary-20 px-3 py-2"
                        :placeholder="`Enter description in ${selected}`"
                        rows="3"
                      />
                    </div>
                  </div>
                </AppFormBox>

                <AppFormBox title="Section 3">
                  <p v-if="selected === 'en'" v-text="longContent" />
                  <p v-else-if="selected === 'de'">
                    Noch mehr deutscher Beispieltext...
                  </p>
                  <p v-else-if="selected === 'pt'">
                    Mais texto em português...
                  </p>
                </AppFormBox>
              </div>
            </template>
          </AppTabCard>
        </div>
      </div>
    </Variant>

    <Variant title="With Sticky Tabs (Transparent)">
      <div class="p-4">
        <div class="relative h-[400px] overflow-y-auto" style="contain: paint">
          <AppTabCard
            v-model="state.selectedTab"
            :items="languageTabs"
            :sticky-tabs="true"
            variant="transparent"
          >
            <template #default="{ selected }">
              <div class="py-4">
                <AppFormBox title="Section 1">
                  <p v-if="selected === 'en'" v-text="longContent" />
                  <p v-else-if="selected === 'de'">
                    Langer deutscher Beispieltext...
                  </p>
                  <p v-else-if="selected === 'pt'">
                    Texto longo em português...
                  </p>
                </AppFormBox>

                <AppFormBox title="Section 2">
                  <div class="py-4">
                    <div>
                      <label class="mb-1 block text-sm font-medium"
                        >Title</label
                      >
                      <input
                        type="text"
                        class="w-full rounded-md border border-primary-20 px-3 py-2"
                        :placeholder="`Enter title in ${selected}`"
                      />
                    </div>
                    <div>
                      <label class="mb-1 block text-sm font-medium"
                        >Description</label
                      >
                      <textarea
                        class="w-full rounded-md border border-primary-20 px-3 py-2"
                        :placeholder="`Enter description in ${selected}`"
                        rows="3"
                      />
                    </div>
                  </div>
                </AppFormBox>

                <AppFormBox title="Section 3">
                  <p v-if="selected === 'en'" v-text="longContent" />
                  <p v-else-if="selected === 'de'">
                    Noch mehr deutscher Beispieltext...
                  </p>
                  <p v-else-if="selected === 'pt'">
                    Mais texto em português...
                  </p>
                </AppFormBox>
              </div>
            </template>
          </AppTabCard>
        </div>
      </div>
    </Variant>

    <Variant title="With Counts">
      <div class="p-4">
        <AppTabCard v-model="state.selectedTab" :items="tabsWithCounts">
          <template #default="{ selected }">
            <div class="min-h-[100px] p-4">
              <p>Showing content for: {{ selected }}</p>
            </div>
          </template>
        </AppTabCard>
      </div>
    </Variant>
  </Story>
</template>
