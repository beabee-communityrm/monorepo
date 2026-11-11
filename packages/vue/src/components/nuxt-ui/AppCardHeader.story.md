# AppCardHeader

The standard card header, for a `UCard` whose body or footer needs its own
layout: an edge-to-edge list, a footer link, or anything else `AppSectionCard`
doesn't cover. For a section of stacked content, such as a group of form
fields, use `AppSectionCard`, which already includes this header.

A reusable header can't know how deeply its card sits in a page, so `level` is
the caller's to set — 3 suits a card under a page's `h2`.

Rows in an edge-to-edge list line up with the header when they use the same
padding as `UCard`'s header (`p-4 sm:px-6`).
