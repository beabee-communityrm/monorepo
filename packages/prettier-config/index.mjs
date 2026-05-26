// Base configuration that can be extended
export const baseConfig = {
  singleQuote: true,
  trailingComma: "es5",
  overrides: [
    {
      files: ["*.yfm"],
      options: { parser: "html" },
    },
  ],
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  // Configure import order - sorts by import paths, not by import type
  importOrder: [
    "^reflect-metadata$", // Must be on top of all other imports
    "^@beabee/(.*)$", // Internal beabee packages
    "<THIRD_PARTY_MODULES>", // Third party modules
    "^#", // Local # imports (path aliases)
    "^[./]", // Local relative imports
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  // Add parser plugins to support decorators and other TypeScript features
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
};

// Frontend specific configuration
export const frontendConfig = {
  ...baseConfig,
  plugins: [...baseConfig.plugins, "prettier-plugin-tailwindcss"],
  tailwindConfig: null,
};
