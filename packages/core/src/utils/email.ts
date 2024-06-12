import juice from "juice";

import OptionsService from "#core/services/OptionsService";

import { LocaleObject } from "@beabee/locales";

/**
 * @param locale The locale object to use, should be `currentLocale()` in the most cases.
 * @returns The email footer.
 */
export function getEmailFooter(locale: LocaleObject): string {
  return `
<p><br></p>
<hr>
<p><br></p>
<p><img src="${OptionsService.getText(
    "logo"
  )}" style="display:inline-block; vertical-align: middle" width="50" height="50"><span style="margin-left: 10px">${OptionsService.getText(
    "organisation"
  )}</span></p>
<p><br></p>
<p style="color: #666;">${
    locale.footer.contactUs
  } <a href="mailto:${OptionsService.getText(
    "support-email"
  )}">${OptionsService.getText("support-email")}</a>.</p>
<p style="color: #666;">${[
    [
      locale.footer.privacyPolicy,
      OptionsService.getText("footer-privacy-link-url")
    ],
    [locale.footer.terms, OptionsService.getText("footer-terms-link-url")],
    ["Impressum", OptionsService.getText("footer-impressum-link-url")]
  ]
    .filter(([text, url]) => !!url)
    .map(([text, url]) => `<a href="${url}">${text}</a>`)
    .join(", ")}</p>
`;
}

/**
 * @param body The body of the email.
 * @param locale The locale object to use, should be `currentLocale()` in the most cases.
 * @returns The formatted email body.
 */
export function formatEmailBody(body: string, locale: LocaleObject): string {
  const styles = `
<style>p,ul,ol,h1,h2,h3,h4,h5,h6,pre,blockquote,hr { margin: 0; }</style>
  `;
  // Make empty paragraph tags visible
  body = body.replace(/<p><\/p>/g, "<p><br></p>");
  return juice(styles + body + getEmailFooter(locale));
}

export function cleanEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}
