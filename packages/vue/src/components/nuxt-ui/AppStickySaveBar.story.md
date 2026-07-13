# AppStickySaveBar

A sticky "unsaved changes" bar with Cancel/Save actions, meant for forms
living inside the Dashboard layout. Teleports into that layout's
`#sticky-bottom-banner` target (see `layout-Dashboard.vue` in the frontend
app) so it renders full-width and flush against the page footer, regardless
of where in the page the calling form lives.

Since the bar is Teleported outside the calling `<form>`'s own DOM subtree,
the Save button can't rely on native form ancestry — pass the form's `id`
via the `form` prop, which is forwarded to the button's native `form`
attribute to re-establish that association.

The caller owns visibility (`v-if="dirty"`); this component only renders
the bar's contents and emits `cancel`. The Save button's loading state is
`loading-auto`, so `UForm`'s own submission state drives the spinner
automatically — no manual `saving` prop needed.

No "saved" checkmark state, deliberately: the bar is typically unmounted
(via `v-if="dirty"`) the same tick a save succeeds, so a checkmark would
never actually render. Success feedback is the site's existing toast
notification, shown by the caller — not tied to this component's lifecycle.
