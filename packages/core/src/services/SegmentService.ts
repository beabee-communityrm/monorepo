import { getRepository } from "#database";

import { Contact, Segment, SegmentContact } from "#models/index";

class SegmentService {
  async createSegment(
    name: string,
    ruleGroup: Segment["ruleGroup"]
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
   * Permanently delete a contact's segment related data
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    await getRepository(SegmentContact).delete({ contactId: contact.id });
  }
}

export const segmentService = new SegmentService();
export default segmentService;
