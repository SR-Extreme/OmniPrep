import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                ],
                mono: [
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    'monospace',
                ],
            },
            boxShadow: {
                soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
                card: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 4px 16px -2px rgb(0 0 0 / 0.06)',
                elevated: '0 4px 24px -4px rgb(0 0 0 / 0.08), 0 1px 2px 0 rgb(0 0 0 / 0.04)',
            },
            borderRadius: {
                DEFAULT: '0.375rem',
            },
        },
    },
    plugins: [],
};

export default config;
