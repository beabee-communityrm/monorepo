import { getRepository } from '@beabee/core/database';
import { Contact } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';

import passport from 'passport';

// Authentication happens via OpenID Connect (see the API's auth routes),
// passport is only used for session (de)serialisation

// Passport.js serialise user function
passport.serializeUser(function (data, done) {
  done(null, (data as Contact).id);
});

// Passport.js deserialise user function
passport.deserializeUser(async function (data, done) {
  try {
    if (typeof data === 'string') {
      const contact = await ContactsService.findOneBy({ id: data });
      if (contact) {
        // Debounce last seen updates, we don't need to know to the second
        const now = new Date();
        if (!contact.lastSeen || +now - +contact.lastSeen > 60000) {
          // Don't use ContactsService.updateContact to avoid overhead
          await getRepository(Contact).update(contact.id, { lastSeen: now });
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

export default passport;
