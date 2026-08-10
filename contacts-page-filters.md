# Contacts Page Filters

Filters available on the admin Contacts page (`apps/frontend/src/pages/admin/contacts/index.vue`), grouped as shown in the UI, with the operators allowed for each field's type.

## Operators by type

| Type | Operators (label — meaning) |
|---|---|
| **text** | is, is not, contains, doesn't contain, begins with, doesn't begin with, ends with, doesn't end with, *(is empty, isn't empty — always allowed for text)* |
| **date** | is on, is not on, before, before or on, after, after or on, between, isn't between, *(is empty, isn't empty — only if field is nullable)* |
| **number** | is, isn't, less than, at most, more than, at least, between, isn't between |
| **boolean** | is *(only operator — no "is not", no empty/not-empty)* |
| **enum** | is, is not |
| **array / multi-select** | includes, doesn't include, is empty, isn't empty |
| **contact** (id field) | is, is not |

Note: "is empty" / "isn't empty" are automatically available for `text` and `array` types; for other types they only appear if that specific field is explicitly marked nullable (e.g. Recurring contribution cancelled, Manual payment source).

## Contact information

| Field | Type | Operators available |
|---|---|---|
| First name | text | is, is not, contains, doesn't contain, begins with, doesn't begin with, ends with, doesn't end with, is empty, isn't empty |
| Last name | text | same as above |
| Email | text | same as above |
| Joined | date | is on, is not on, before, before or on, after, after or on, between, isn't between |
| Last seen | date | same as above |
| Newsletter status | enum (Subscribed, Unsubscribed, Cleaned, Pending, None) | is, is not |
| Newsletter groups | array (options loaded from newsletter provider) | includes, doesn't include, is empty, isn't empty |
| Tags | array (options loaded from contact tags) | includes, doesn't include, is empty, isn't empty |
| Delivery opt-in | boolean | is |

## Recurring contributions

| Field | Type | Operators available |
|---|---|---|
| Recurring contribution type | enum (Automatic, Manual, None, Gift) | is, is not |
| Recurring contribution monthly amount | number (shown with org currency symbol) | is, isn't, less than, at most, more than, at least, between, isn't between |
| Recurring contribution period | enum (Monthly, Annually) | is, is not |
| Recurring contribution cancelled | date, **nullable** | is on, is not on, before, before or on, after, after or on, between, isn't between, is empty, isn't empty |
| Manual payment source | text, nullable | is, is not, contains, doesn't contain, begins with, doesn't begin with, ends with, doesn't end with, is empty, isn't empty |

## One-time contributions
*(only shown if one-time donations are enabled)*

| Field | Type | Operators available |
|---|---|---|
| Made one-time contribution | boolean | is |
| One-time contribution date | date | is on, is not on, before, before or on, after, after or on, between, isn't between |
| Total amount of one-time contributions (all time) | number | is, isn't, less than, at most, more than, at least, between, isn't between |
| Average amount of one-time contributions (all time) | number | same as above |

## Role

| Field | Type | Operators available |
|---|---|---|
| Active role | enum (member, admin, superadmin) | is, is not |
| Active membership | boolean | is |
| Active user | boolean | is |
| Member since | date | is on, is not on, before, before or on, after, after or on, between, isn't between |
| Member until | date | same as above |

## CrowdNewsroom (Callouts) — dynamic group

Not a static field list — the user first picks a specific crowdNewsroom, and the filter options split into two sub-groups: **"Response information"** (metadata about the response) and **"Response answers"** (the actual form answers). A "Has participated?" toggle sits above both.

### Has participated?

| Field | Type | Operators available |
|---|---|---|
| Has participated? (`hasAnswered`) | boolean | is |

### Response information

Fixed set of fields, same for every crowdNewsroom:

| Field | Type | Operators available | Notes |
|---|---|---|---|
| Date submitted (`createdAt`) | date | is on, is not on, before, before or on, after, after or on, between, isn't between | |
| Assigned to (`assignee`) | enum, nullable | is, is not, is empty, isn't empty | options = list of reviewers for that crowdNewsroom |
| Bucket (`bucket`) | enum, nullable | is, is not, is empty, isn't empty | options: Inbox / Verified / Trash |
| Tags (`tags`) | array | includes, doesn't include, is empty, isn't empty | options = that crowdNewsroom's response tags |

*(The underlying schema also defines `id`, `contact`, `calloutId`, and `updatedAt`, but these aren't currently exposed as selectable filters in the UI.)*

### Response answers

Dynamic — one filter per question in that crowdNewsroom's form, keyed by slide + question key. **Every question type collapses to exactly one flat filter — there is no sub-field breakdown even for structured answer types like address or file upload.** Mapping from question type to filter type:

| Question (component) type | Filter type | Operators available | Notes |
|---|---|---|---|
| Checkbox | boolean | is | |
| Number | number | is, isn't, less than, at most, more than, at least, between, isn't between | |
| Select (dropdown) | enum | is, is not | options = that question's choices |
| Radio (incl. branching/decision radios) | enum | is, is not | options = that question's choices |
| Checkboxes (select multiple) | array | includes, doesn't include, is empty, isn't empty | one filter for the whole set — not one filter per option |
| Text area | blob | contains, doesn't contain | |
| Text field, Email, URL, Phone number, Signature, Time, Date/time, Currency, **Address**, **File upload** | text (default/fallback) | is, is not, contains, doesn't contain, begins with, doesn't begin with, ends with, doesn't end with, is empty, isn't empty | Address and File upload store richer structured data internally (e.g. postcode/city/coordinates, or filename/size/URL) but currently expose only this single flat text filter — no postcode-only or filename-only filter exists |
| Content (static text/heading blocks) | — | — | not a question, never produces a filter |
| Panel / Tabs / Well (layout containers grouping other questions) | — | — | the container itself produces no filter; each question nested inside it still gets its own independent flat filter, same as if it weren't grouped |

Questions repeated across multiple slides of the same form produce separate filter entries per slide (each keyed to its own slide), not one merged filter.

## Notes

- No separate "contact custom fields" mechanism exists — the only dynamic filters are the per-crowdNewsroom response fields above.
- Newsletter groups and Tags are static filter *fields*, but their dropdown *options* are populated live from backend data (newsletter provider / contact tag list) rather than being hardcoded.
- Source: `packages/common/src/search/contacts.ts` (field/type definitions), `packages/common/src/search/operators.ts` (operator-by-type map), `packages/common/src/utils/rules.ts` (nullable-operator logic), `apps/frontend/src/components/pages/admin/contacts/contacts.interface.ts` (UI grouping), labels from `packages/locale/src/locales/en.json`.
