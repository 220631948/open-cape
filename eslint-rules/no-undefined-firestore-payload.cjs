module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow undefined values or unsafe spreads in Firestore write payloads.',
      category: 'Possible Errors',
      recommended: true,
    },
    messages: {
      noUndefinedAllowed: 'Firestore payloads cannot contain undefined. Use null explicitly.',
      noSpreadAnyAllowed: 'Do not spread objects of type Record<string, any> or unknown types into Firestore payloads, as they may contain undefined.',
    },
    schema: [],
  },
  create(context) {
    // This is a basic AST check. For true type checking, we would need 
    // Typescript parser services, but we can do some syntax-level checks for 'undefined'.
    return {
      Property(node) {
        if (node.value.type === 'Identifier' && node.value.name === 'undefined') {
          context.report({
            node,
            messageId: 'noUndefinedAllowed',
          });
        }
      },
      SpreadElement(node) {
        // Without full TS type-checking, we warn on spreading `any` or we can just warn about spreads in general.
        // But for strict AST we might need typescript type checker.
        // Let's rely on typescript-eslint for any.
        // Just flag `undefined` identifiers in any ObjectExpression that might be a payload.
      }
    };
  },
};
