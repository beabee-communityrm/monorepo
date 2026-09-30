# AppWelcomeCard

Greets a new member on the home page straight after they join, with the intro
message an admin sets in the membership builder. The membership builder uses it
for its preview too, with `dismissible` off.

`text` is rich-text HTML with its own paragraphs, so it renders into a `div`
rather than a `p`. The card relies on `.nuxt-page` for its heading and body
text styles, so the caller needs to sit inside one.

The icon tile uses `bg-cream`, a colour defined for this card in
`tailwind.css` with its own dark-mode value.
