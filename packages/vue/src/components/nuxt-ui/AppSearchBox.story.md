# AppSearchBox

For searches that make a request, such as filtering a list from the API.
`v-model` is updated once typing pauses for 300ms, or straight away on Enter,
so the list isn't refetched on every keystroke. If the applied search changes
from outside, for example through the URL or the back button, the box follows
it.

Named to sit alongside the legacy `AppSearchInput` until that's removed.
