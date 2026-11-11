---
name: contextual-i18n-translator
description: Translates new i18n strings into every supported locale, using the codebase and existing translations for context. Use this skill whenever the user wants to add, translate, localize or fill in new i18n/l10n strings, translation keys, locale files or message catalogs.
---

# i18n Translator

Translate new UI strings so they read as if a native speaker wrote them for this app. The work has two checkpoints with the user: first agree on the English, then fill every locale.

## Inputs

The user gives you:

- **New strings**: usually keys, sometimes with source text (in English or another language), sometimes keys only.
- **Context**: what the feature is, where the strings appear, a ticket, a PR, a screenshot, a description. Any amount.

If the user gives no keys at all, or you can't tell which strings are new, ask before doing anything else.

## Step 0: Learn the i18n setup

Before translating, find out how this project does i18n. Look for:

- The locale files (JSON formatted) in `/packages/locale/src/locales` and the list of supported languages
- How keys are organized: namespaces, nesting, naming style, whether keys are sorted alphabetically.

If you can't find the locale files or the list of locales, ask the user. Don't guess file paths.

## Step 1: Situate the strings in the codebase

For each new key, find where it is (or will be) used:

- Search for the key in the code. If it's not used yet, find the feature area from the user's context and read the related components.
- Read the code around the usage. Work out:
  - **What UI element it is**: button, page title, form label, placeholder, tooltip, error message, toast, email subject, empty state, etc. This changes the grammar. A button is usually a verb ("Save"), a title is usually a noun phrase ("Account settings").
  - **What each placeholder holds**: a name, a number, a date, a link, another translated string. Numbers mean you need plural forms.
  - **Who reads it and when**: a first-time user, an admin, someone who just hit an error.
- Look at sibling keys in the same namespace or file. They show the tone and terms used nearby.

Write a short note per key: where it appears and what it does. You'll show this to the user in Step 4.

If a key's purpose is still unclear after reading the code, say so and ask. A wrong guess here leads to wrong translations in every language.

## Step 2: Work out the meaning

If source text was given (in English or another language), don't treat its wording as fixed. Set its structure aside and ask:

- What is the author actually trying to say?
- What should the user of the app understand from these words?

Write the answer in one plain sentence per key. This "meaning note" is what you translate from, not the source words. For example:

- Source: "Your session has been terminated due to inactivity."
- Meaning: You were signed out because you didn't do anything for a while; sign in again to continue.

If the source text and the code seem to disagree (e.g. text says "Delete" but the handler archives), point it out to the user.

## Step 3: Reuse existing vocabulary

The app already has translations. New strings must match them so the UI feels consistent.

1. List the key terms in the new strings: product nouns ("workspace", "project"), actions ("log in", "share", "archive"), and UI words ("settings", "dashboard").
2. For each term, search the existing locale files, in every locale, for strings that contain it. Note how each locale translates it.
3. Build a small glossary: term → translation per locale, with an example key where you found it.
4. Reuse these translations. If "login" is already "Anmeldung" in German, then "login required" uses "Anmeldung" too, not "Login" or "Einloggen". Adjust grammar (case, gender, verb form) as the language needs, but keep the same word.
5. Also copy the existing style per locale:
   - Formal or informal "you" (German Sie/du, French vous/tu, Spanish usted/tú, Dutch u/je, etc.). Check several strings to be sure.
   - Capitalization (sentence case vs. title case), punctuation (ellipsis "…" vs "...", quote marks like « » or „ "), and whether buttons end with periods.

If a term is translated two different ways in the same locale, don't pick silently. Use the more common one and mention the inconsistency to the user.

If a term has no existing translation, choose the standard term that well-known apps use in that language, and list it as a new term in your report.

## Step 4: Agree on the English (checkpoint, always stop here)

Show the user a table like this:

| Key                  | Where it appears                    | Meaning                              | English                  | Notes                             |
| -------------------- | ----------------------------------- | ------------------------------------ | ------------------------ | --------------------------------- |
| `auth.loginRequired` | Banner on /settings when signed out | You need to sign in to see this page | Log in to view this page | Reuses "Log in" from `auth.login` |

Then:

- **(a) If the user gave no English**: fill the English column with your proposal.
- **(b) If the user gave English**: show their text and, in Notes, suggest changes only where they help. Good reasons: unclear meaning, doesn't match existing English terms, awkward for the UI element, grammar or tone issues, plural not handled. Give the reason for each suggestion in a few words. If their text is fine, say so.

End with a short question asking the user to confirm or edit. **Stop and wait.** Do not write any locale files before the user confirms the English. The English is the reference all other locales are checked against, so mistakes here spread everywhere.

## Step 5: Translate into every locale

After the user confirms, translate each key into every supported locale, including updating the English file.

### Make it idiomatic

- Translate the meaning note and the confirmed English together, not word by word. The result should sound like it was written in that language for this screen.
- Use the natural phrasing for that UI element in that language. Many languages use the infinitive for buttons (French "Enregistrer", German "Speichern"), where English uses the imperative.
- Restructure sentences when the language needs it. Word order, placement of placeholders and sentence length can all change.
- Keep the length reasonable for tight UI elements. If a natural translation is much longer, prefer a shorter natural one and flag it.
- Follow the vocabulary and style from Step 3.

### Write the files

- Add keys in the same place and order the project uses (alphabetical, grouped by feature, or appended, whichever the file already does).
- Change only the new keys. Don't reformat or reorder anything else.

## Step 6: Report

Give the user a short summary:

- The table of keys with every locale's value, or the list of files changed if the table would be very large.
- Glossary terms you reused, and any new terms you introduced.
- **Items you're unsure about**: for each, the locale, the key and why (unfamiliar language, ambiguous meaning, length concern, gender/case issue). Say plainly when you're not confident. Never present a guess as certain. Suggest a native speaker review these.
- Any inconsistencies you found in existing translations (don't fix them unless the user asks).

## Things to avoid

- Writing locale files before the English is confirmed.
- Translating from the English words when the meaning note says something different.
- Introducing a new word for a concept the app already has a translation for.
- Mixing formal and informal "you" within a locale.
- Machine-literal phrasing, e.g. calques of English idioms or English word order.
- Guessing what a key means when the code and context don't make it clear. Ask instead.
