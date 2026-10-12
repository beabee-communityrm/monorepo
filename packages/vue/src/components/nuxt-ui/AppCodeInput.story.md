# AppCodeInput

A segmented digit-entry input for confirmation codes (2FA setup/disable,
etc.) where the code can only be validated by the server, not client-side.
The invalid-code ring is controlled by the `error` prop — the parent decides
when the server rejected the code. It doesn't render an error
message itself — wrap it in a `UFormField` and pass the message via its
`error` prop, same as any other field.
