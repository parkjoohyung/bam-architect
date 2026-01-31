/**
 * Sitemap Generator Script
 * Run with: node scripts/generate-sitemap.js
 * 
 * Automatically generates sitemap.xml based on HTML files and posts.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://parkjoohyung.github.io/bam-architect';

// Pages configuration
const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects.html', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog.html', priority: '0.9', changefreq: 'daily' },
  { path: '/news.html', priority: '0.8', changefreq: 'daily' },
  { path: '/law.html', priority: '0.7', changefreq: 'weekly' },
  { path: '/ai-studio.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact.html', priority: '0.7', changefreq: 'monthly' },
];

async function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  for (const page of pages) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Add blog posts from posts.json
  try {
    const postsPath = path.join(rootDir, 'posts.json');
    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      for (const post of posts) {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/blog-post.html?id=${post.id}</loc>\n`;
        xml += `    <lastmod>${post.date}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }
    }
  } catch (e) {
    console.warn('Could not load posts.json:', e.message);
  }

  xml += '</urlset>\n';

  // Write to public directory
  const outputPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  console.log(`✅ Sitemap generated: ${outputPath}`);
}

generateSitemap();
