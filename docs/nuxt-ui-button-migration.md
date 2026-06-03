# AppButton → UButton Migration: Decision Record

## Goal

Rewrite `packages/vue/src/components/button/AppButton.vue` to wrap Nuxt UI's `UButton` component, updating all consumers across `packages/vue` and `apps/frontend`.

---

## Scope

### In scope
- `packages/vue/src/components/button/AppButton.vue` — full rewrite
- `packages/vue/src/components/button/AppAsyncButton.vue` — update props
- `packages/vue/src/components/button/AppDropdownButton.vue` — update to new AppButton API (see below); do NOT migrate to UDropdownMenu
- `packages/vue/src/components/form/AppForm.vue` — update variant props
- `packages/vue/src/components/form/AppRepeatable.vue` — update variant + icon props
- `packages/vue/src/components/form/AppRichTextEditorButton.vue` — change `icon` prop type from `IconDefinition` to `string`
- `packages/vue/src/components/form/AppRichTextEditor.vue` — update 8 icon usages to Iconify strings
- `packages/vue/src/components/form/AppIconPicker.vue` — move icon out of `icon` prop into default slot (see below)
- `packages/vue/src/components/layout/AppExpandableBox.vue` — update `icon` prop type + call sites
- `packages/vue/src/components/navigation/AppPagination.vue` — update variant + icon props
- `apps/frontend/src/components/forms/AppImageUpload.vue` — rename `is="label"` → `as="label"`
- `apps/frontend/src/components/pages/profile/account/SetMFA.vue` — keep `focus()` usage, no API change needed
- All ~45 remaining AppButton call sites in `apps/frontend` — update `variant` to `color` + `variant`
- `packages/vue/vite.config.ts` — add `ui()` plugin + `@nuxt/ui` external (already done)
- `apps/frontend/vite.config.ts` — add shared Nuxt UI options
- New file: `packages/vue/src/lib/nuxt-ui-options.ts` — shared Nuxt UI plugin config

### Out of scope
- Migrating `AppDropdownButton` to `UDropdownMenu` — separate PR
- Migrating `AppButtonGroup` to `UFieldGroup` — keep as-is for now
- Any other refactoring not directly required by the AppButton API change

---

## Decisions

### 1. Props API — `variant` → `color` + `variant`

**Decision:** Replace the single `variant` prop with separate `color` and `variant` props matching the UButton API. All call sites updated. No backward-compat shim.

**Variant mapping (old → new):**

| Old `variant` | New `color` | New `variant` |
|---|---|---|
| `primary` | `primary` | `solid` |
| `link` | `link` | `solid` |
| `danger` | `danger` | `solid` |
| `primaryOutlined` | `primary` | `outline` |
| `linkOutlined` | `link` | `outline` |
| `dangerOutlined` | `danger` | `outline` |
| `greyOutlined` | `neutral` | `outline` |
| `text` | `link` | `link` |
| `dangerText` | `danger` | `link` |
| `dangerGhost` | `danger` | `ghost` |

**Default values:** `color="primary"` `variant="solid"` (matches old default of `variant="primary"`).

**`DropdownButtonVariant` type in AppDropdownButton** is also updated to the new API.

### 2. Nuxt UI Theme — Color Configuration

**Decision:** Configure the `ui()` Vite plugin with the custom color names so UButton generates the correct Tailwind classes.

**Colors to register:** `primary`, `link`, `danger` (plus `neutral` which UButton always includes).

These names match the existing Tailwind tokens (`--color-primary`, `--color-link`, `--color-danger`) defined in `packages/vue/src/styles/tailwind.css`, so classes like `bg-primary`, `text-danger`, `ring-link` will resolve correctly at runtime via CSS variables.

**Hover behaviour change (accepted):** Old code used separate colour tokens (`hover:bg-primary-80`). UButton uses opacity modifiers (`hover:bg-primary/75`). Visual drift is acceptable.

### 3. Icon System — Switch to Iconify Strings

**Decision:** Replace the `icon: IconDefinition` prop with `icon: string` (Iconify format). Install `@iconify-json/fa6-solid` and `@iconify-json/fa6-regular` so icons are bundled locally at build time (not fetched from CDN at runtime).

**Packages to install:**
```
yarn add @iconify-json/fa6-solid @iconify-json/fa6-regular
```

**Icon name format:** `"fa6-solid:folder"`, `"fa6-solid:user"`, `"fa6-solid:tag"`, etc.

**Iconify string mappings for existing usages:**

