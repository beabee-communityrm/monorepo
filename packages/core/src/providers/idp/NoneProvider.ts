import { IdpProvider, IdpUserData } from '#type/index';

export class NoneProvider implements IdpProvider {
  async createUser(data: IdpUserData): Promise<string | null> {
    return null;
  }
  async findUserByEmail(email: string): Promise<string | null> {
    return null;
  }
  async updateEmail(subject: string, email: string): Promise<void> {}
  async deleteUser(subject: string): Promise<void> {}
}
