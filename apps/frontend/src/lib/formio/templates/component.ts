/**
 * Replacement for form.io's `component/form` template.
 *
 * The only change from the stock template is `aria-live` on the message
 * container. The container is rendered empty up front and filled when a field
 * becomes invalid, which is what a live region needs, so marking it makes
 * validation errors announce themselves as they appear rather than staying
 * silent until the user happens to return to the field.
 *
 * Polite rather than assertive: form.io validates on change, so an assertive
 * region would interrupt whatever is being spoken each time a message
 * appeared or changed while someone was still typing.
 */
import type { ComponentTemplateContext } from '#type';

export default function componentForm(ctx: ComponentTemplateContext): string {
  const styles = ctx.styles ? ` styles="${ctx.styles}"` : '';

  const body = ctx.visible
    ? `
  ${ctx.children}
  <div ref="messageContainer" class="formio-errors invalid-feedback" aria-live="polite"></div>
  `
    : '';

  return `<div id="${ctx.id}" class="${ctx.classes}"${styles} ref="component">
  ${body}
</div>`;
}
