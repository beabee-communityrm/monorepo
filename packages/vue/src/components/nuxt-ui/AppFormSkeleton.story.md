# AppFormSkeleton

A stack of skeleton "field" bars, for placeholder content while a form's
real data is still loading — typically inside a `<Suspense>` `#fallback`
alongside the real (already-known) card titles/labels, so only the fields
that genuinely depend on the fetch show as skeletons.

A fragment component (no wrapping element) — the bars become direct
children of wherever it's used, so inside an `AppSectionCard`'s body they
pick up its own spacing automatically, same as real fields would.
