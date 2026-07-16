# AppCodeInput

A segmented digit-entry input for confirmation codes (2FA setup/disable,
etc.) where the code can only be validated by the server, not client-side.
The invalid-code ring is controlled by the `error` prop — the parent decides
when the server rejected the code. It deliberately doesn't render an error
message itself, since where that belongs relative to surrounding content
varies per layout; render your own alert wherever it fits.
