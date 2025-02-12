import crypto from "node:crypto";
import { LOGIN_CODES } from "@beabee/beabee-common";
import { TOTP, Secret } from "otpauth";

import config from "#config/config";
import { Password } from "#models/index";

import { Request } from "express";

import { Contact } from "@beabee/core/models";

export function generateApiKey(
  idLength: number = 16,
  secretLength: number = 48
): {
  id: string;
  secret: string;
  secretHash: string;
  token: string;
} {
  const id = crypto.randomBytes(idLength / 2).toString("hex");
  const secret = crypto.randomBytes(secretLength / 2).toString("hex");
  const secretHash = crypto.createHash("sha256").update(secret).digest("hex");
  const token = `${id}_${secret}`;
  return { id, secret, secretHash, token };
}

/**
 * Used to create a long salt for each individual user
 * @returns a 256 byte / 512 character hex string
 */
export function generateSalt(): Promise<string> {
  return new Promise((resolve) => {
    crypto.randomBytes(256, function (ex, salt) {
      resolve(salt.toString("hex"));
    });
  });
}

/**
 * Hashes passwords through sha512 1000 times
 * returns a 512 byte / 1024 character hex string
 * @param password
 * @param salt
 * @param iterations
 * @returns
 */
export function hashPassword(
  password: string,
  salt: string,
  iterations: number
): Promise<string> {
  return new Promise((resolve) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      512,
      "sha512",
      function (err, hash) {
        resolve(hash.toString("hex"));
      }
    );
  });
}

/**
 * Utility function generates a salt and hash from a plain text password
 * @param password The plain text password to hash
 * @returns
 */
export async function generatePassword(password: string): Promise<Password> {
  const salt = await generateSalt();
  const hash = await hashPassword(password, salt, config.passwordIterations);
  return {
    salt,
    hash,
    iterations: config.passwordIterations,
    tries: 0
  };
}

/**
 * Validate 2FA TOTP token
 *
 * @param secret The secret key encoded in base32
 * @param token The token to validate
 * @param window The larger this value is, the greater the time difference between the user and server that will be tolerated, but it also becomes increasingly less secure.
 * @returns
 */
export const validateTotpToken = (
  secret: string,
  token: string,
  window = 1
) => {
  const totp = new TOTP({
    secret: Secret.fromBase32(secret)
  });

  const delta = totp.validate({ token, window });
  const isValid = delta === 0;

  return {
    isValid,
    delta
  };
};

export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] || null;
  }
  return null;
}

/**
 * Check if password hash matches the raw password.
 * @param passwordData Password data from database
 * @param passwordRaw Raw password
 * @returns Whether the password is valid or not
 */
export async function isValidPassword(
  passwordData: Password,
  passwordRaw: string
): Promise<LOGIN_CODES> {
  if (passwordData.tries >= config.passwordTries) {
    return LOGIN_CODES.LOCKED;
  }

  // No password set
  if (passwordData.iterations === 0) {
    return LOGIN_CODES.LOGIN_FAILED;
  }

  const hash = await hashPassword(
    passwordRaw,
    passwordData.salt,
    passwordData.iterations
  );
  // Check if password hash matches
  return !!passwordData.salt && hash === passwordData.hash
    ? LOGIN_CODES.LOGGED_IN
    : LOGIN_CODES.LOGIN_FAILED;
}

export function login(req: Request, contact: Contact): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    req.login(contact, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
