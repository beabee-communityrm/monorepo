import { In } from 'typeorm';

import { getRepository } from '#database';
import type { Contact } from '#models/index';
import { Segment, SegmentContact } from '#models/index';

class SegmentService {
  async createSegment(
    name: string,
    ruleGroup: Segment['ruleGroup']
  ): Promise<Segment> {
    const segment = new Segment();
    segment.name = name;
    segment.ruleGroup = ruleGroup;
    return await getRepository(Segment).save(segment);
  }

  async updateSegment(
    segmentId: string,
    updates: Partial<Segment>
  ): Promise<void> {
    await getRepository(Segment).update(segmentId, updates);
  }

  /**
   * Get the contact IDs currently tracked in segment_contact for a segment.
   * @param segmentId The segment ID
   */
  async getSegmentContactIds(segmentId: string): Promise<string[]> {
    const segmentContacts = await getRepository(SegmentContact).find({
      where: { segmentId },
      select: { contactId: true },
    });
    return segmentContacts.map((sc) => sc.contactId);
  }

  /**
   * Add contacts to a segment's tracked contact list.
   * Uses INSERT ... ON CONFLICT DO NOTHING so it's safe to call with
   * contacts that are already tracked.
   * @param segmentId The segment ID
   * @param contactIds The contact IDs to add
   */
  async addContactsToSegment(
    segmentId: string,
    contactIds: string[]
  ): Promise<void> {
    if (contactIds.length === 0) return;
    await getRepository(SegmentContact)
      .createQueryBuilder()
      .insert()
      .into(SegmentContact)
      .values(contactIds.map((contactId) => ({ segmentId, contactId })))
      .orIgnore()
      .execute();
  }

  /**
   * Remove contacts from a segment's tracked contact list.
   * @param segmentId The segment ID
   * @param contactIds The contact IDs to remove
   */
  async removeContactsFromSegment(
    segmentId: string,
    contactIds: string[]
  ): Promise<void> {
    if (contactIds.length === 0) return;
    await getRepository(SegmentContact).delete({
      segmentId,
      contactId: In(contactIds),
    });
  }

  /**
   * Remove all contacts from a segment's tracked contact list.
   * @param segmentId The segment ID
   */
  async removeAllContactsFromSegment(segmentId: string): Promise<void> {
    await getRepository(SegmentContact).delete({ segmentId });
  }

  /**
   * Permanently delete a contact's segment related data
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    await getRepository(SegmentContact).delete({ contactId: contact.id });
  }
}

export const segmentService = new SegmentService();
export default segmentService;
