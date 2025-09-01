// Ensures the 'dlv' package has valid files for TailwindCSS runtime.
// Some environments install an empty package; this patches it locally.
const fs = require('fs');
const path = require('path');

const dlvDir = path.join(__dirname, '..', 'node_modules', 'dlv');
const distDir = path.join(dlvDir, 'dist');
const distFile = path.join(distDir, 'dlv.js');
const indexFile = path.join(dlvDir, 'index.js');

const impl = `"use strict";
function dlv(obj, key, def) {
  if (obj == null) return def;
  const parts = Array.isArray(key) ? key : String(key).split('.').filter(Boolean);
  let out = obj;
  for (let i = 0; i < parts.length; i++) {
    if (out == null) return def;
    out = out[parts[i]];
  }
  return out === undefined ? def : out;
}
module.exports = dlv;
module.exports.default = dlv;
`;

try {
  if (!fs.existsSync(dlvDir)) {
    console.warn('[patch-dlv] dlv not installed; skipping');
    process.exit(0);
  }
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  const needsDist = !fs.existsSync(distFile) || fs.readFileSync(distFile, 'utf8').trim().length === 0;
  if (needsDist) {
    fs.writeFileSync(distFile, impl, 'utf8');
    console.log('[patch-dlv] wrote dist/dlv.js');
  }
  const needsIndex = !fs.existsSync(indexFile) || fs.readFileSync(indexFile, 'utf8').trim().length === 0;
  if (needsIndex) {
    fs.writeFileSync(indexFile, "module.exports = require('./dist/dlv.js');\n", 'utf8');
    console.log('[patch-dlv] wrote index.js');
  }
} catch (e) {
  console.warn('[patch-dlv] failed:', e.message);
}
