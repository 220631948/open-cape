const noRawFirestoreWrites = require('./no-raw-firestore-writes.cjs');
const noUndefinedFirestorePayload = require('./no-undefined-firestore-payload.cjs');
const requireExplicitNullForIds = require('./require-explicit-null-for-ids.cjs');

module.exports = {
  rules: {
    'no-raw-firestore-writes': noRawFirestoreWrites,
    'no-undefined-firestore-payload': noUndefinedFirestorePayload,
    'require-explicit-null-for-ids': requireExplicitNullForIds,
  },
};
