import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import firebaseRulesPlugin from "@firebase/eslint-plugin-security-rules";

export default [
  {files: ["**/*.{js,mjs,cjs,ts,tsx}"]},
  {ignores: ['dist/**/*', 'node_modules/**/*']},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      firebase: firebaseRulesPlugin
    },
    rules: {
      // Enforce no raw db.collection().doc().set() without schema validation wrappers
      "no-restricted-syntax": [
        "error",
        {
          "selector": "CallExpression[callee.property.name='setDoc']",
          "message": "Direct setDoc usage without schema wrapper is restricted."
        },
        {
          "selector": "CallExpression[callee.property.name='addDoc']",
          "message": "Direct addDoc usage without schema wrapper is restricted."
        }
      ]
    }
  }
];
