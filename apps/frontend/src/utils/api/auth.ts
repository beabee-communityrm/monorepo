import type { LoginData } from '@beabee/beabee-common';
import { instance } from '.';

/** @deprecated Use the client instead */
export async function login(data: LoginData): Promise<void> {
  await instance.post('auth/login', {
    email: data.email,
    password: data.password,
    token: data.token,
  });
}

/** @deprecated Use the client instead */
export async function logout(): Promise<void> {
  await instance.post('auth/logout');
}