| FA import | Iconify string |
|---|---|
| `faFolder` | `"fa6-solid:folder"` |
| `faUser` | `"fa6-solid:user"` |
| `faTag` | `"fa6-solid:tag"` |
| `faPlus` | `"fa6-solid:plus"` |
| `faStepBackward` | `"fa6-solid:backward-step"` |
| `faCaretLeft` | `"fa6-solid:caret-left"` |
| `faCaretRight` | `"fa6-solid:caret-right"` |
| `faStepForward` | `"fa6-solid:forward-step"` |
| `faBold` | `"fa6-solid:bold"` |
| `faItalic` | `"fa6-solid:italic"` |
| `faUnderline` | `"fa6-solid:underline"` |
| `faStrikethrough` | `"fa6-solid:strikethrough"` |
| `faHeading` | `"fa6-solid:heading"` |
| `faList` | `"fa6-solid:list"` |
| `faListOl` | `"fa6-solid:list-ol"` |
| `faLink` | `"fa6-solid:link"` |

**`AppIconPicker` special case:** This component is a FontAwesome icon picker — it uses `:icon="[modelValue.prefix, modelValue.name]"` (FA array syntax) which cannot be expressed as an Iconify string. **Solution:** Remove the `icon` prop usage entirely; put `<font-awesome-icon>` in AppButton's default slot instead. No call-site changes needed since AppIconPicker is self-contained.

**`AppExpandableBox` special case:** Has a prop `buttonIcon: IconDefinition` passed to AppButton's `icon` prop. Change prop type to `string`. All callers of AppExpandableBox need to pass Iconify strings.

**`AppRichTextEditorButton`:** Change `icon: IconDefinition` prop to `icon: string`. Update `AppRichTextEditor.vue` (8 call sites) to Iconify strings.

### 4. `is` prop → `as` prop

**Decision:** Rename `is` prop to `as` to match UButton's prop name. Update the one call site:
- `apps/frontend/src/components/forms/AppImageUpload.vue`: `is="label"` → `as="label"`

### 5. `external` prop

**Decision:** Pass `external` straight through to UButton — it already understands this prop natively. Remove the manual `target="_blank" rel="noopener noreferrer"` logic from AppButton.

### 6. `focus()` expose

**Decision:** Re-expose `focus()` in the wrapper. UButton does not `defineExpose` anything. Hold a `ref` on the UButton instance and forward `focus()` via `$el.focus()`. Keep `innerButton` exposed as well for the one caller (`SetMFA.vue` line 274).

**Why it's needed:** `SetMFA.vue` programmatically focuses the save button when a multi-step slider reaches its final step (accessibility — user can press Enter to confirm).

### 7. `after` slot

**Decision:** The `#after` slot cannot be directly mapped to UButton's `trailing` slot (UButton's trailing is inline content, not absolutely positioned overlays). `AppDropdownButton` uses `#after` to render its dropdown panel.

**Solution for AppDropdownButton:** Restructure AppDropdownButton to NOT use the `#after` slot. Instead, wrap a `UButton` and the dropdown panel in a `<div class="relative">`. The dropdown panel is a sibling of the button, not a child. All keyboard/outside-click logic stays the same. The `#after` slot is dropped from AppButton entirely.

### 8. Loading state visual

**Decision:** Accept the visual change. UButton's loading replaces the leading icon with a spinner. The old AppButton rendered a white opacity overlay + spinning FA icon. No override needed.

### 9. Size overrides

**Decision:** Keep Nuxt UI's default padding for all sizes, but override the font sizes to match current values.

| Size | UButton default font | Override to |
|---|---|---|
| `xs` | `text-xs` | `text-sm` |
| `sm` | `text-xs` | `text-sm` |
| `md` | `text-sm` | keep default |
| `lg` | `text-sm` | keep default |

UButton also has an `xl` size (not in old AppButton) — leave it as-is.

These overrides go in the shared `nuxtUiOptions` config.

### 10. `AppButtonGroup`

**Decision:** Keep `AppButtonGroup` as-is. The current CSS group selectors (`group-[]/btns:...`) are applied via `class` on UButton, which passes `class` to its root element. The visual connected-button treatment should continue to work. No changes needed.

### 11. Vite Plugin Configuration

**Decision:** `packages/vue/vite.config.ts` already updated (done in this session):
- Added `ui()` to plugins — needed for dev server / Histoire stories
- Added `@nuxt/ui` to `rollupOptions.external` — UButton stays as a runtime dep, not bundled

**Shared options:** Create `packages/vue/src/lib/nuxt-ui-options.ts` and import it in both vite configs. Accepted tradeoff: apps/frontend's vite.config.ts imports from packages/vue TS source at build time — this works because Vite processes configs with esbuild, but creates coupling.

