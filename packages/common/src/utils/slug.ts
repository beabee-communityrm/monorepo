// Adapted from https://github.com/Trott/slug/issues/new

// Technically should be Record<string, string | undefined> but makes
// the code a bit simpler as TypeScript doesn't narrow if (charmap[char])
type CharMap = Record<string, string>;

interface Mode {
  charmap: CharMap;
  lower: boolean;
  multicharmap: CharMap;
  remove: RegExp | null;
  replacement: string;
  trim: boolean;
}

interface Options {
  locale: string;
  mode: "pretty" | "rfc3986";
  fallback: boolean;
}

// This function's sole purpose is to help us ignore lone surrogates so that
// malformed strings don't throw in the browser while being processed
// permissively in Node.js. If we didn't care about parity, we could get rid
// of it.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt
function getWholeCharAndI(str: string, i: number): [string, number] {
  const code = str.charCodeAt(i);

  // This is a coherence check. `code` should never be `NaN`.
  /* istanbul ignore if */
  if (isNaN(code)) {
    throw new RangeError(
      "Index " +
        i +
        ' out of range for string "' +
        str +
        '"; please open an issue at https://github.com/Trott/slug/issues/new',
    );
  }
  if (code < 0xd800 || code > 0xdfff) {
    return [str.charAt(i), i]; // Non-surrogate character, keeping 'i' the same
  }

  // High surrogate
  if (code >= 0xd800 && code <= 0xdbff) {
    if (str.length <= i + 1) {
      // High surrogate without following low surrogate
      return [" ", i];
    }
    const next = str.charCodeAt(i + 1);
    if (next < 0xdc00 || next > 0xdfff) {
      // High surrogate without following low surrogate
      return [" ", i];
    }
    return [str.charAt(i) + str.charAt(i + 1), i + 1];
  }

  // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
  if (i === 0) {
    // Low surrogate without preceding high surrogate
    return [" ", i];
  }

  const prev = str.charCodeAt(i - 1);

  /* istanbul ignore else */
  if (prev < 0xd800 || prev > 0xdbff) {
    // Low surrogate without preceding high surrogate
    return [" ", i];
  }

  /* istanbul ignore next */
  throw new Error(
    'String "' +
      str +
      '" reaches code believed to be unreachable; please open an issue at https://github.com/Trott/slug/issues/new',
  );
}

function base64(input: string) {
  return btoa(unescape(encodeURIComponent(input)));
}

export function slug(s: string, opts?: Partial<Options & Mode>) {
  let result = slugify(s, opts);
  const fallback = opts && opts.fallback !== undefined
    ? opts.fallback
    : defaults.fallback;
  // If output is an empty string, try slug for base64 of string.
  if (fallback === true && result === "") {
    // Get rid of lone surrogates.
    let input = "";
    for (let i = 0; i < s.length; i++) {
      const charAndI = getWholeCharAndI(s, i);
      i = charAndI[1];
      input += charAndI[0];
    }
    result = slugify(base64(input), opts);
  }
  return result;
}

const locales: Record<string, CharMap | undefined> = {
  // http://www.eki.ee/wgrs/rom1_bg.pdf
  bg: {
    Й: "Y",
    й: "y",
    X: "H",
    x: "h",
    Ц: "Ts",
    ц: "ts",
    Щ: "Sht",
    щ: "sht",
    Ъ: "A",
    ъ: "a",
    Ь: "Y",
    ь: "y",
  },
  // Need a reference URL for German, although this is pretty well-known.
  de: { Ä: "AE", ä: "ae", Ö: "OE", ö: "oe", Ü: "UE", ü: "ue" },
  // Need a reference URL for Serbian.
  sr: { đ: "dj", Đ: "DJ" },
  // https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/864314/ROMANIZATION_OF_UKRAINIAN.pdf
  uk: {
    И: "Y",
    и: "y",
    Й: "Y",
    й: "y",
    Ц: "Ts",
    ц: "ts",
    Х: "Kh",
    х: "kh",
    Щ: "Shch",
    щ: "shch",
    Г: "H",
    г: "h",
  },
};

