/**
 * Script to load locale data from a Google sheet
 *
 * Run: beabee-cli i18n [sheet-name]
 *
 * Column headers should be locale codes, codes that start with an exclamation mark (!) are ignored.
 *
 * The script can optional load a second sheet to overwrite the main sheet, we add a new sheet for a
 * branch so changes for different features are kept separate.
 */
import { join } from "https://deno.land/std@0.212.0/path/mod.ts"
import { google } from 'npm:googleapis@131.0.0';
// @deno-types="npm:@types/markdown-it@14.1.1"
import { default as MarkdownIt } from 'npm:markdown-it@14.1.0';
import { I18nArguments } from "../types.ts";

import type { Options as MarkdownItOptions } from "npm:@types/markdown-it@14.1.1"

interface LocaleData {
  [key: string]: string | LocaleData;
}

const cwd = Deno.cwd();
const simpleMd = new MarkdownIt('zero').enable(['emphasis', 'link']);

simpleMd.renderer.rules.link_open = function (tokens, idx, options: MarkdownItOptions, _env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');
  if (hrefIndex >= 0) {
    const href = token.attrs?.[hrefIndex]?.[1];
    if (href?.startsWith('http')) {
      token.attrPush(['target', '_blank']);
      token.attrPush(['rel', 'noopener noreferrer']);
    }
  }
  return self.renderToken(tokens, idx, options);
};

const optHandlers = {
  md: (data: string) => simpleMd.render(data),
};

const localeData: LocaleData = {};
const localeConfig: LocaleData = {};

function processKeyData(keyOpts: string[], keyData: string) {
  if (keyData) {
    return (
      keyOpts
        // Apply handlers
        .reduce((data: string, opt: string) => optHandlers[opt as keyof typeof optHandlers](data), keyData || '')
        // Santize special i18n character
        .replace(/@/g, "{'@'}")
    );
  }
}

async function loadSheet(name: string, authJsonFile: string) {
  console.log('Loading sheet ' + name);

  const auth = new google.auth.GoogleAuth({
    keyFile: join(cwd, authJsonFile),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: '1l35DW5OMi-xM8HXek5Q1jOxsXScINqqpEvPWDlpBPX8',
    range: name,
  });

  const headers = resp.data.values?.[0];

  if (!headers) {
    return;
  }

  const rows = resp.data.values
    ?.slice(1)
    .map((row: string[]) =>
      Object.fromEntries(headers.map((header: string, i: number) => [header, row[i]]))
    )
    .filter((row: Record<string, string>) => row.key);

  if (!rows) {
    return;
  }

  // Add locales to data
  const locales = headers.filter((h: string) => h !== 'key' && !h.startsWith('!'));
  for (const locale of locales) {
    if (!localeData[locale]) {
      localeData[locale] = {};
      localeConfig[locale] = {};
    }
  }

  // Construct nested objects from a.b.c key paths
  for (const row of rows) {
    let isConfig = false;
    if (row.key.startsWith('_')) {
      row.key = row.key.slice(1);
      isConfig = true;
    }

    const keyParts = row.key.split('.');
    const [lastKeyPart, ...keyOpts] = keyParts.pop()!.split(':');

    for (const locale of locales) {
      let localeDataPart: any = isConfig ? localeConfig[locale] : localeData[locale];

      for (const part of keyParts) {
        if (!localeDataPart[part]) {
          localeDataPart[part] = {};
        }
        localeDataPart = localeDataPart[part];
      }

      if (localeDataPart[lastKeyPart] !== undefined) {
        console.log('Duplicate key ' + row.key);
      }

      localeDataPart[lastKeyPart] = isConfig
        ? row[locale]
        : processKeyData(keyOpts, row[locale]);
    }
  }
}

// Recursively sort for predictable output
function sortObject(obj: LocaleData) {
  const ret: LocaleData = {};
  for (const key of Object.keys(obj).sort()) {
    const value = obj[key];
    ret[key] = typeof value === 'object' ? sortObject(value) : value;
  }
  return ret;
}

/**
 * Convert object to a json, js or ts string
 * @param obj The object to convert
 * @param name The name of the object
 * @param format The format to convert to
 * @returns The string
 */
const objectToFormat = (obj: object, name: string, format: "json" | "js" | "ts") => {
  let content = '';
  if (format === "js" || format === "ts") {
    content = `export const ${name} = `;
  }
  content += JSON.stringify(obj, null, 2);
  if (format === "js" || format === "ts") {
    content += ';';
  }
  content += '\n';
  return content;
}

const localeToVariable = (input: string): string => {
  const parts = input.split('@');

  if (parts.length !== 2) {
    return input;
  }

  const base = parts[0];
  const modifier = parts[1];

  const capitalizedModifier = modifier.charAt(0).toUpperCase() + modifier.slice(1);

  return base + capitalizedModifier;
}

export const i18nAction = async (argv: I18nArguments) => {
  await loadSheet('Sheet1', argv.authJsonFile);

  if (argv.sheetName) {
    try {
      await loadSheet(argv.sheetName, argv.authJsonFile);
    } catch {
      console.error(`Failed to load sheet ${argv.sheetName}`);
    }
  }

  await Deno.mkdir(join(cwd, argv.outputDir), { recursive: true });

  for (const locale in localeData) {
    console.log('Updating ' + locale);
    const fileName = join(cwd, argv.outputDir, locale + "." + argv.format);
    const content = objectToFormat(sortObject(localeData[locale] as LocaleData), localeToVariable(locale), argv.format);

    await Deno.writeTextFile(
      fileName,
      content
    );
  }

  // '../src/lib/i18n-config.json'
  const configFileName = join(cwd, argv.outputDir, 'config.' + argv.format);
  const content = objectToFormat(sortObject(localeConfig), 'config', argv.format);
  await Deno.writeTextFile(
    configFileName,
    content
  );
}
