import type { StorybookConfig } from '@storybook/nextjs-vite';

// vite-plugin-storybook-nextjs (pulled in by @storybook/nextjs-vite) requires
// vite's CJS entry, which triggers Vite's own deprecation warning. Suppress it
// since we don't control that dependency's require call.
process.env.VITE_CJS_IGNORE_WARNING = 'true';

const config: StorybookConfig = {
  stories: ['../{app,components,stories}/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};

export default config;