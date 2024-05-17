import type { LoginData } from '@type';
import { instance } from '.';

export async function login(data: LoginData): Promise<void> {
  await instance.post('auth/login', {
    email: data.email,
    password: data.password,
    token: data.token,
  });
}

export async function logout(): Promise<void> {
  await instance.post('auth/logout');
}
