import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://parkjoohyung.github.io/bam-architect';
const POSTS_PATH = path.join(process.cwd(), 'public', 'posts.json');
const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

// 1. Read Posts
const posts = JSON.parse(fs.readFileSync(POSTS_PATH, 'utf-8'));

// 2. Define Static Pages (paths relative to domain root)
const staticPages = [
  '',
  '/projects.html',
  '/blog.html',
  '/contact.html'
];

// 3. Generate XML
const urlElements = [
  ...staticPages.map(page => `
  <url>
    <loc>${DOMAIN}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`),
  ...posts.map(post => `
  <url>
    <loc>${DOMAIN}/blog-post.html?id=${post.id}</loc>
    <lastmod>${post.date.replace(/\./g, '-')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements.join('')}
</urlset>`;

// 4. Write File
fs.writeFileSync(SITEMAP_PATH, sitemap);
console.log('✅ Sitemap generated at:', SITEMAP_PATH);
