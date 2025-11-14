module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '*.config.js', '*.config.ts'],
  parser: '@typescript-eslint/parser',
  plugins: [],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  overrides: [
    {
      files: ['frontend/src/**/*.{ts,tsx}'],
      extends: [
        'plugin:react-hooks/recommended',
        'plugin:react/recommended',
      ],
      plugins: ['react-refresh'],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
}
