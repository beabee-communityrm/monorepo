# AppTablePagination

Pagination footer shared by paginated tables and lists, so they stay
consistent.

`page` is zero-based, matching the API's offset-based queries. The rows-per-page
options are the same for every table (12, 25, 50 and 100, as on the legacy
tables). Pass `pageSize` instead for a list with a fixed size, which hides the
selector.

The range ("1–25 of 50") stands in for a separate "showing" line above the
table.
