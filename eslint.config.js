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
      'no-undefined': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unsafe-optional-chaining': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'SpreadElement',
          message: 'Do not spread objects into Firestore payloads unless they are strictly typed. Verify that they do not contain undefined.',
        }
      ],
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
      'custom-rules/no-undefined-firestore-payload': 'error',
      'custom-rules/require-explicit-null-for-ids': 'error',
    },
  }
);
