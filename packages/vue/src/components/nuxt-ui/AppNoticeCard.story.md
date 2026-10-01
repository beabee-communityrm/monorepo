# AppNoticeCard

A tinted card for a short in-page notice — a confirmation, or the reason a page
can't be used yet — where interrupting with a modal would be too much.

The title renders as a heading, so a labelled block of content appears in the
screen-reader outline where users expect to find it. A reusable card can't know
how deeply it sits in a page, so `level` is the caller's to set — 3 suits a card
under a page's `h2`. Getting it wrong skips a level and breaks the outline, so
it's worth checking against the page it's used on.

`color` tints the icon, border and background. `success` also colours the
title, since a confirmation reads as affirmative; `primary` leaves the title
neutral so it doesn't compete with surrounding content.
