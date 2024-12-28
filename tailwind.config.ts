import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [],
  important: '#__next',
  corePlugins: {
    preflight: false,
  },
};

export default config;
