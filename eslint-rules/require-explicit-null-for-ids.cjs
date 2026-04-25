module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'projectId must be string or explicitly null, never optional or undefined.',
    },
    messages: {
      explicitNullRequired: 'projectId must be explicitly set to a string or null, cannot be undefined or omitted.',
    },
    schema: [],
  },
  create(context) {
    return {
      TSPropertySignature(node) {
        if (node.key.name === 'projectId' && node.optional) {
          context.report({
            node,
            messageId: 'explicitNullRequired',
          });
        }
      },
    };
  },
};
