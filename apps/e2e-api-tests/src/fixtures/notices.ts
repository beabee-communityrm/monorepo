import { CreateNoticeData, UpdateNoticeData } from '@beabee/beabee-common';

export const testNotice: CreateNoticeData = {
  name: 'Test notice',
  text: 'Test notice',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  starts: new Date(), // Now
};

export const testNoticeUpdate: UpdateNoticeData = {
  text: 'Updated test notice text',
  expires: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
};
