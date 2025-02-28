export default function themePlugin() {
  const virtualModuleId = 'virtual:theme';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'beabee-theme-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const tailwindConfig = await import('../../tailwind.config.js');
        return (
          'export default ' +
          JSON.stringify({
            fontSize: tailwindConfig.default.theme.fontSize,
            borderRadius: tailwindConfig.default.theme.borderRadius,
            spacing: tailwindConfig.default.theme.spacing,
            lineHeight: tailwindConfig.default.theme.lineHeight,
          })
        );
      }
    },
  };
}
