/**
 * Replacement for form.io's `input/form` template.
 *
 * The stock template puts the description's id into `aria-labelledby` next to
 * the label's, and sets no `aria-describedby` at all. That makes the
 * description part of the field's accessible name, so it is announced in full
 * every time the field is reached, and it leaves the error message with no
 * association to the field it belongs to.
 *
 * Here `aria-labelledby` names the label alone, and the description and error
 * ids go to `aria-describedby`. The error element only exists once form.io has
 * a message to show; a reference to a missing id is ignored, so the reference
 * can be set unconditionally and starts working when the message appears.
 */
import type { InputTemplateContext } from '#type';

/** Render prefix or suffix content, which may be a string or an element. */
function addon(
  value: string | HTMLElement,
  t: InputTemplateContext['t']
): string {
  return t(typeof value === 'string' ? value : value.outerHTML, {
    _userInput: true,
  });
}

/** Whether the input form.io is rendering is a required one. */
function isRequired(ctx: InputTemplateContext): boolean {
  const { ref } = ctx.input;
  if (!ref || ref === 'input') {
    return !!ctx.component.validate?.required;
  }
  return !!ctx.component.fields?.[ref]?.required;
}

export default function inputForm(ctx: InputTemplateContext): string {
  const { id } = ctx.instance;
  const { key, description, editor, wysiwyg, type } = ctx.component;
  const hasGroup = !!(ctx.prefix || ctx.suffix);

  const describedBy = [description && `d-${id}-${key}`, `e-${id}-${key}`]
    .filter(Boolean)
    .join(' ');

  const attrs = Object.entries(ctx.input.attr || {})
    .map(([name, value]) => `${name}="${value}"`)
    .join('\n      ');

  let html = '';

  if (hasGroup) {
    html += '<div class="input-group">';
  }

  if (ctx.prefix) {
    html += `
    <div class="input-group-prepend" ref="prefix">
      <span class="input-group-text">${addon(ctx.prefix, ctx.t)}</span>
    </div>`;
  }

  if (!editor && !wysiwyg) {
    html += `
    <${ctx.input.type}
      ref="${ctx.input.ref || 'input'}"
      ${attrs}
      id="${id}-${key}"
      aria-labelledby="l-${id}-${key}"
      aria-describedby="${describedBy}"
      aria-required="${isRequired(ctx)}"
    >${ctx.input.content || ''}</${ctx.input.type}>`;

    if (ctx.hasValueMaskInput) {
      html += '\n    <input ref="valueMaskInput" />';
    }
  } else {
    html += '\n  <div ref="input"></div>';
  }

  if (type === 'datetime') {
    html += `\n<span aria-live="assertive" id="${id}-liveRegion" class="sr-only" ref="liveRegion"></span>`;
  }

  if (ctx.suffix) {
    html += `
  <div class="input-group-append" ref="suffix">
    <span class="input-group-text">${addon(ctx.suffix, ctx.t)}</span>
  </div>`;
  }

  if (hasGroup) {
    html += '\n  </div>';
  }

  if (ctx.component.showCharCount || ctx.component.showWordCount) {
    html += `\n<div class="form-text ${description ? 'pull-right' : 'text-right'}">`;
    if (ctx.component.showCharCount) {
      html +=
        '\n  <span class="text-muted" ref="charcount" aria-live="polite"></span>';
    }
    if (ctx.component.showWordCount) {
      html +=
        '\n  <span class="text-muted" ref="wordcount" aria-live="polite"></span>';
    }
    html += '\n</div>';
  }

  return html;
}
