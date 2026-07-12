// Post-build prerender — the SEO layer.
//
// For every estate and experience in every live region, writes a real HTML
// file (dist/<region>/estates/<id>/index.html) whose <head> carries proper
// title/description/OpenGraph/canonical tags and whose #root holds a static,
// crawlable article built from the same data the app renders. The app's
// scripts are included, so a human landing on the URL gets the full app the
// moment it hydrates; a crawler gets honest content either way.
//
// Also emits: region section pages, sitemap.xml, robots.txt, and 404.html
// (a copy of the shell) so GitHub Pages serves the app for any route we
// didn't prerender.
//
// Runs after `vite build` via the npm build script.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { REGION_REGISTRY } from '../data/regions';
import { Winery, Experience } from '../types';

const DIST = join(process.cwd(), 'dist');
const BASE = (process.env.VITE_BASE ?? '/Somm-Wine-Recs-App/').replace(/\/$/, '');
const ORIGIN = process.env.VITE_SITE_ORIGIN ?? 'https://djordje050182.github.io';
const SITE = ORIGIN + BASE;

const shell = readFileSync(join(DIST, 'index.html'), 'utf-8');

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const page = (opts: {
  path: string;          // '/margaret-river/estates/mr-edwards'
  title: string;
  description: string;
  image?: string;
  article: string;       // static HTML injected into #root
}) => {
  const canonical = `${SITE}${opts.path}`;
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(opts.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(opts.description)}$2`);
  const og = [
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:title" content="${esc(opts.title)}">`,
    `<meta property="og:description" content="${esc(opts.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${canonical}">`,
    opts.image ? `<meta property="og:image" content="${esc(opts.image)}">` : '',
  ].filter(Boolean).join('\n    ');
  html = html.replace('</head>', `    ${og}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${opts.article}</div>`);
  const dir = join(DIST, ...opts.path.split('/').filter(Boolean));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  return canonical;
};

const wineryArticle = (regionName: string, w: Winery): string => `
  <article style="max-width:42rem;margin:0 auto;padding:2rem 1.5rem;font-family:Georgia,serif;color:#2b2119">
    <p style="text-transform:uppercase;font-size:.75rem;letter-spacing:.1em">${esc(regionName)} · ${esc(w.subregion)} · est. ${w.established}</p>
    <h1>${esc(w.name)}</h1>
    <p><strong>${esc(w.description)}</strong></p>
    ${w.story ? `<p>${esc(w.story)}</p>` : ''}
    <p>${esc(w.specialty)}. Cellar door open ${esc(w.opens)}–${esc(w.closes)}. Tasting ${w.tastingFee === 0 ? 'free' : `$${w.tastingFee} per person`}${w.bookingRequired ? ', booking required' : ', walk-ins welcome'}.</p>
    ${w.sommNote ? `<p><em>The Somm's note: ${esc(w.sommNote)}</em></p>` : ''}
    ${w.community ? `<p>Rated ${w.community.score} on Google from ${w.community.count.toLocaleString()} reviews.</p>` : ''}
    ${w.visitorSummary ? `<p>What visitors say: ${esc(w.visitorSummary)}</p>` : ''}
    ${w.wines?.length ? `<p>Signature wines: ${esc(w.wines.join(', '))}.</p>` : ''}
    ${w.website ? `<p><a href="${esc(w.website)}">Estate website</a></p>` : ''}
  </article>`;

const experienceArticle = (regionName: string, e: Experience): string => `
  <article style="max-width:42rem;margin:0 auto;padding:2rem 1.5rem;font-family:Georgia,serif;color:#2b2119">
    <p style="text-transform:uppercase;font-size:.75rem;letter-spacing:.1em">${esc(regionName)} · ${esc(e.subregion)} · ${esc(e.category)}</p>
    <h1>${esc(e.name)}</h1>
    <p><strong>${esc(e.description)}</strong></p>
    <p>Open ${esc(e.opens)}–${esc(e.closes)} · ${esc(e.priceRange)}</p>
    ${e.sommNote ? `<p><em>The Somm's note: ${esc(e.sommNote)}</em></p>` : ''}
    ${e.website ? `<p><a href="${esc(e.website)}">Website</a></p>` : ''}
  </article>`;

const urls: string[] = [];

for (const [regionId, data] of Object.entries(REGION_REGISTRY)) {
  const { region, wineries, experiences } = data;

  urls.push(page({
    path: `/${regionId}`,
    title: `${region.name} wine region guide | Somm`,
    description: region.strapline,
    image: region.heroImage.url,
    article: `<article style="max-width:42rem;margin:0 auto;padding:2rem 1.5rem;font-family:Georgia,serif"><h1>${esc(region.name)}</h1><p>${esc(region.strapline)}</p><p>${esc(region.terroir.story)}</p><p>${wineries.length} estates, ${experiences.length} experiences — walked, tasted and argued over.</p></article>`,
  }));

  urls.push(page({
    path: `/${regionId}/guide`,
    title: `The cellar doors of ${region.shortName} — every estate reviewed | Somm`,
    description: `${wineries.length} ${region.name} wineries with verified photography, honest ratings and hand-written histories.`,
    image: region.heroImage.url,
    article: `<article style="max-width:42rem;margin:0 auto;padding:2rem 1.5rem;font-family:Georgia,serif"><h1>The cellar doors of ${esc(region.shortName)}</h1><ul>${wineries.map(w => `<li><a href="${BASE}/${regionId}/estates/${w.id}">${esc(w.name)}</a> — ${esc(w.description)}</li>`).join('')}</ul></article>`,
  }));

  for (const w of wineries) {
    urls.push(page({
      path: `/${regionId}/estates/${w.id}`,
      title: `${w.name} — ${w.subregion}, ${region.name} | Somm`,
      description: w.description,
      image: w.image?.url,
      article: wineryArticle(region.name, w),
    }));
  }
  for (const e of experiences) {
    urls.push(page({
      path: `/${regionId}/experiences/${e.id}`,
      title: `${e.name} — ${e.subregion}, ${region.name} | Somm`,
      description: e.description,
      image: e.image?.url,
      article: experienceArticle(region.name, e),
    }));
  }
}

// SPA fallback for routes we did not prerender (GitHub Pages serves 404.html).
copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'));

writeFileSync(join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') +
  `\n</urlset>\n`);

writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`prerendered ${urls.length} pages, sitemap.xml, robots.txt, 404.html`);
