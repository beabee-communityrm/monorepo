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

/**
 * Create a Mailchimp API instance
 *
 * @param settings The Mailchimp API settings
 * @returns A Mailchimp API instance
 */
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

  /**
   * Create a batch with the given operations
   *
   * @param operations The operations to include in the batch
   * @returns
   */
  async function createBatch(operations: MCOperation[]): Promise<MCBatch> {
    log.info(`Creating batch with ${operations.length} operations`);
    const response = await instance.post('/batches/', { operations });
    return response.data as MCBatch;
  }

  /**
   * Wait for the given batch to finish processing. Polls the batch status every
   * 5 seconds until it is finished, then returns the finished batch.
   *
   * @param batch The batch
   * @returns The finished batch
   */
  async function waitForBatch(batch: MCBatch): Promise<MCBatch> {
    while (batch.status !== 'finished') {
      log.info(`Waiting for batch ${batch.id}`, {
        finishedOperations: batch.finished_operations,
        totalOperations: batch.total_operations,
        erroredOperations: batch.errored_operations,
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      batch = (await instance.get('/batches/' + batch.id)).data;
    }

    return batch;
  }

  /**
   * Processes the batch response. Mailchimp provides a URL to download a tar
   * archive with the responses for each operation in the batch. Check each
   * response for errors, optionally specifying which statuses are expected, and
   * return the parsed response bodies.
   *
   * @param batch The finished batch
   * @param validateStatus Optional function to validate the status code of each operation
   * @returns Array of operation responses
   */
  async function getBatchResponses<T = unknown>(
    batch: MCBatch,
    validateStatus?: (status: number) => boolean
  ): Promise<T[]> {
    log.info(`Getting responses for batch ${batch.id}`, {
      finishedOperations: batch.finished_operations,
      totalOperations: batch.total_operations,
      erroredOperations: batch.errored_operations,
    });

    const archive = await axios({
      method: 'GET',
      url: batch.response_body_url,
      responseType: 'stream',
    });

    const responses = await extractJsonArchive<T[]>(archive.data, (json) => {
      if (!isOperationResponseArray(json)) {
        throw new Error(
          'Unexpected batch response format for batch ' + batch.id
        );
      }

      return json
        .filter((resp) => {
          if (validateStatus && !validateStatus(resp.status_code)) {
            throw new Error(
              `Unexpected error for batch ${batch.id}/${resp.operation_id}, got ${resp.status_code}`
            );
          }

          return resp.status_code >= 200 && resp.status_code < 300;
        })
        .map((resp) => JSON.parse(resp.response) as T);
    });

    return responses.flat();
  }

  /**
   * Dispatches a single operation to the Mailchimp API, optionally specifying
   * which statuses are expected. This can be used to specify that some error
   * codes are expected although only 2xx codes will return a body.
   *
   * For example, when fetching a member that might not exist, a 404 shouldn't
   * throw an exception.
   *
   * @param operation The operation
   * @param validateStatus Optional function to validate the status code
   * @returns The parsed response body or null if the status is non 2xx
   */
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

  /**
   * Dispatches multiple operations to the Mailchimp API, either as individual
   * requests or as a batch if there are more than 20 operations.
   *
   * @param operations The operations
   * @param validateStatus Optional function to validate the status code
   * @returns Array of operation responses
   */
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

/**
 * Convert a Mailchimp status to a NewsletterStatus
 *
 * @param mcStatus The Mailchimp status
 * @returns The NewsletterStatus
 */
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

/**
 * Get the Mailchimp member URL for the given list ID and email address
 *
 * @param listId The Mailchimp list/audience ID
 * @param email The email address
 * @returns The Mailchimp member URL
 */
export function getMCMemberUrl(listId: string, email: string) {
  const emailHash = crypto
    .createHash('md5')
    .update(normalizeEmailAddress(email))
    .digest('hex');
  return `lists/${listId}/members/${emailHash}`;
}

/**
 * Convert a NewsletterContact to a Mailchimp member object
 *
 * @param nlContact The newsletter contact
 * @returns The Mailchimp member object
 */
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

/**
 * Convert a Mailchimp member object to a NewsletterContact
 *
 * @param member The Mailchimp member
 * @returns The newsletter contact
 */
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
