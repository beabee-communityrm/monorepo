<script lang="ts" setup>
import type { GetNoticeData } from '@beabee/beabee-common';
import { ItemStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import AppNotice from './AppNotice.vue';

const state = reactive({
  text: 'This is an important notice for all users.',
  url: 'https://example.com',
  buttonText: 'Learn More',
});

const sampleNotices: GetNoticeData[] = [
  {
    id: '1',
    name: 'Dashboard Welcome',
    text: 'Welcome to our new and improved dashboard!',
    url: 'https://example.com/dashboard',
    buttonText: 'Explore Dashboard',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    status: ItemStatus.Open,
  },
  {
    id: '2',
    name: 'Maintenance Notice',
    text: 'Scheduled maintenance will occur this weekend.',
    url: 'https://example.com/maintenance',
    buttonText: 'View Details',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    status: ItemStatus.Open,
  },
  {
    id: '3',
    name: 'New Features',
    text: 'New features have been added to your account.',
    url: 'https://example.com/features',
    buttonText: 'See Features',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    status: ItemStatus.Open,
  },
  {
    id: '4',
    name: 'Profile Update',
    text: 'Please update your contact information.',
    url: 'https://example.com/profile',
    buttonText: 'Update Profile',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    status: ItemStatus.Open,
  },
  {
    id: '5',
    name: 'Community Thank You',
    text: 'Thank you for being a valued member of our community.',
    url: 'https://example.com/community',
    buttonText: 'Join Community',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    status: ItemStatus.Open,
  },
];

const realWorldNotices: GetNoticeData[] = [
  {
    id: '6',
    name: 'Mobile App Launch',
    text: "🎉 We're excited to announce the launch of our new mobile app! Download it now from the App Store or Google Play.",
    url: 'https://example.com/mobile-app',
    buttonText: 'Download App',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
    status: ItemStatus.Open,
  },
  {
    id: '7',
    name: 'System Maintenance',
    text: '⚠️ Scheduled maintenance: Our services will be temporarily unavailable on Sunday, March 15th from 2:00 AM to 6:00 AM EST for system upgrades.',
    url: 'https://example.com/maintenance-schedule',
    buttonText: 'View Schedule',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
    status: ItemStatus.Open,
  },
  {
    id: '8',
    name: 'Privacy Policy Update',
    text: "📋 We've updated our Privacy Policy and Terms of Service. Please review the changes at your earliest convenience.",
    url: 'https://example.com/privacy-policy',
    buttonText: 'Review Changes',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    status: ItemStatus.Open,
  },
  {
    id: '9',
    name: 'Collaboration Features',
    text: '✨ New feature alert! You can now collaborate with team members in real-time. Check out the new collaboration tools in your dashboard.',
    url: 'https://example.com/collaboration',
    buttonText: 'Try Collaboration',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    status: ItemStatus.Open,
  },
  {
    id: '10',
    name: 'Holiday Schedule',
    text: '🎄 Happy Holidays! Our support team will have limited availability from December 24th to January 2nd. We appreciate your patience during this time.',
    url: 'https://example.com/holiday-schedule',
    buttonText: 'View Schedule',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    status: ItemStatus.Open,
  },
];

const multipleNotices: GetNoticeData[] = [
  {
    id: '11',
    name: 'Email Verification',
    text: '📢 Important: Please verify your email address to continue using all features.',
    url: 'https://example.com/verify-email',
    buttonText: 'Verify Email',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    status: ItemStatus.Open,
  },
  {
    id: '12',
    name: 'New Notifications',
    text: '🔔 You have 3 new notifications waiting in your inbox.',
    url: 'https://example.com/notifications',
    buttonText: 'View Notifications',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    status: ItemStatus.Open,
  },
  {
    id: '13',
    name: 'Subscription Renewal',
    text: '💳 Your subscription will automatically renew in 7 days.',
    url: 'https://example.com/subscription',
    buttonText: 'Manage Subscription',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    status: ItemStatus.Open,
  },
  {
    id: '14',
    name: 'Usage Report',
    text: '📊 Your monthly usage report is now available for download.',
    url: 'https://example.com/reports',
    buttonText: 'Download Report',
    starts: null,
    expires: null,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    status: ItemStatus.Open,
  },
];
</script>

<template>
  <Story title="Components/Notification/AppNotice">
    <Variant title="Playground">
      <div class="space-y-4">
        <AppNotice
          :notice="{
            id: 'playground',
            name: 'Playground Notice',
            text: state.text,
            url: state.url,
            buttonText: state.buttonText,
            starts: null,
            expires: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: ItemStatus.Open,
          }"
        />
      </div>

      <template #controls>
        <HstText v-model="state.text" title="Notice Text" />
        <HstText v-model="state.url" title="Notice URL" />
        <HstText v-model="state.buttonText" title="Button Text" />
      </template>
    </Variant>

    <Variant title="Different Notice Types">
      <div class="space-y-4">
        <div
          v-for="(notice, index) in sampleNotices"
          :key="index"
          class="space-y-2"
        >
          <h4 class="font-medium">Notice {{ index + 1 }}</h4>
          <AppNotice :notice="notice" />
        </div>
      </div>
    </Variant>

    <Variant title="Long Notice">
      <div class="space-y-4">
        <AppNotice
          :notice="{
            id: 'long-notice',
            name: 'Long Notice Example',
            text: 'This is a longer notice that demonstrates how the component handles multiple lines of text. It provides detailed information to users about important updates, changes, or announcements that they need to be aware of. The notice maintains proper readability and spacing even with longer content.',
            url: 'https://example.com/long-notice',
            buttonText: 'Read More',
            starts: null,
            expires: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: ItemStatus.Open,
          }"
        />
      </div>
    </Variant>

    <Variant title="Real-world Examples">
      <div class="space-y-6">
        <div>
          <h4 class="mb-2 font-medium">System Announcements</h4>
          <div class="space-y-2">
            <AppNotice :notice="realWorldNotices[0]" />
          </div>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Maintenance Notices</h4>
          <div class="space-y-2">
            <AppNotice :notice="realWorldNotices[1]" />
          </div>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Policy Updates</h4>
          <div class="space-y-2">
            <AppNotice :notice="realWorldNotices[2]" />
          </div>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Feature Announcements</h4>
          <div class="space-y-2">
            <AppNotice :notice="realWorldNotices[3]" />
          </div>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Holiday Messages</h4>
          <div class="space-y-2">
            <AppNotice :notice="realWorldNotices[4]" />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Notice without Button">
      <div class="space-y-4">
        <AppNotice
          :notice="{
            id: 'no-button',
            name: 'Info Only Notice',
            text: 'This notice only provides information without a button action.',
            url: 'https://example.com/info',
            starts: null,
            expires: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: ItemStatus.Open,
          }"
        />
      </div>
    </Variant>

    <Variant title="Multiple Notices">
      <div class="space-y-3">
        <AppNotice
          v-for="(notice, index) in multipleNotices"
          :key="index"
          :notice="notice"
        />
      </div>
    </Variant>

    <Variant title="Notice without URL">
      <div class="space-y-4">
        <AppNotice
          :notice="{
            id: 'no-url',
            name: 'Simple Notice',
            text: 'This is a simple notice without any URL or button.',
            url: '',
            starts: null,
            expires: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: ItemStatus.Open,
          }"
        />
      </div>
    </Variant>
  </Story>
</template>
