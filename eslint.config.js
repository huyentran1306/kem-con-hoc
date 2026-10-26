import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-undef': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];
