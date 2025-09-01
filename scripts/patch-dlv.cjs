// CommonJS patch for dlv package
const fs = require('fs');
const path = require('path');

const dlvDir = path.join(__dirname, '..', 'node_modules', 'dlv');
const distDir = path.join(dlvDir, 'dist');
const distFile = path.join(distDir, 'dlv.js');
const indexFile = path.join(dlvDir, 'index.js');
const extendDir = path.join(__dirname, '..', 'node_modules', 'extend');
const extendIndex = path.join(extendDir, 'index.js');

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

// Patch 'extend' if its index.js is missing (some installs have empty package)
try {
  if (fs.existsSync(extendDir)) {
    const need = !fs.existsSync(extendIndex) || fs.readFileSync(extendIndex, 'utf8').trim().length === 0;
    if (need) {
      const body = `"use strict";
function isObj(o){return o&&typeof o==="object"&&!Array.isArray(o);} 
function extend(){
  var deep=false,i=0; if(typeof arguments[0]==='boolean'){ deep=arguments[0]; i=1; }
  var target=arguments[i++]||{};
  for(; i<arguments.length; i++){
    var src=arguments[i]; if(!src) continue;
    for(var k in src){ if(Object.prototype.hasOwnProperty.call(src,k)){
      var val=src[k];
      if(deep && (isObj(val) || Array.isArray(val))){
        var base=isObj(target[k])?target[k]:(Array.isArray(val)?[]:{});
        target[k]=extend(true, base, val);
      } else { target[k]=val; }
    }}
  }
  return target;
}
module.exports = extend;`;
      fs.writeFileSync(extendIndex, body, 'utf8');
      console.log('[patch-extend] wrote index.js');
    }
  }
} catch (e) {
  console.warn('[patch-extend] failed:', e.message);
}
