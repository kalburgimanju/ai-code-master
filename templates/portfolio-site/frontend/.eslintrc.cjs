module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  rules: {
    // TypeScript rules - be less strict about unused variables
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',

    // React rules - fix escaping issues
    'react/react-in-jsx-scope': 'off',
    'react/jsx-typing': 'off',
    'react/no-unescaped-entities': 'off', // Disable due to legitimate HTML content in quotes

    // React Hooks rules - required for hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Code quality
    'no-console': 'warn',
    'prefer-const': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};