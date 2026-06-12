import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function isUtf16Buffer(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return true;
  if (buf.length < 4) return false;
  let zeroHigh = 0;
  const sample = Math.min(buf.length, 64);
  for (let i = 1; i < sample; i += 2) {
    if (buf[i] === 0x00 && buf[i - 1] < 0x80) zeroHigh += 1;
  }
  return zeroHigh >= 4;
}

/** Read a file as text, accepting UTF-8 or UTF-16 (with or without BOM). */
export function readTextNormalized(filePath) {
  const buf = fs.readFileSync(filePath);
  if (isUtf16Buffer(buf)) {
    const body = buf[0] === 0xff && buf[1] === 0xfe ? buf.slice(2) : buf;
    return body.toString('utf16le');
  }
  return buf.toString('utf8');
}

/** Write UTF-8 text and return true if the file was updated. */
export function writeUtf8(filePath, text) {
  const next = text.replace(/^\uFEFF/, '');
  const prevBuf = fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
  const needsEncodingFix = prevBuf ? isUtf16Buffer(prevBuf) : false;
  const prevText = prevBuf ? readTextNormalized(filePath) : null;
  if (!needsEncodingFix && prevText === next) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, next, 'utf8');
  return true;
}

function collectJsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) collectJsFiles(full, out);
    else if (entry.endsWith('.js')) out.push(full);
  }
  return out;
}

const targets = [
  path.join(root, 'js'),
  path.join(root, 'admin', 'public', 'js'),
  root
].flatMap((base) => {
  if (base === root) {
    const script = path.join(base, 'script.js');
    return fs.existsSync(script) ? [script] : [];
  }
  return collectJsFiles(base);
});

let changed = 0;
for (const file of targets) {
  if (writeUtf8(file, readTextNormalized(file))) {
    changed += 1;
    console.log('Normalized to UTF-8:', path.relative(root, file));
  }
}

if (changed === 0) {
  console.log('All JS files already UTF-8.');
}
