# AppModalDialog

A `UModal` with a standardised icon + title + description header, used
instead of `UModal`'s own `title`/`description` props so the icon
vertically centers against the whole title+description block, not just
the title line.

Set `titleInBody` for confirmation dialogs whose title is long and reads
better as a heading in the body — the real `DialogTitle` (the actual
`aria-labelledby` target) renders as the first body element instead of in
the header, which then shows only the icon. Never a hidden duplicate: the
text people see is always the real heading.

Put footer buttons (e.g. `AppModalActions`) in the `actions` slot — it's
rendered inline with the body content, not as a separately bordered
footer.
