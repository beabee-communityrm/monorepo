// Adapted from https://github.com/Trott/slug/blob/main/test/slug.test.js

import { slug } from "@beabee/beabee-common";

describe("slug", () => {
  test("should replace whitespaces with replacement", () => {
    expect(slug("foo bar baz")).toBe("foo-bar-baz");
    expect(slug("foo bar baz", { replacement: "_" })).toBe("foo_bar_baz");
    expect(slug("foo bar baz", { replacement: "" })).toBe("foobarbaz");
  });

  test("should replace multiple spaces and dashes with a single instance", () => {
    expect(slug("foo  bar--baz")).toBe("foo-bar-baz");
  });

  test("should remove trailing space if any", () => {
    expect(slug(" foo bar baz ")).toBe("foo-bar-baz");
  });

  test("should preserve leading/trailing replacement characters if option set", () => {
    expect(slug(" foo bar baz ", { trim: false })).toBe("-foo-bar-baz-");
  });

  test("should remove punctuation by default", () => {
    const punctuation = [
      "*",
      "_",
      "+",
      "~",
      ".",
      ",",
      "[",
      "]",
      "(",
      ")",
      "'",
      '"',
      "!",
      ":",
      "@"
    ];
    punctuation.forEach((symbol) => {
      expect(slug("foo " + symbol + " bar baz")).toBe("foo-bar-baz");
    });
    expect(slug("foo_bar. -baz!")).toBe("foobar-baz");
    expect(slug("foo_bar-baz_bing!", { replacement: "_" })).toBe(
      "foo_barbaz_bing"
    );
  });

  test("should consolidate hyphen and space chars", () => {
    expect(slug("foo- bar baz")).toBe("foo-bar-baz");
  });

  test("should leave allowed chars in rfc3986 mode", () => {
    const allowed = [".", "_", "~"];
    allowed.forEach((a) => {
      expect(slug("foo " + a + " bar baz", { mode: "rfc3986" })).toBe(
        "foo-" + a + "-bar-baz"
      );
    });
  });

  test("should replace latin chars", () => {
    const charMap = {
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
      ẞ: "SS"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });

  test("should replace greek chars", () => {
    const charMap = {
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
      Ϋ: "Y"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });

  test("should replace turkish chars", () => {
    const charMap = {
      ş: "s",
      Ş: "S",
      ı: "i",
      İ: "I",
      ç: "c",
      Ç: "C",
      ü: "u",
      Ü: "U",
      ö: "o",
      Ö: "O",
      ğ: "g",
      Ğ: "G"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });

  test("should replace cyrillic chars", () => {
    const charMap = {
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
      Є: "Ye",
      І: "I",
      Ї: "Yi",
      Ґ: "G",
      є: "ye",
      і: "i",
      ї: "yi",
      ґ: "g"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      let expected = "foo-" + replacement.toLowerCase() + "-bar-baz";
      if (!replacement) {
        expected = "foo-bar-baz";
      }
      expect(slug("foo " + char + " bar baz")).toBe(expected);
    }
  });

  test("should replace czech chars", () => {
    const charMap = {
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
      Ž: "Z"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });

  test("should replace slovak chars", () => {
    const charMap = {
      á: "a",
      ä: "a",
      č: "c",
      ď: "d",
      é: "e",
      í: "i",
      ľ: "l",
      ĺ: "l",
      ň: "n",
      ó: "o",
      ô: "o",
      ŕ: "r",
      š: "s",
      ť: "t",
      ú: "u",
      ý: "y",
      ž: "z",
      Á: "a",
      Ä: "A",
      Č: "C",
      Ď: "D",
      É: "E",
      Í: "I",
      Ľ: "L",
      Ĺ: "L",
      Ň: "N",
      Ó: "O",
      Ô: "O",
      Ŕ: "R",
      Š: "S",
      Ť: "T",
      Ú: "U",
      Ý: "Y",
      Ž: "Z"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });

  test("should replace polish chars", () => {
    const charMap = {
      ą: "a",
      ć: "c",
      ę: "e",
      ł: "l",
      ń: "n",
      ó: "o",
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
      Ż: "Z"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });

  test("should replace latvian chars", () => {
    const charMap = {
      ā: "a",
      č: "c",
      ē: "e",
      ģ: "g",
      ī: "i",
      ķ: "k",
      ļ: "l",
      ņ: "n",
      š: "s",
      ū: "u",
      ž: "z",
      Ā: "A",
      Č: "C",
      Ē: "E",
      Ģ: "G",
      Ī: "I",
      Ķ: "K",
      Ļ: "L",
      Ņ: "N",
      Š: "S",
      Ū: "U",
      Ž: "Z"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });

  test("should replace vietnamese chars", () => {
    const charMap = {
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
      đ: "d"
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      expect(slug("foo " + char + " bar baz")).toBe(
        "foo-" + replacement.toLowerCase() + "-bar-baz"
      );
    }
  });
});
