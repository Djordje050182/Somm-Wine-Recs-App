#!/usr/bin/env node
// Image hygiene check — run before any deploy that touches data:
//   node scripts/check-images.mjs
// Verifies every image URL in data/regions/** responds 200, and flags
// duplicate URLs used across different wineries/experiences (wine style
// buckets are allowed to share within reason, wineries are not).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'regions');

const files = [];
const walk = dir => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) files.push(p);
  }
};
walk(root);

const urlRe = /https:\/\/images\.(?:unsplash|pexels)\.com\/[^\s'"`$]+/g;
const idRe = /'(photo-[0-9a-f-]+)'/g;
const found = new Map(); // url -> [files]
const add = (url, f) => {
  if (!found.has(url)) found.set(url, []);
  found.get(url).push(f.replace(root + '/', ''));
};
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(urlRe)) {
    if (m[0].includes('${')) continue; // template helper, ids captured below
    add(m[0], f);
  }
  for (const m of src.matchAll(idRe)) {
    add(`https://images.unsplash.com/${m[1]}?auto=format&fit=crop&q=80&w=1200`, f);
  }
}

console.log(`Checking ${found.size} distinct image URLs across ${files.length} data files…\n`);

const photoId = url => (url.match(/photo-([0-9a-f-]+)/) || [])[1] ?? url;
const byPhoto = new Map();
for (const [url, fs] of found) {
  const id = photoId(url);
  if (!byPhoto.has(id)) byPhoto.set(id, []);
  byPhoto.get(id).push({ url, files: fs });
}

let broken = 0;
const limit = 10;
const urls = [...found.keys()];
for (let i = 0; i < urls.length; i += limit) {
  await Promise.all(
    urls.slice(i, i + limit).map(async url => {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) {
          broken++;
          console.log(`✗ ${res.status}  ${url}\n   used in: ${found.get(url).join(', ')}`);
        }
      } catch (e) {
        broken++;
        console.log(`✗ ERR  ${url} (${e.message})`);
      }
    })
  );
}

let dupes = 0;
for (const [id, entries] of byPhoto) {
  const allFiles = new Set(entries.flatMap(e => e.files));
  const wineryFiles = [...allFiles].filter(f => f.includes('wineries'));
  const totalUses = entries.length;
  if (wineryFiles.length > 1 || (wineryFiles.length === 1 && totalUses > 1 && entries.some(e => e.files.some(f => f.includes('wineries')) && e.files.length > 1))) {
    dupes++;
    console.log(`⚠ photo ${id} appears in multiple winery contexts: ${[...allFiles].join(', ')}`);
  }
}

console.log(`\n${broken === 0 ? '✓ all URLs respond' : `${broken} broken URL(s)`}; ${dupes === 0 ? '✓ no cross-winery duplicates' : `${dupes} duplicate warning(s)`}`);
process.exit(broken > 0 ? 1 : 0);
