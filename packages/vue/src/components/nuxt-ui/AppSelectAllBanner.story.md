# AppSelectAllBanner

The step between selecting a page of rows and acting on every row that
matches the filters. Show it once every row on the current page is selected
and there are more pages; the caller decides that, and keeps the selection
state.

`keyPrefix` lets a page use its own wording ("contacts" rather than "items"),
as long as its keys follow the same five names.
