import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import localRules from './eslint-rules/index.cjs';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'custom-rules': {
        rules: localRules.rules,
      },
    },
    rules: {
      'no-undefined': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unsafe-optional-chaining': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'firebase/firestore',
              importNames: ['setDoc', 'addDoc', 'updateDoc'],
              message: 'Use safeFirestore wrapper to prevent undefined writes.',
            },
          ],
        },
      ],
      'custom-rules/no-raw-firestore-writes': 'error',
      'custom-rules/no-undefined-firestore-payload': 'off',
      'custom-rules/require-explicit-null-for-ids': 'off',
    },
  }
);
