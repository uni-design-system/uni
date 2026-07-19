// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'storybook-static/**', 'prototype/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': 'off', // custom selector scheme (uniRipple, dragAndDrop)
      '@angular-eslint/component-selector': 'off', // dual selector scheme is intentional (uni-x, X)
      '@angular-eslint/component-class-suffix': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      // Emotion's injectGlobal is a tagged template used for its side effect
      '@typescript-eslint/no-unused-expressions': ['error', { allowTaggedTemplates: true }],

      // Signals-first API surface: legacy decorators are being purged (Phase 2).
      // Currently 'warn' — flip each to 'error' as the purge lands.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Decorator[expression.callee.name="Input"]',
          message: 'Use the input() signal primitive instead of @Input().',
        },
        {
          selector: 'Decorator[expression.callee.name="Output"]',
          message: 'Use the output() function instead of @Output().',
        },
        {
          selector: 'Decorator[expression.callee.name="HostBinding"]',
          message: 'Use the host metadata with a computed() signal instead of @HostBinding().',
        },
        {
          selector: 'Decorator[expression.callee.name="HostListener"]',
          message: 'Use the host metadata instead of @HostListener().',
        },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/prefer-standalone': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  }
);
