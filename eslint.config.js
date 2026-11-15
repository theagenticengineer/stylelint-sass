import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
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
    plugins: { tsdoc, jsdoc },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'tsdoc/syntax': 'warn',
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            // Disabled to support the createPlugin(name, rule) pattern,
            // where the rule is an anonymous function.
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      'jsdoc/check-param-names': ['warn', { checkDestructured: false }],
      'jsdoc/require-param': ['warn', { checkDestructured: false }],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-returns-check': 'warn',
      'jsdoc/no-types': 'warn',
      'jsdoc/informative-docs': 'warn',
      'jsdoc/empty-tags': 'warn',
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.test.ts', 'src/__tests__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='context'][property.name='fix']",
          message:
            'Stylelint 18 removed context.fix: pass a fix callback to utils.report and set meta.fixable.',
        },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'postcss',
              allowTypeImports: true,
              message:
                "Import postcss for types only: rules get stylelint's copy as result.stylelint.postcss (stylelint 18), and the AST comes from sass-parser's copy.",
            },
          ],
        },
      ],
    },
  },
);
