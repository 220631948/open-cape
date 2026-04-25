module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw firestore writes to prevent undefined payloads.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      useSafeFirestore: 'Use safeFirestore wrapper to prevent undefined writes. Do not import setDoc, addDoc, or updateDoc from "firebase/firestore".',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename;
    // Allow the wrapper itself
    if (filename.includes('safeFirestore') || filename.includes('firestoreUtils')) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === 'firebase/firestore') {
          node.specifiers.forEach(specifier => {
            if (specifier.type === 'ImportSpecifier') {
              const name = specifier.imported.name;
              if (['setDoc', 'addDoc', 'updateDoc'].includes(name)) {
                context.report({
                  node: specifier,
                  messageId: 'useSafeFirestore',
                });
              }
            }
          });
        }
      },
    };
  },
};
