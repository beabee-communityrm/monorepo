import passport from "passport";
import passportLocal from "passport-local";

import { config } from "@beabee/config";

import {
  database,
  log,
  cleanEmailAddress,
  sleep,
  generatePassword,
  isValidPassword,
  contactsService,
  contactMfaService,
  ContactMfaSecure,
  UnauthorizedError,
  PassportLocalDoneCallback
} from "@beabee/core";

import { CONTACT_MFA_TYPE, LOGIN_CODES } from "@beabee/beabee-common";
import { LoginDto } from "@api/dto/LoginDto";

import { Contact } from "@beabee/models";

// Add support for local authentication in Passport.js
passport.use(
  new passportLocal.Strategy(
    {
      usernameField: "email",
      passReqToCallback: true
    },
    async function (
      req: { body: LoginDto },
      email: string,
      password: string,
      done: PassportLocalDoneCallback
    ) {
      const token = req.body.token;

      email = cleanEmailAddress(email);

      const contact = await contactsService.findOneBy({ email });

      let code = LOGIN_CODES.LOGIN_FAILED;

      // Check if contact for email exists
      if (contact) {
        code = await isValidPassword(contact.password, password);

        if (code === LOGIN_CODES.LOGGED_IN) {
          // Reset tries
          await contactsService.resetPasswordTries(contact);

          // Check if password needs to be rehashed
          if (contact.password.iterations < config.passwordIterations) {
            await contactsService.updateContact(contact, {
              password: await generatePassword(password)
            });
          }

          // Check MFA
          const mfa = await contactMfaService.get(contact);
          if (mfa) {
            return loginWithMfa(mfa, contact, token, done);
          }

          // User is logged in without 2FA
          return done(null, contact, { message: LOGIN_CODES.LOGGED_IN });
        } else {
          await contactsService.incrementPasswordTries(contact);
        }
      }

      // Delay by 1 second to slow down password guessing
      await sleep(1000);
      return done(null, false, { message: code });
    }
  )
);

/**
 * Check if multi factor authentication is enabled and supported
 * @param mfa The multi factor authentication information
 * @param contact The contact
 * @param token The multi factor authentication token
 * @param done The passport done callback
 */
const loginWithMfa = async (
  mfa: ContactMfaSecure,
  contact: Contact,
  token: string | undefined,
  done: PassportLocalDoneCallback
) => {
  if (mfa.type !== CONTACT_MFA_TYPE.TOTP) {
    log.warn("The user has unsupported 2FA enabled.");
    // We pass the contact to the done callback so the user can be logged in and the 2FA is ignored
    return done(null, contact, {
      message: LOGIN_CODES.UNSUPPORTED_2FA
    });
  }

  // If user has no token, notify client that 2FA is required
  if (!token) {
    return done(
      new UnauthorizedError({ code: LOGIN_CODES.REQUIRES_2FA }),
      false
    );
  }

  // Check token..
  const { isValid, delta } = await contactMfaService.checkToken(
    contact,
    token,
    1
  );

  // .. if invalid notify client
  if (!isValid) {
    return done(
      new UnauthorizedError({
        code: LOGIN_CODES.INVALID_TOKEN,
        message: "Invalid 2FA token" + delta ? ` (delta: ${delta})` : ""
      }),
      false
    );
  }

  // Looks good, return user
  return done(null, contact, { message: LOGIN_CODES.LOGGED_IN });
};

// Passport.js serialise user function
passport.serializeUser(function (data, done) {
  done(null, (data as Contact).id);
});

// Passport.js deserialise user function
passport.deserializeUser(async function (data, done) {
  try {
    if (typeof data === "string") {
      const contact = await contactsService.findOneBy({ id: data });
      if (contact) {
        // Debounce last seen updates, we don't need to know to the second
        const now = new Date();
        if (!contact.lastSeen || +now - +contact.lastSeen > 60000) {
          // Don't use contactsService.updateContact to avoid overhead
          await database
            .getRepository(Contact)
            .update(contact.id, { lastSeen: now });
          contact.lastSeen = now;
        }

        return done(null, contact);
      }
    }
    done(null, false);
  } catch (err) {
    done(err);
  }
});

export { passport };
