# AppFormSkeleton

A stack of skeleton "field" bars, for placeholder content while a form's
real data is still loading — typically inside a `<Suspense>` `#fallback`
alongside the real (already-known) card titles/labels, so only the fields
that genuinely depend on the fetch show as skeletons.
