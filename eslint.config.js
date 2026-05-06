import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import localRules from './eslint-rules/index.cjs';
import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  { ignores: ['dist'] },
  firebaseRulesPlugin.configs['flat/recommended'],
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
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
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
      'custom-rules/no-undefined-firestore-payload': 'warn',
      'custom-rules/require-explicit-null-for-ids': 'warn',
    },
  }
);
