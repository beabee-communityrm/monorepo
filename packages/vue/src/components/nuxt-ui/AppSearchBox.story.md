# AppSearchBox

For searches that make a request, such as filtering a list from the API.
Typing only changes the box; `v-model` is updated on Enter or blur, so the
list isn't refetched on every keystroke. If the applied search changes from
outside, for example through the URL or the back button, the box follows it.

Named to sit alongside the legacy `AppSearchInput` until that's removed.
