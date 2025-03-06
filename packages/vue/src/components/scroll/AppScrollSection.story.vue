<script lang="ts" setup>
import AppScrollSection from './AppScrollSection.vue';
</script>

<template>
  <Story title="Components/Scroll/AppScrollSection">
    <Variant title="Basic Usage">
      <div class="bg-grey-lighter p-4">
        <AppScrollSection id="section1" title="Section Title">
          <p class="mb-4">This is the content of the section.</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
            euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis
            aliquam nisl nunc quis nisl.
          </p>
        </AppScrollSection>
      </div>
    </Variant>

    <Variant title="Without Title">
      <div class="bg-grey-lighter p-4">
        <AppScrollSection id="section2">
          <p class="mb-4">This section has no title.</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
            euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis
            aliquam nisl nunc quis nisl.
          </p>
        </AppScrollSection>
      </div>
    </Variant>

    <Variant title="Multiple Sections">
      <div class="bg-grey-lighter p-4">
        <AppScrollSection id="section3" title="First Section">
          <p class="mb-4">This is the first section.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </AppScrollSection>

        <AppScrollSection id="section4" title="Second Section">
          <p class="mb-4">This is the second section.</p>
          <p>
            Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc.
          </p>
        </AppScrollSection>

        <AppScrollSection id="section5" title="Third Section">
          <p class="mb-4">This is the third section.</p>
          <p>Quis aliquam nisl nunc quis nisl.</p>
        </AppScrollSection>
      </div>
    </Variant>

    <Variant title="With Custom Content">
      <div class="bg-grey-lighter p-4">
        <AppScrollSection id="section6" title="Form Section">
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium">Name</label>
              <input
                type="text"
                class="w-full rounded-md border border-primary-20 px-3 py-2"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                class="w-full rounded-md border border-primary-20 px-3 py-2"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Message</label>
              <textarea
                class="w-full rounded-md border border-primary-20 px-3 py-2"
                placeholder="Enter your message"
                rows="3"
              />
            </div>
          </div>
        </AppScrollSection>
      </div>
    </Variant>
  </Story>
</template>
