<script lang="ts" setup>
import AppInfoList from './AppInfoList.vue';
import AppInfoListItem from './AppInfoListItem.vue';
</script>

<template>
  <Story
    title="Data Display/InfoList"
    :layout="{ type: 'grid', width: '100%' }"
  >
    <Variant title="Basic Usage" icon="carbon:list">
      <AppInfoList>
        <AppInfoListItem name="Status" value="Active" />
        <AppInfoListItem name="Created" value="2024-01-15" />
        <AppInfoListItem name="Members" value="142" />
        <AppInfoListItem name="Last Updated" value="2 hours ago" />
      </AppInfoList>
    </Variant>

    <Variant title="With Custom Content" icon="carbon:data-enrichment">
      <AppInfoList>
        <AppInfoListItem name="Status">
          <span class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-success"></span>
            <span class="text-success">Online</span>
          </span>
        </AppInfoListItem>
        <AppInfoListItem name="Progress">
          <div class="space-y-1">
            <div class="text-sm">75% Complete</div>
            <div class="h-2 w-20 rounded bg-primary-20">
              <div class="h-full w-3/4 rounded bg-primary"></div>
            </div>
          </div>
        </AppInfoListItem>
        <AppInfoListItem name="Tags">
          <div class="flex gap-1">
            <span class="rounded bg-primary-10 px-2 py-1 text-xs"
              >Important</span
            >
            <span class="rounded bg-success-10 px-2 py-1 text-xs"
              >Verified</span
            >
          </div>
        </AppInfoListItem>
      </AppInfoList>
    </Variant>

    <Variant title="Empty Values" icon="carbon:unknown">
      <AppInfoList>
        <AppInfoListItem name="Name" value="John Doe" />
        <AppInfoListItem name="Email" value="" />
        <AppInfoListItem name="Phone" />
        <AppInfoListItem name="Address" :value="null" />
      </AppInfoList>
    </Variant>

    <Variant title="User Profile Example" icon="carbon:user-profile">
      <div class="max-w-md rounded border p-4">
        <h3 class="mb-4 font-semibold">User Information</h3>
        <AppInfoList>
          <AppInfoListItem name="Full Name" value="Alice Johnson" />
          <AppInfoListItem name="Email" value="alice@example.com" />
          <AppInfoListItem name="Role" value="Administrator" />
          <AppInfoListItem name="Department" value="Engineering" />
          <AppInfoListItem name="Join Date" value="March 2023" />
          <AppInfoListItem name="Last Login">
            <span class="text-body-80">2 minutes ago</span>
          </AppInfoListItem>
        </AppInfoList>
      </div>
    </Variant>

    <Variant title="Responsive Layout" icon="carbon:grid">
      <div class="w-full">
        <p class="mb-4 text-sm text-body-80">
          Resize the viewport to see how the info list adapts to different
          screen sizes.
        </p>
        <AppInfoList>
          <AppInfoListItem name="Server Status" value="Running" />
          <AppInfoListItem name="CPU Usage" value="45%" />
          <AppInfoListItem name="Memory" value="2.1 GB / 8 GB" />
          <AppInfoListItem name="Disk Space" value="78% Used" />
          <AppInfoListItem name="Network" value="1.2 Mbps" />
          <AppInfoListItem name="Uptime" value="15 days, 3 hours" />
          <AppInfoListItem name="Last Backup" value="Yesterday at 2:30 AM" />
          <AppInfoListItem name="Active Users" value="1,234" />
        </AppInfoList>
      </div>
    </Variant>
  </Story>
</template>
