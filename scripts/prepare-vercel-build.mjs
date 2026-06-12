import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readTextNormalized, writeUtf8 } from './normalize-js-encoding.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const adminDir = path.join(root, 'admin');

/** Paths relative to admin/ that must exist for the root Next.js build. */
const REQUIRED_COPIES = [
  ['app', 'app'],
  ['components', 'components'],
  ['lib', 'lib'],
  ['public', 'public'],
  ['middleware.ts', 'middleware.ts']
];

/** Generated locally; create a minimal stub if absent on CI. */
const OPTIONAL_COPIES = [
  ['next-env.d.ts', 'next-env.d.ts']
];

const NEXT_ENV_STUB = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`;

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
  if (src.endsWith('.js')) {
    writeUtf8(dest, readTextNormalized(src));
    return;
  }
  fs.copyFileSync(src, dest);
}

function removeIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function ensureAdminDir() {
  if (!fs.existsSync(adminDir)) {
    throw new Error(
      `Admin directory not found at ${adminDir}. ` +
      'Ensure admin/ is committed to git and not excluded by .vercelignore.'
    );
  }
}

function copyFromAdmin(relativePath, optional = false) {
  const src = path.join(adminDir, relativePath);
  const dest = path.join(root, relativePath);

  if (!fs.existsSync(src)) {
    if (optional) {
      if (relativePath === 'next-env.d.ts') {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, NEXT_ENV_STUB, 'utf8');
        return;
      }
      return;
    }
    throw new Error(
      `Missing admin source path: ${relativePath} (expected at ${src}). ` +
      'Check that admin/ is included in the Vercel deployment (see .vercelignore).'
    );
  }

  removeIfExists(dest);
  copyRecursive(src, dest);
}

ensureAdminDir();

for (const [from] of REQUIRED_COPIES) {
  copyFromAdmin(from, false);
}

for (const [from] of OPTIONAL_COPIES) {
  copyFromAdmin(from, true);
}

const clientModule = path.join(root, 'lib', 'supabase', 'client.ts');
if (!fs.existsSync(clientModule)) {
  throw new Error(
    `Supabase client module missing after copy (expected at ${clientModule}). ` +
    'Ensure admin/lib/supabase is not excluded by .vercelignore.'
  );
}

/** Public marketing site (served from public/ alongside /admin Next.js app). */
const STATIC_SITE_FILES = ['index.html', 'style.css', 'script.js'];
const STATIC_SITE_DIRS = ['js', 'assets'];

function copyStaticSite() {
  const publicDir = path.join(root, 'public');
  fs.mkdirSync(publicDir, { recursive: true });

  const assetVersion = String(Date.now());

  for (const file of STATIC_SITE_FILES) {
    const src = path.join(root, file);
    if (!fs.existsSync(src)) {
      throw new Error(`Static site file missing: ${file} (expected at ${src})`);
    }
    const dest = path.join(publicDir, file);
    if (file === 'index.html') {
      let html = readTextNormalized(src);
      html = html.replace(
        /(<script src="(?:js\/[^"]+\.js|script\.js))(?:\?v=[^"]*)?(">)/g,
        `$1?v=${assetVersion}$2`
      );
      writeUtf8(dest, html);
    } else if (file.endsWith('.js')) {
      writeUtf8(dest, readTextNormalized(src));
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  for (const dir of STATIC_SITE_DIRS) {
    const src = path.join(root, dir);
    const dest = path.join(publicDir, dir);
    if (!fs.existsSync(src)) {
      throw new Error(`Static site directory missing: ${dir} (expected at ${src})`);
    }
    removeIfExists(dest);
    copyRecursive(src, dest);
  }
}

copyStaticSite();

const adminAssetsDir = path.join(root, 'public', 'admin', 'assets');
fs.mkdirSync(adminAssetsDir, { recursive: true });
fs.copyFileSync(
  path.join(root, 'assets', 'logo.png'),
  path.join(adminAssetsDir, 'logo.png')
);

console.log('Prepared Next.js app at repository root for Vercel build.');
