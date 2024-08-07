import { Contact } from "#models/index";

export function generateContactCode(contact: Partial<Contact>): string | null {
  if (contact.firstname && contact.lastname) {
    const no = ("000" + Math.floor(Math.random() * 1000)).slice(-3);
    return (contact.firstname[0] + contact.lastname[0] + no).toUpperCase();
  }
  return null;
}
