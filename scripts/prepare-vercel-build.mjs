import fs from 'fs';
import path from 'path';

const root = process.cwd();
const adminDir = path.join(root, 'admin');

const copies = [
  ['app', 'app'],
  ['components', 'components'],
  ['lib', 'lib'],
  ['public', 'public'],
  ['middleware.ts', 'middleware.ts'],
  ['next-env.d.ts', 'next-env.d.ts']
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function removeIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

for (const [from, to] of copies) {
  const src = path.join(adminDir, from);
  const dest = path.join(root, to);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing admin source path: ${from}`);
  }
  removeIfExists(dest);
  copyRecursive(src, dest);
}

console.log('Prepared Next.js app at repository root for Vercel build.');
