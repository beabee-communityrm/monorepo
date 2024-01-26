// Adapted from https://github.com/Trott/slug/issues/new

import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";
import { slug } from "../../src/utils/slug.ts";

type CharMap = Record<string, string>;

Deno.test("slug", async (t) => {
  await t.step("should replace whitespaces with replacement", function () {
    assertEquals(slug("foo bar baz"), "foo-bar-baz");
    assertEquals(slug("foo bar baz", { replacement: "_" }), "foo_bar_baz");
    assertEquals(slug("foo bar baz", { replacement: "" }), "foobarbaz");
  });

  await t.step(
    "should replace multiple spaces and dashes with a single instance",
    function () {
      assertEquals(slug("foo  bar--baz"), "foo-bar-baz");
    }
  );

  await t.step("should remove trailing space if any", function () {
    assertEquals(slug(" foo bar baz "), "foo-bar-baz");
  });

  await t.step(
    "should preserve leading/trailing replacement characters if option set",
    function () {
      assertEquals(slug(" foo bar baz ", { trim: false }), "-foo-bar-baz-");
    }
  );

  await t.step("should remove punctuation by default", function () {
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
      "@",
    ];
    punctuation.forEach(function (symbol) {
      assertEquals(slug("foo " + symbol + " bar baz"), "foo-bar-baz");
    });
    assertEquals(slug("foo_bar. -baz!"), "foobar-baz");
    assertEquals(
      slug("foo_bar-baz_bing!", { replacement: "_" }),
      "foo_barbaz_bing"
    );
  });

  await t.step("should consolidate hyphen and space chars", function () {
    assertEquals(slug("foo- bar baz"), "foo-bar-baz");
  });

  await t.step("should leave allowed chars in rfc3986 mode", function () {
    const allowed = [".", "_", "~"];
    allowed.forEach(function (a) {
      assertEquals(
        slug("foo " + a + " bar baz", { mode: "rfc3986" }),
        "foo-" + a + "-bar-baz"
      );
    });
  });

  await t.step("should replace latin chars", function () {
    const charMap: CharMap = {
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
      ẞ: "SS",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace greek chars", function () {
    const charMap: CharMap = {
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace turkish chars", function () {
    const charMap: CharMap = {
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
      Ğ: "G",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace cyrillic chars", function () {
    const charMap: CharMap = {
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
      ґ: "g",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      let expected = "foo-" + replacement.toLowerCase() + "-bar-baz";
      if (!replacement) {
        expected = "foo-bar-baz";
      }
      assertEquals(
        slug("foo " + char + " bar baz"),
        expected,
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace czech chars", function () {
    const charMap: CharMap = {
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace slovak chars", function () {
    const charMap: CharMap = {
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
      Ž: "Z",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace polish chars", function () {
    const charMap: CharMap = {
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
      Ż: "Z",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace latvian chars", function () {
    const charMap: CharMap = {
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
      Ž: "Z",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace vietnamese chars", function () {
    const charMap: CharMap = {
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace kazakh chars", function () {
    const charMap: CharMap = {
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace hindi chars", function () {
    const charMap: CharMap = {
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
      फ़: "Fi",
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace azerbaijani chars", function () {
    const charMap: CharMap = {
      ç: "c",
      ə: "e",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ə: "E",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace georgian chars", function () {
    const charMap: CharMap = {
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step(
    "should replace bulgarian chars if locale provided",
    function () {
      const charMap: CharMap = {
        A: "A",
        а: "a",
        Б: "B",
        б: "b",
        В: "V",
        в: "v",
        Г: "G",
        г: "g",
        Д: "D",
        д: "d",
        Е: "E",
        е: "e",
        Ж: "Zh",
        ж: "zh",
        З: "Z",
        з: "z",
        И: "I",
        и: "i",
        Й: "Y",
        й: "y",
        К: "K",
        к: "k",
        Л: "L",
        л: "l",
        М: "M",
        м: "m",
        Н: "N",
        н: "n",
        О: "O",
        о: "o",
        П: "P",
        п: "p",
        Р: "R",
        р: "r",
        С: "S",
        с: "s",
        Т: "T",
        т: "t",
        У: "U",
        у: "u",
        Ф: "F",
        ф: "f",
        X: "H",
        x: "h",
        Ц: "Ts",
        ц: "ts",
        Ч: "Ch",
        ч: "ch",
        Ш: "Sh",
        ш: "sh",
        Щ: "Sht",
        щ: "sht",
        Ъ: "A",
        ъ: "a",
        Ь: "Y",
        ь: "y",
        Ю: "Yu",
        ю: "yu",
        Я: "Ya",
        я: "ya",
      };
      for (const char in charMap) {
        const replacement = charMap[char];
        assertEquals(
          slug("foo " + char + " bar baz", { locale: "bg" }),
          "foo-" + replacement.toLowerCase() + "-bar-baz",
          "replacing '" + char + "'"
        );
      }
    }
  );

  await t.step("should replace serbian chars if locale provided", function () {
    const charMap: CharMap = {
      ђ: "dj",
      ј: "j",
      љ: "lj",
      њ: "nj",
      ћ: "c",
      џ: "dz",
      đ: "dj",
      Ђ: "Dj",
      Ј: "j",
      Љ: "Lj",
      Њ: "Nj",
      Ћ: "C",
      Џ: "Dz",
      Đ: "Dj",
      ǉ: "lj",
      ǋ: "NJ",
      ǈ: "LJ",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz", { locale: "sr" }),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace german chars if locale provided", function () {
    const charMap: CharMap = {
      Ä: "AE",
      ä: "ae",
      Ö: "OE",
      ö: "oe",
      Ü: "UE",
      ü: "ue",
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo " + char + " bar baz", { locale: "de" }),
        "foo-" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step(
    "should replace ukrainian chars if locale provided",
    function () {
      const charMap: CharMap = {
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
      };
      for (const char in charMap) {
        const replacement = charMap[char];
        assertEquals(
          slug("foo " + char + " bar baz", { locale: "uk" }),
          "foo-" + replacement.toLowerCase() + "-bar-baz",
          "replacing '" + char + "'"
        );
      }
    }
  );

  await t.step("should remove ellipsis in pretty mode", function () {
    const charMap: CharMap = {
      "…": "...",
    };
    for (const char in charMap) {
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should strip … symbols in pretty mode", function () {
    assertEquals(slug("foo … bar baz"), "foo-bar-baz");
  });

  await t.step("should strip symbols", function () {
    const charMap = ["†", "“", "”", "‘", "’", "•"];
    charMap.forEach(function (char) {
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-bar-baz",
        "replacing '" + char + "'"
      );
    });
  });

  await t.step("should replace no unicode when disabled", function () {
    const charMap = "😹☢☠☤☣☭☯☮☏☔☎☀★☂☃✈✉✊".split("");
    charMap.forEach(function (char) {
      assertEquals(
        slug("foo " + char + " bar baz"),
        "foo-bar-baz",
        "replacing '" + char + "'"
      );
    });
  });

  await t.step("should allow altering the charmap", function () {
    const charmap = {
      f: "ph",
      o: "0",
      b: "8",
      a: "4",
      r: "2",
      z: "5",
    };
    assertEquals(slug("foo bar baz", { charmap }), "ph00-842-845");
  });

  await t.step("should replace lithuanian characters", function () {
    assertEquals(slug("ąčęėįšųūžĄČĘĖĮŠŲŪŽ"), "aceeisuuzaceeisuuz");
  });

  await t.step("should be flavourable", function () {
    const text = "It's your journey ... we guide you through.";
    const expected = "its-your-journey-we-guide-you-through";
    assertEquals(slug(text, { mode: "pretty" }), expected);
  });

  await t.step("should default to lowercase in rfc3986 mode", function () {
    const text = "It's Your Journey We Guide You Through.";
    const expected = "its-your-journey-we-guide-you-through.";
    assertEquals(slug(text, { mode: "rfc3986" }), expected);
  });

  await t.step("should allow disabling of lowercase", function () {
    const text = "It's Your Journey We Guide You Through.";
    const expected = "Its-Your-Journey-We-Guide-You-Through.";
    assertEquals(slug(text, { mode: "rfc3986", lower: false }), expected);
  });

  await t.step("should replace arabic characters", function () {
    assertEquals(slug("مرحبا بك"), "mrhba-bk");
    const charMap: CharMap = {
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo" + char + " bar baz"),
        "foo" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should replace zh characters", function () {
    assertEquals(slug("鳄梨"), "6boe5qko");
  });

  await t.step(
    "should ignore symbols if they are not in the charmap",
    function () {
      assertEquals(slug("unicode ♥ is ☢"), "unicode-is");
    }
  );

  await t.step("should ignore lone surrogates", function () {
    assertEquals(slug(String.fromCodePoint(56714, 36991)), "iombvw");
  });

  await t.step("should handle a lone low surrogate by itself", function () {
    assertEquals(slug(String.fromCodePoint(56714)), "ia");
  });

  await t.step("should handle a lone high surrogate by itself", function () {
    assertEquals(slug(String.fromCodePoint(55296)), "ia");
  });

  await t.step("should respect the remove option", function () {
    assertEquals(slug("food", { remove: /[od]/g }), "f");
    assertEquals(
      slug("one 1 two 2 three 3", { remove: /[0-9]/g }),
      "one-two-three"
    );
    assertEquals(slug("one 1 two 2 three 3"), "one-1-two-2-three-3");
  });

  await t.step("should not mutate a passed options object", function () {
    const opts = {};
    slug("fhqwhgads", opts);
    assertEquals(opts, {});
  });

  await t.step("should replace hebrew", function () {
    const charMap: CharMap = {
      א: "",
      בּ: "b",
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
      כּ: "k",
      ךּ: "k",
      כ: "kh",
      ך: "kh",
      ל: "l",
      מ: "m",
      ם: "m",
      נ: "n",
      ן: "n",
      ס: "s",
      ע: "",
      פּ: "p",
      פ: "f",
      ף: "f",
      ץ: "ts",
      צ: "ts",
      ק: "k",
      ר: "r",
      שׁ: "sh",
      שׂ: "s",
      תּ: "t",
      ת: "t",
      בְ: "e",
      חֱ: "e",
      חֲ: "a",
      חֳ: "o",
      בִ: "i",
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
    };
    for (const char in charMap) {
      const replacement = charMap[char];
      assertEquals(
        slug("foo" + char + " bar baz"),
        "foo" + replacement.toLowerCase() + "-bar-baz",
        "replacing '" + char + "'"
      );
    }
  });

  await t.step("should use base64 fallback", function () {
    assertEquals(slug("=)"), "psk");
  });

  await t.step(
    "should return empty result when fallback is disabled",
    function () {
      assertEquals(slug("=(", { fallback: false }), "");
    }
  );
});