function slugify(str: string, partialOpts?: Partial<Options & Mode>) {
  const mode = partialOpts?.mode || defaults.mode;
  const opts = { ...defaults.modes[mode], ...partialOpts };
  const localeMap = (!!opts.locale && locales[opts.locale]) || {};

  let lengths = [];
  for (const key in opts.multicharmap) {
    if (!Object.prototype.hasOwnProperty.call(opts.multicharmap, key)) {
      continue;
    }

    const len = key.length;
    if (lengths.indexOf(len) === -1) {
      lengths.push(len);
    }
  }

  // We want to match the longest string if there are multiple matches, so
  // sort lengths in descending order.
  lengths = lengths.sort(function (a, b) {
    return b - a;
  });

  const disallowedChars = opts.mode === "rfc3986"
    ? /[^\w\s\-.~]/
    : /[^A-Za-z0-9\s]/;

  let result = "";
  for (let char, i = 0, l = str.length; i < l; i++) {
    char = str[i];
    let matchedMultichar = false;
    for (let j = 0; j < lengths.length; j++) {
      const len = lengths[j];
      const substr = str.substr(i, len);
      if (opts.multicharmap[substr]) {
        i += len - 1;
        char = opts.multicharmap[substr];
        matchedMultichar = true;
        break;
      }
    }
    if (!matchedMultichar) {
      if (localeMap[char]) {
        char = localeMap[char];
      } else if (opts.charmap[char]) {
        char = opts.charmap[char].replace(opts.replacement, " ");
      } else if (char.includes(opts.replacement)) {
        // preserve the replacement character in case it is excluded by disallowedChars
        char = char.replace(opts.replacement, " ");
      } else {
        char = char.replace(disallowedChars, "");
      }
    }
    result += char;
  }

  if (opts.remove) {
    result = result.replace(opts.remove, "");
  }
  if (opts.trim) {
    result = result.trim();
  }
  result = result.replace(/\s+/g, opts.replacement); // convert spaces
  if (opts.lower) {
    result = result.toLowerCase();
  }
  return result;
}

const initialMulticharmap: CharMap = {
  // multibyte devanagari characters (hindi, sanskrit, etc.)
  फ़: "Fi",
  ग़: "Ghi",
  ख़: "Khi",
  क़: "Qi",
  ड़: "ugDha",
  ढ़: "ugDhha",
  य़: "Yi",
  ज़: "Za",
  // hebrew
  // Refs: http://www.eki.ee/wgrs/rom1_he.pdf
  // Refs: https://en.wikipedia.org/wiki/Niqqud
  בִי: "i",
  בֵ: "e",
  בֵי: "e",
  בֶ: "e",
  בַ: "a",
  בָ: "a",
  בֹ: "o",
  וֹ: "o",
  בֻ: "u",
  וּ: "u",
  בּ: "b",
  כּ: "k",
  ךּ: "k",
  פּ: "p",
  שׁ: "sh",
  שׂ: "s",
  בְ: "e",
  חֱ: "e",
  חֲ: "a",
  חֳ: "o",
  בִ: "i",
};

