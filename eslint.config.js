import eslint from '@eslint/js';
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
  {
    files: ['**/*.ts'],
    plugins: { tsdoc },
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
    rules: { 'tsdoc/syntax': 'warn' },
  },
);
