/**
 * Data for updating a contact role
 *
 * @property dateAdded - The date when the role was added
 * @property dateExpires - The date when the role expires
 *   - undefined: keeps existing expiration date
 *   - null: removes expiration date
 *   - Date: sets new expiration date
 *   - empty string: invalid, will be rejected
 */
export interface UpdateContactRoleData {
  dateAdded?: Date;
  dateExpires?: Date | null;
}
