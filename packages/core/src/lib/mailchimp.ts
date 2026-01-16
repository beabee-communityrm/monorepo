import { NewsletterStatus } from '@beabee/beabee-common';

import axios from 'axios';
import crypto from 'crypto';

import { MailchimpNewsletterConfig } from '#config/config';
import { log as mainLogger } from '#logging';
import OptionsService from '#services/OptionsService';
import {
  MCBatch,
  MCMember,
  MCOperation,
  MCOperationResponse,
  MCStatus,
  NewsletterContact,
  UpdateNewsletterContact,
} from '#type/index';
import { normalizeEmailAddress } from '#utils/email';
import { extractJsonArchive } from '#utils/file';

const log = mainLogger.child({ app: 'mailchimp' });

export function createInstance(
  settings: MailchimpNewsletterConfig['settings']
) {
  const instance = axios.create({
    baseURL: `https://${settings.datacenter}.api.mailchimp.com/3.0/`,
    auth: {
      username: 'user',
      password: settings.apiKey,
    },
  });

  instance.interceptors.request.use((config) => {
    log.info(`${config.method} ${config.url}`, {
      params: config.params,
      // Don't print all the batch operations
      ...((config.url !== '/batches/' || config.method !== 'post') && {
        data: config.data,
      }),
    });

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      log.error(
        'MailChimp API returned with status ' + error.response?.status,
        {
          status: error.response?.status,
          data: error.response?.data,
        }
      );
      return Promise.reject(error);
    }
  );

  async function createBatch(operations: MCOperation[]): Promise<MCBatch> {
    log.info(`Creating batch with ${operations.length} operations`);
    const response = await instance.post('/batches/', { operations });
    return response.data as MCBatch;
  }

  async function waitForBatch(batch: MCBatch): Promise<MCBatch> {
    log.info(`Waiting for batch ${batch.id}`, {
      finishedOperations: batch.finished_operations,
      totalOperations: batch.total_operations,
      erroredOperations: batch.errored_operations,
    });

    if (batch.status === 'finished') {
      return batch;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return await waitForBatch(
        (await instance.get('/batches/' + batch.id)).data
      );
    }
  }

  async function getBatchResponses<T = unknown>(
    batch: MCBatch,
    validateStatus?: (status: number) => boolean
  ): Promise<T[]> {
    log.info(`Getting responses for batch ${batch.id}`, {
      finishedOperations: batch.finished_operations,
      totalOperations: batch.total_operations,
      erroredOperations: batch.errored_operations,
    });

    const response = await axios({
      method: 'GET',
      url: batch.response_body_url,
      responseType: 'stream',
    });

    return await extractJsonArchive<T>(response.data, (json): T | null => {
      if (!isOperationResponseArray(json) || json.length !== 1) {
        throw new Error('Unexpected batch response format');
      }
      if (validateStatus && !validateStatus(json[0].status_code)) {
        throw new Error(
          `Unexpected error for ${json[0].operation_id}, got ${json[0].status_code}`
        );
      }

      return json[0].status_code >= 200 && json[0].status_code < 300
        ? (JSON.parse(json[0].response) as T)
        : null;
    });
  }

  async function dispatchOperation<T = unknown>(
    operation: MCOperation,
    validateStatus?: (status: number) => boolean
  ): Promise<T | null> {
    const resp = await instance({
      method: operation.method,
      params: operation.params,
      url: operation.path,
      ...(operation.body && { data: JSON.parse(operation.body) }),
      validateStatus: validateStatus || null,
    });
    return resp.status >= 200 && resp.status < 300 ? (resp.data as T) : null;
  }

  async function dispatchOperations<T = unknown>(
    operations: MCOperation[],
    validateStatus?: (status: number) => boolean
  ): Promise<T[]> {
    log.info(`Dispatching ${operations.length} operations`);

    if (operations.length > 20) {
      const batch = await createBatch(operations);
      const finishedBatch = await waitForBatch(batch);
      return await getBatchResponses<T>(finishedBatch, validateStatus);
    } else {
      const results: T[] = [];
      for (const operation of operations) {
        try {
          const result = await dispatchOperation<T>(operation, validateStatus);
          if (result !== null) {
            results.push(result);
          }
        } catch (err) {
          log.error(
            `Error in operation ${operation.operation_id}`,
            err,
            operation
          );
        }
      }
      return results;
    }
  }

  return {
    instance,
    createBatch,
    waitForBatch,
    getBatchResponses,
    dispatchOperation,
    dispatchOperations,
  };
}

export function mcStatusToStatus(mcStatus: MCStatus): NewsletterStatus {
  switch (mcStatus) {
    case 'cleaned':
      return NewsletterStatus.Cleaned;
    case 'pending':
      return NewsletterStatus.Pending;
    case 'subscribed':
      return NewsletterStatus.Subscribed;
    case 'unsubscribed':
      return NewsletterStatus.Unsubscribed;
    case 'archived':
      return NewsletterStatus.None;
    default:
      log.error(`Unknown Mailchimp status: ${mcStatus}`);
      return NewsletterStatus.None;
  }
}

export function getMCMemberUrl(listId: string, email: string) {
  const emailHash = crypto
    .createHash('md5')
    .update(normalizeEmailAddress(email))
    .digest('hex');
  return `lists/${listId}/members/${emailHash}`;
}

export function nlContactToMCMember(
  nlContact: UpdateNewsletterContact
): Partial<MCMember> {
  if (nlContact.status === NewsletterStatus.None) {
    throw new Error('NewsletterStatus = None for ' + nlContact.email);
  }

  const groups: { id: string; label: string }[] =
    OptionsService.getJSON('newsletter-groups');

  return {
    email_address: nlContact.email,
    status: nlContact.status,
    ...((nlContact.firstname || nlContact.lastname || nlContact.fields) && {
      merge_fields: {
        ...(nlContact.firstname && { FNAME: nlContact.firstname }),
        ...(nlContact.lastname && { LNAME: nlContact.lastname }),
        ...nlContact.fields,
      },
    }),
    ...(nlContact.groups && {
      interests: Object.assign(
        {},
        ...groups.map((group) => ({
          [group.id]: nlContact.groups?.includes(group.id),
        }))
      ),
    }),
  };
}

export function mcMemberToNlContact(member: MCMember): NewsletterContact {
  const { FNAME, LNAME, ...fields } = member.merge_fields;
  const activeMemberTag = OptionsService.getText(
    'newsletter-active-member-tag'
  );
  const activeUserTag = OptionsService.getText('newsletter-active-user-tag');
  return {
    email: normalizeEmailAddress(member.email_address),
    firstname: FNAME || '',
    lastname: LNAME || '',
    joined: new Date(
      member.timestamp_opt || member.timestamp_signup || member.last_changed
    ),
    status: mcStatusToStatus(member.status),
    groups: member.interests
      ? Object.entries(member.interests)
          .filter(([group, isOptedIn]) => isOptedIn)
          .map(([group]) => group)
      : [],
    tags: member.tags.map((tag) => tag.name),
    fields,
    isActiveMember:
      member.tags.findIndex((t) => t.name === activeMemberTag) !== -1,
    isActiveUser: member.tags.findIndex((t) => t.name === activeUserTag) !== -1,
  };
}

/**
 * Checks if the given object is an array of Mailchimp operation responses
 *
 * @param obj The object to check
 */
function isOperationResponseArray(obj: unknown): obj is MCOperationResponse[] {
  return (
    Array.isArray(obj) &&
    obj.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'status_code' in item &&
        'response' in item &&
        'operation_id' in item
    )
  );
}
