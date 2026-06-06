import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'public', 'posts');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'posts.json');

// Helper to format date: 2026_01_17.md -> 2026.01.17
function parseDateFromFilename(filename) {
    const name = path.basename(filename, '.md');
    if (/^\d{4}_\d{2}_\d{2}$/.test(name)) {
        return name.replace(/_/g, '.');
    }
    return null;
}

// Helper to format date to YYYY.MM.DD
function formatDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return dateStr.replace(/-/g, '.');
    }
    return date.toISOString().slice(0, 10).replace(/-/g, '.');
}

// Helper to parse frontmatter (Simple parser)
function parseFrontmatter(content) {
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, bodyContent: content };

    const frontmatterStr = match[1];
    const frontmatter = {};

    frontmatterStr.split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            let value = line.slice(colonIdx + 1).trim();

            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
            } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            frontmatter[key] = value;
        }
    });

    const bodyContent = content.slice(match[0].length).trim();
    return { frontmatter, bodyContent };
}

// Helper to extract title from content
function extractTitle(content, fallbackTitle) {
    const lines = content.split('\n');
    for (let line of lines) {
        const cleanLine = line.replace(/^\s*-\s?/, '').trim();
        if (cleanLine.startsWith('#')) {
            return cleanLine.replace(/^#+\s*/, '').trim();
        }
    }
    return fallbackTitle;
}

// Helper to extract description
function extractDescription(content, maxLength = 150) {
    const lines = content.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed &&
            !trimmed.startsWith('#') &&
            !trimmed.startsWith('!') &&
            !trimmed.startsWith('[[') &&
            !trimmed.includes('::');
    });

    const firstPara = lines.slice(0, 3).join(' ').trim();
    if (firstPara.length > maxLength) {
        return firstPara.slice(0, maxLength) + '...';
    }
    return firstPara || '';
}

// Helper to extract internal links [[LinkText]]
function extractInternalLinks(content) {
    const links = [];
    const regex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const linkText = match[1].split('|')[0].trim();
        links.push(linkText.replace(/\s+/g, '-').toLowerCase());
    }
    return [...new Set(links)];
}

// Helper to recursively get markdown files (ignoring hidden files/folders)
function getMarkdownFilesRecursive(dir, baseDir = dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file.startsWith('.')) return; // Skip dotfiles/folders like .obsidian
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getMarkdownFilesRecursive(filePath, baseDir));
        } else if (file.endsWith('.md')) {
            results.push(path.relative(baseDir, filePath));
        }
    });
    return results;
}

function updatePostsIndex() {
    if (!fs.existsSync(POSTS_DIR)) {
        console.error('Posts directory not found.');
        return;
    }

    const relativeFiles = getMarkdownFilesRecursive(POSTS_DIR);
    const posts = [];

    relativeFiles.forEach(relFile => {
        const filePath = path.join(POSTS_DIR, relFile);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, bodyContent } = parseFrontmatter(content);

        // Skip if publish is explicitly false
        if (frontmatter.publish === false || frontmatter.publish === 'false') {
            return;
        }

        const id = path.basename(relFile, '.md').replace(/\s+/g, '-').toLowerCase();
        
        let date = formatDate(frontmatter.date) || parseDateFromFilename(relFile);
        if (!date) {
            // Legacy fallbacks
            const baseName = path.basename(relFile);
            if (baseName === 'post1.md') date = '2026.01.15';
            else if (baseName === 'post2.md') date = '2025.12.20';
            else if (baseName === 'post3.md') date = '2025.11.05';
            else {
                // Use file modification time
                const stat = fs.statSync(filePath);
                date = stat.mtime.toISOString().slice(0, 10).replace(/-/g, '.');
            }
        }

        const title = frontmatter.title || extractTitle(bodyContent, path.basename(relFile, '.md'));
        const tags = frontmatter.tags || [];
        const description = frontmatter.description || extractDescription(bodyContent);
        const links = extractInternalLinks(content);

        posts.push({
            id,
            filename: relFile.replace(/\\/g, '/'), // Force forward slashes for URLs
            title,
            date,
            tags: Array.isArray(tags) ? tags : [tags],
            description,
            links
        });
    });

    // Sort by date descending
    posts.sort((a, b) => b.date.localeCompare(a.date));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 4), 'utf-8');
    console.log(`✅ Updated posts.json with ${posts.length} posts (recursive).`);
}

updatePostsIndex();
