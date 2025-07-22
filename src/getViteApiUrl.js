// Only imported in browser/Vite, never in Node/Jest
function getViteApiUrl() {
  /* istanbul ignore next */
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SEMANTIC_FLOW_API_URL) {
    return import.meta.env.VITE_SEMANTIC_FLOW_API_URL;
  }
  return "http://localhost:3001/api/trpc";
}

module.exports = { getViteApiUrl };
