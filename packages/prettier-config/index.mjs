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
};

// Frontend specific configuration
export const frontendConfig = {
  ...baseConfig,
  plugins: [...baseConfig.plugins, "prettier-plugin-tailwindcss"],
  tailwindConfig: null,
};
