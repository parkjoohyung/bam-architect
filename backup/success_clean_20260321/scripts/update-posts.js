import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'public', 'posts');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'posts.json');

// Helper to format date: 2026_01_17.md -> 2026.01.17
function parseDateFromFilename(filename) {
    const name = filename.replace('.md', '');
    // Check if format matches YYYY_MM_DD
    if (/^\d{4}_\d{2}_\d{2}$/.test(name)) {
        return name.replace(/_/g, '.');
    }
    // Fallback for other files (use file creation time or keep existing logic?)
    // For now, return a default or today's date if parsing fails, but let's stick to the requested format.
    return null;
}

// Helper to extract title from content
function extractTitle(content) {
    const lines = content.split('\n');
    for (let line of lines) {
        // Clean line: remove leading dash and optional space
        const cleanLine = line.replace(/^\s*-\s?/, '').trim();
        // Check for H1-H6 (Starts with #)
        if (cleanLine.startsWith('#')) {
            // Remove hashes and spaces
            return cleanLine.replace(/^#+\s*/, '').trim();
        }
    }
    return 'Untitled Post';
}

function updatePostsIndex() {
    if (!fs.existsSync(POSTS_DIR)) {
        console.error('Posts directory not found.');
        return;
    }

    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
    const posts = [];

    files.forEach(file => {
        const filePath = path.join(POSTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        let date = parseDateFromFilename(file);
        // If filename date parsing fails, try to preserve existing date or fallback?
        // Let's assume user will follow the naming convention for new files.
        // For old files like post1.md, we might need a fallback or they should be renamed.
        // Let's handle legacy files (post1.md) manually or skip date parsing for them if they don't match pattern.

        // Strategy: If date is null (doesn't match YYYY_MM_DD), look for existing entry in current posts.json?
        // Simpler: Just parse what we can.

        const title = extractTitle(content);

        // Special handling for legacy files if needed, or just let them have null date?
        // The user specifically asked "recognize filename as date".
        // Let's assume only files matching the pattern get the auto-date. 
        // For others, we might hardcode or keep "Unknown".
        if (!date) {
            // fast fix for existing example files
            if (file === 'post1.md') date = '2026.01.15';
            else if (file === 'post2.md') date = '2025.12.20';
            else if (file === 'post3.md') date = '2025.11.05';
            else date = 'Unknown Date';
        }

        posts.push({
            id: file.replace('.md', ''), // Use filename without ext as ID
            filename: file,
            title: title,
            date: date
        });
    });

    // Sort by date descending (newest first)
    posts.sort((a, b) => new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-')));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 4));
    console.log(`✅ Updated posts.json with ${posts.length} posts.`);
}

updatePostsIndex();
