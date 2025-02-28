// Base configuration that can be extended
export const baseConfig = {
  trailingComma: "none",
  overrides: [
    {
      files: ["*.yfm"],
      options: { parser: "html" },
    },
  ],
};

// Frontend specific configuration
export const frontendConfig = {
  ...baseConfig,
  singleQuote: true,
  trailingComma: "es5",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: null,
};
