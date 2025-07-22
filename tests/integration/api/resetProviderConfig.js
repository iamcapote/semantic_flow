// Utility to reset provider config for a user (test-only)

const fetch = require('node-fetch').default;

module.exports = async (userId) => {
  const res = await fetch('http://localhost:3001/api/test/reset-provider-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    throw new Error('Failed to reset provider config');
  }
};
