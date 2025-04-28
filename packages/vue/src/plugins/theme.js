import resolveConfig from 'tailwindcss/resolveConfig.js';

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
        const fullConfig = resolveConfig('../../tailwind.config.js');
        return (
          'export default ' +
          JSON.stringify({
            fontSize: fullConfig.theme.fontSize,
            borderRadius: fullConfig.theme.borderRadius,
            spacing: fullConfig.theme.spacing,
            lineHeight: fullConfig.theme.lineHeight,
          })
        );
      }
    },
  };
}
