import { database } from "#core/database";

import { Contact, Segment, SegmentContact } from "@beabee/models";

export class SegmentService {
  async createSegment(
    name: string,
    ruleGroup: Segment["ruleGroup"]
  ): Promise<Segment> {
    const segment = new Segment();
    segment.name = name;
    segment.ruleGroup = ruleGroup;
    return await database.getRepository(Segment).save(segment);
  }

  async updateSegment(
    segmentId: string,
    updates: Partial<Segment>
  ): Promise<void> {
    await database.getRepository(Segment).update(segmentId, updates);
  }

  /**
   * Permanently delete a contact's segment related data
   * @param contact The contact
   */
  static async permanentlyDeleteContact(contact: Contact): Promise<void> {
    await database
      .getRepository(SegmentContact)
      .delete({ contactId: contact.id });
  }
}
