const fs = require('fs');
const path = require('path');

const src = path.dirname(require.resolve('onnxruntime-web/package.json'));
const dist = path.join(src, 'dist');
const out = path.join(process.cwd(), 'public', 'ort');

fs.mkdirSync(out, { recursive: true });

for (const name of fs.readdirSync(dist)) {
  if (name.endsWith('.wasm') || name.endsWith('.mjs') || name.endsWith('.js')) {
    fs.copyFileSync(path.join(dist, name), path.join(out, name));
  }
}
console.log('ORT assets copied.');