```ts
// packages/vue/src/lib/nuxt-ui-options.ts
export const nuxtUiOptions = {
  theme: {
    colors: ['primary', 'link', 'danger']
  },
  ui: {
    button: {
      variants: {
        size: {
          xs: { base: 'text-sm' },
          sm: { base: 'text-sm' },
        }
      }
    }
  }
}
```

Both vite configs:
```ts
import { nuxtUiOptions } from '@beabee/vue/lib/nuxt-ui-options'
ui(nuxtUiOptions)
```

### 12. `AppAsyncButton`

`AppAsyncButton` extends `AppButtonProps` and spreads all props onto `<AppButton>` via `forwardedButtonProps`. It will inherit the new API automatically. The `forwardedButtonProps` computed excludes `onClick` — no logic change needed, just type update.

### 13. `AppDropdownButton` — icons

`AppDropdownButton` has `icon: IconDefinition` prop. Change to `icon: string` (Iconify). Update its 5 call sites in `apps/frontend`:

| File | Old icon | Iconify string |
|---|---|---|
| `MoveBucketButton.vue` | `faFolder` | `"fa6-solid:folder"` |
| `SetAssigneeButton.vue` | `faUser` | `"fa6-solid:user"` |
| `ToggleTagButton.vue` | `faTag` | `"fa6-solid:tag"` |
| `CalloutMapHeader.vue` | (check file) | (check file) |
| `contacts/index.vue` | `faMailBulk` | `"fa6-solid:envelopes-bulk"` |

### 14. `AppForm.vue` — `variant="error"` 

**Not a bug in AppButton usage.** The `variant="error"` in AppForm is on `<AppNotification>`, not `<AppButton>`. The two AppButton usages in AppForm are `variant="link"` and `variant="text"` — both valid, both need updating to `color`/`variant` props.

### 15. `AppRichTextEditorButton` — `active` state

The component currently uses `:variant="active ? 'primary' : 'primaryOutlined'"`. With new API: `:color="'primary'" :variant="active ? 'solid' : 'outline'"`.

### 16. `_theme.vue` page

`apps/frontend/src/pages/_theme.vue` has 9 AppButton usages showing all variants. Update all to the new API. Note `dangerGhost` variant is shown here but not used elsewhere — confirm its mapping (`color="danger" variant="ghost"`) is tested on this page.

### 17. Tailwind / Nuxt UI config not in `@beabee/vue/styles`

The shared CSS entry (`packages/vue/src/styles/index.css`) is CSS-only. Nuxt UI plugin options (JS config) cannot live there. Central config lives in `packages/vue/src/lib/nuxt-ui-options.ts` instead.

---

## Files Changed Summary

| File | Change |
|---|---|
| `packages/vue/vite.config.ts` | Add `ui()` plugin, `@nuxt/ui` external ✅ done |
| `apps/frontend/vite.config.ts` | Import + use `nuxtUiOptions` |
| `packages/vue/src/lib/nuxt-ui-options.ts` | New file — shared Nuxt UI plugin config |
| `packages/vue/src/components/button/AppButton.vue` | Full rewrite as UButton wrapper |
| `packages/vue/src/components/button/AppAsyncButton.vue` | Update prop types |
| `packages/vue/src/components/button/AppDropdownButton.vue` | Restructure (remove #after dependency), new icon/color+variant API |
| `packages/vue/src/components/form/AppForm.vue` | Update 2 AppButton usages |
| `packages/vue/src/components/form/AppRepeatable.vue` | Update variant + icon |
| `packages/vue/src/components/form/AppRichTextEditorButton.vue` | `icon` prop: `IconDefinition` → `string` |
| `packages/vue/src/components/form/AppRichTextEditor.vue` | Update 8 icon usages to Iconify strings |
| `packages/vue/src/components/form/AppIconPicker.vue` | Remove `icon` prop usage, use slot |
| `packages/vue/src/components/layout/AppExpandableBox.vue` | `buttonIcon` prop: `IconDefinition` → `string` |
| `packages/vue/src/components/navigation/AppPagination.vue` | Update 4 variant + icon usages |
| `apps/frontend/src/components/forms/AppImageUpload.vue` | `is="label"` → `as="label"` |
| ~45 other call sites in `apps/frontend` | Update `variant` → `color` + `variant` |

---

## Verification Steps

After implementation:
1. `yarn add @iconify-json/fa6-solid @iconify-json/fa6-regular` at workspace root
2. `yarn workspace @beabee/vue run build` — must pass
3. `yarn check` — type check + lint must pass
4. `yarn build` — full monorepo build must pass
5. Visual check: run `apps/frontend` dev server, visit `/_theme` page to verify all button variants render correctly
6. Check `SetMFA.vue` focus behaviour on final slider step
7. Check `AppImageUpload.vue` label button still triggers file input
8. Check `AppButtonGroup` connected-button visual still works
