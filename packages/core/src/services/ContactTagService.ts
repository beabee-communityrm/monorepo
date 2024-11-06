import { getRepository } from "../database";
import { ContactTag, ContactTagAssignment } from "../models";
import { NotFoundError } from "routing-controllers";
import { log } from "#logging";
import { FindManyOptions, FindOneOptions, FindOptionsWhere } from "typeorm";

class ContactTagService {
  async find(options?: FindManyOptions<ContactTag>): Promise<ContactTag[]> {
    return await getRepository(ContactTag).find(options);
  }

  async findOne(
    options: FindOneOptions<ContactTag>
  ): Promise<ContactTag | undefined> {
    return (await getRepository(ContactTag).findOne(options)) || undefined;
  }

  async findOneBy(
    where: FindOptionsWhere<ContactTag>
  ): Promise<ContactTag | undefined> {
    return (await getRepository(ContactTag).findOneBy(where)) || undefined;
  }

  async create(data: {
    name: string;
    description?: string;
  }): Promise<ContactTag> {
    log.info("Create contact tag", { data });

    const tag = await getRepository(ContactTag).save({
      name: data.name,
      description: data.description || ""
    });

    return tag;
  }

  async update(
    tagId: string,
    data: Partial<{ name: string; description: string }>
  ): Promise<void> {
    log.info("Update contact tag", { tagId, data });
    await getRepository(ContactTag).update({ id: tagId }, data);
  }

  async delete(tagId: string): Promise<void> {
    log.info("Delete contact tag", { tagId });

    const tagRepository = getRepository(ContactTag);
    const assignmentRepository = getRepository(ContactTagAssignment);

    // Check if tag exists
    const tag = await tagRepository.findOneBy({ id: tagId });
    if (!tag) {
      throw new NotFoundError();
    }

    // Check if tag is still assigned to any contacts
    const assignments = await assignmentRepository.count({ where: { tagId } });
    if (assignments > 0) {
      // Delete all assignments
      await assignmentRepository.delete({ tagId });
    }

    // Delete tag
    const deleted = await tagRepository.delete(tagId);
    if (!deleted) {
      throw new NotFoundError();
    }
  }

  /**
   * Count assignments for a tag
   */
  async countAssignments(tagId: string): Promise<number> {
    return await getRepository(ContactTagAssignment).count({
      where: { tagId }
    });
  }
}

export default new ContactTagService();