// https://github.com/django/django/blob/master/django/contrib/admin/static/admin/js/urlify.js
const initialCharmap: CharMap = {
  // latin
  À: "A",
  Á: "A",
  Â: "A",
  Ã: "A",
  Ä: "A",
  Å: "A",
  Æ: "AE",
  Ç: "C",
  È: "E",
  É: "E",
  Ê: "E",
  Ë: "E",
  Ì: "I",
  Í: "I",
  Î: "I",
  Ï: "I",
  Ð: "D",
  Ñ: "N",
  Ò: "O",
  Ó: "O",
  Ô: "O",
  Õ: "O",
  Ö: "O",
  Ő: "O",
  Ø: "O",
  Ō: "O",
  Ù: "U",
  Ú: "U",
  Û: "U",
  Ü: "U",
  Ű: "U",
  Ý: "Y",
  Þ: "TH",
  ß: "ss",
  à: "a",
  á: "a",
  â: "a",
  ã: "a",
  ä: "a",
  å: "a",
  æ: "ae",
  ç: "c",
  è: "e",
  é: "e",
  ê: "e",
  ë: "e",
  ì: "i",
  í: "i",
  î: "i",
  ï: "i",
  ð: "d",
  ñ: "n",
  ò: "o",
  ó: "o",
  ô: "o",
  õ: "o",
  ö: "o",
  ő: "o",
  ø: "o",
  ō: "o",
  Œ: "OE",
  œ: "oe",
  ù: "u",
  ú: "u",
  û: "u",
  ü: "u",
  ű: "u",
  ý: "y",
  þ: "th",
  ÿ: "y",
  ẞ: "SS",
  // greek
  α: "a",
  β: "b",
  γ: "g",
  δ: "d",
  ε: "e",
  ζ: "z",
  η: "h",
  θ: "th",
  ι: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "3",
  ο: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  τ: "t",
  υ: "y",
  φ: "f",
  χ: "x",
  ψ: "ps",
  ω: "w",
  ά: "a",
  έ: "e",
  ί: "i",
  ό: "o",
  ύ: "y",
  ή: "h",
  ώ: "w",
  ς: "s",
  ϊ: "i",
  ΰ: "y",
  ϋ: "y",
  ΐ: "i",
  Α: "A",
  Β: "B",
  Γ: "G",
  Δ: "D",
  Ε: "E",
  Ζ: "Z",
  Η: "H",
  Θ: "Th",
  Ι: "I",
  Κ: "K",
  Λ: "L",
  Μ: "M",
  Ν: "N",
  Ξ: "3",
  Ο: "O",
  Π: "P",
  Ρ: "R",
  Σ: "S",
  Τ: "T",
  Υ: "Y",
  Φ: "F",
  Χ: "X",
  Ψ: "PS",
  Ω: "W",
  Ά: "A",
  Έ: "E",
  Ί: "I",
  Ό: "O",
  Ύ: "Y",
  Ή: "H",
  Ώ: "W",
  Ϊ: "I",
  Ϋ: "Y",
  // turkish
  ş: "s",
  Ş: "S",
  ı: "i",
  İ: "I",
  ğ: "g",
  Ğ: "G",
  // russian
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "u",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Е: "E",
  Ё: "Yo",
  Ж: "Zh",
  З: "Z",
  И: "I",
  Й: "J",
  К: "K",
  Л: "L",
  М: "M",
  Н: "N",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  У: "U",
  Ф: "F",
  Х: "H",
  Ц: "C",
  Ч: "Ch",
  Ш: "Sh",
  Щ: "Sh",
  Ъ: "U",
  Ы: "Y",
  Ь: "",
  Э: "E",
  Ю: "Yu",
  Я: "Ya",
  // ukranian
  Є: "Ye",
  І: "I",
  Ї: "Yi",
  Ґ: "G",
  є: "ye",
  і: "i",
  ї: "yi",
  ґ: "g",
  // czech
  č: "c",
  ď: "d",
  ě: "e",
  ň: "n",
  ř: "r",
  š: "s",
  ť: "t",
  ů: "u",
  ž: "z",
  Č: "C",
  Ď: "D",
  Ě: "E",
  Ň: "N",
  Ř: "R",
  Š: "S",
  Ť: "T",
  Ů: "U",
  Ž: "Z",
  // slovak
  ľ: "l",
  ĺ: "l",
  ŕ: "r",
  Ľ: "L",
  Ĺ: "L",
  Ŕ: "R",
  // polish
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ś: "s",
  ź: "z",
  ż: "z",
  Ą: "A",
  Ć: "C",
  Ę: "E",
  Ł: "L",
  Ń: "N",
  Ś: "S",
  Ź: "Z",
  Ż: "Z",
  // latvian
  ā: "a",
  ē: "e",
  ģ: "g",
  ī: "i",
  ķ: "k",
  ļ: "l",
  ņ: "n",
  ū: "u",
  Ā: "A",
  Ē: "E",
  Ģ: "G",
  Ī: "I",
  Ķ: "K",
  Ļ: "L",
  Ņ: "N",
  Ū: "U",
  // arabic
  أ: "a",
  إ: "i",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "g",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "th",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "th",
  ع: "aa",
  غ: "gh",
  ف: "f",
  ق: "k",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "o",
  ي: "y",
  ء: "aa",
  ة: "a",
  // farsi
  آ: "a",
  ا: "a",
  پ: "p",
  ژ: "zh",
  گ: "g",
  چ: "ch",
  ک: "k",
  ی: "i",
  // lithuanian
  ė: "e",
  į: "i",
  ų: "u",
  Ė: "E",
  Į: "I",
  Ų: "U",
  // romanian
  ț: "t",
  Ț: "T",
  ţ: "t",
  Ţ: "T",
  ș: "s",
  Ș: "S",
  ă: "a",
  Ă: "A",
  // vietnamese
  Ạ: "A",
  Ả: "A",
  Ầ: "A",
  Ấ: "A",
  Ậ: "A",
  Ẩ: "A",
  Ẫ: "A",
  Ằ: "A",
  Ắ: "A",
  Ặ: "A",
  Ẳ: "A",
  Ẵ: "A",
  Ẹ: "E",
  Ẻ: "E",
  Ẽ: "E",
  Ề: "E",
  Ế: "E",
  Ệ: "E",
  Ể: "E",
  Ễ: "E",
  Ị: "I",
  Ỉ: "I",
  Ĩ: "I",
  Ọ: "O",
  Ỏ: "O",
  Ồ: "O",
  Ố: "O",
  Ộ: "O",
  Ổ: "O",
  Ỗ: "O",
  Ơ: "O",
  Ờ: "O",
  Ớ: "O",
  Ợ: "O",
  Ở: "O",
  Ỡ: "O",
  Ụ: "U",
  Ủ: "U",
  Ũ: "U",
  Ư: "U",
  Ừ: "U",
  Ứ: "U",
  Ự: "U",
  Ử: "U",
  Ữ: "U",
  Ỳ: "Y",
  Ỵ: "Y",
  Ỷ: "Y",
  Ỹ: "Y",
  Đ: "D",
  ạ: "a",
  ả: "a",
  ầ: "a",
  ấ: "a",
  ậ: "a",
  ẩ: "a",
  ẫ: "a",
  ằ: "a",
  ắ: "a",
  ặ: "a",
  ẳ: "a",
  ẵ: "a",
  ẹ: "e",
  ẻ: "e",
  ẽ: "e",
  ề: "e",
  ế: "e",
  ệ: "e",
  ể: "e",
  ễ: "e",
  ị: "i",
  ỉ: "i",
  ĩ: "i",
  ọ: "o",
  ỏ: "o",
  ồ: "o",
  ố: "o",
  ộ: "o",
  ổ: "o",
  ỗ: "o",
  ơ: "o",
  ờ: "o",
  ớ: "o",
  ợ: "o",
  ở: "o",
  ỡ: "o",
  ụ: "u",
  ủ: "u",
  ũ: "u",
  ư: "u",
  ừ: "u",
  ứ: "u",
  ự: "u",
  ử: "u",
  ữ: "u",
  ỳ: "y",
  ỵ: "y",
  ỷ: "y",
  ỹ: "y",
  đ: "d",
  // kazakh
  Ә: "AE",
  ә: "ae",
  Ғ: "GH",
  ғ: "gh",
  Қ: "KH",
  қ: "kh",
  Ң: "NG",
  ң: "ng",
  Ү: "UE",
  ү: "ue",
  Ұ: "U",
  ұ: "u",
  Һ: "H",
  һ: "h",
  Ө: "OE",
  ө: "oe",
  // serbian
  ђ: "dj",
  ј: "j",
  љ: "lj",
  њ: "nj",
  ћ: "c",
  џ: "dz",
  Ђ: "Dj",
  Ј: "j",
  Љ: "Lj",
  Њ: "Nj",
  Ћ: "C",
  Џ: "Dz",
  ǌ: "nj",
  ǉ: "lj",
  ǋ: "NJ",
  ǈ: "LJ",
  // hindi
  अ: "a",
  आ: "aa",
  ए: "e",
  ई: "ii",
  ऍ: "ei",
  ऎ: "ae",
  ऐ: "ai",
  इ: "i",
  ओ: "o",
  ऑ: "oi",
  ऒ: "oii",
  ऊ: "uu",
  औ: "ou",
  उ: "u",
  ब: "B",
  भ: "Bha",
  च: "Ca",
  छ: "Chha",
  ड: "Da",
  ढ: "Dha",
  फ: "Fa",
  ग: "Ga",
  घ: "Gha",
  ग़: "Ghi",
  ह: "Ha",
  ज: "Ja",
  झ: "Jha",
  क: "Ka",
  ख: "Kha",
  ख़: "Khi",
  ल: "L",
  ळ: "Li",
  ऌ: "Li",
  ऴ: "Lii",
  ॡ: "Lii",
  म: "Ma",
  न: "Na",
  ङ: "Na",
  ञ: "Nia",
  ण: "Nae",
  ऩ: "Ni",
  ॐ: "oms",
  प: "Pa",
  क़: "Qi",
  र: "Ra",
  ऋ: "Ri",
  ॠ: "Ri",
  ऱ: "Ri",
  स: "Sa",
  श: "Sha",
  ष: "Shha",
  ट: "Ta",
  त: "Ta",
  ठ: "Tha",
  द: "Tha",
  थ: "Tha",
  ध: "Thha",
  ड़: "ugDha",
  ढ़: "ugDhha",
  व: "Va",
  य: "Ya",
  य़: "Yi",
  ज़: "Za",
  // azerbaijani
  ə: "e",
  Ə: "E",
  // georgian
  ა: "a",
  ბ: "b",
  გ: "g",
  დ: "d",
  ე: "e",
  ვ: "v",
  ზ: "z",
  თ: "t",
  ი: "i",
  კ: "k",
  ლ: "l",
  მ: "m",
  ნ: "n",
  ო: "o",
  პ: "p",
  ჟ: "zh",
  რ: "r",
  ს: "s",
  ტ: "t",
  უ: "u",
  ფ: "p",
  ქ: "k",
  ღ: "gh",
  ყ: "q",
  შ: "sh",
  ჩ: "ch",
  ც: "ts",
  ძ: "dz",
  წ: "ts",
  ჭ: "ch",
  ხ: "kh",
  ჯ: "j",
  ჰ: "h",
  // hebrew
  ב: "v",
  גּ: "g",
  ג: "g",
  ד: "d",
  דּ: "d",
  ה: "h",
  ו: "v",
  ז: "z",
  ח: "h",
  ט: "t",
  י: "y",
  כ: "kh",
  ך: "kh",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  פ: "f",
  ף: "f",
  ץ: "ts",
  צ: "ts",
  ק: "k",
  ר: "r",
  תּ: "t",
  ת: "t",
};

const defaults: Options & { modes: Record<string, Mode> } = {
  locale: "",
  mode: "pretty" as const,
  fallback: true,
  modes: {
    rfc3986: {
      replacement: "-",
      lower: true,
      charmap: initialCharmap,
      multicharmap: initialMulticharmap,
      remove: null,
      trim: true,
    },
    pretty: {
      replacement: "-",
      lower: true,
      charmap: initialCharmap,
      multicharmap: initialMulticharmap,
      remove: null,
      trim: true,
    },
  },
};
