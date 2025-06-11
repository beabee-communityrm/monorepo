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
};

// Frontend specific configuration
export const frontendConfig = {
  ...baseConfig,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: null,
};
