import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(adminDir, '..');
const publicDir = path.join(adminDir, 'public');

const FILES = ['index.html', 'style.css', 'script.js'];
const DIRS = ['js', 'assets'];

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

fs.mkdirSync(publicDir, { recursive: true });

for (const file of FILES) {
  const src = path.join(repoRoot, file);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing public site file: ${src}`);
  }
  fs.copyFileSync(src, path.join(publicDir, file));
}

for (const dir of DIRS) {
  const src = path.join(repoRoot, dir);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing public site directory: ${src}`);
  }
  const dest = path.join(publicDir, dir);
  removeIfExists(dest);
  copyRecursive(src, dest);
}

const adminAssetsDir = path.join(publicDir, 'admin', 'assets');
fs.mkdirSync(adminAssetsDir, { recursive: true });
fs.copyFileSync(
  path.join(repoRoot, 'assets', 'logo.png'),
  path.join(adminAssetsDir, 'logo.png')
);

console.log('Synced marketing site assets into admin/public for deploy.');
