import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'public', 'posts');

function getMarkdownFilesRecursive(dir, baseDir = dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file.startsWith('.') || file.toLowerCase() === 'data' || file === '가이드') return;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getMarkdownFilesRecursive(filePath, baseDir));
        } else if (file.endsWith('.md') || file.endsWith('.canvas')) {
            results.push(path.relative(baseDir, filePath));
        }
    });
    return results;
}

const relativeFiles = getMarkdownFilesRecursive(POSTS_DIR);
console.log('Found relative files:', relativeFiles);

relativeFiles.forEach(relFile => {
    const filePath = path.join(POSTS_DIR, relFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Simple frontmatter parser
    const match = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = {};
    if (match) {
        match[1].split('\n').forEach(line => {
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
                frontmatter[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
            }
        });
    }
    
    const pubVal = String(frontmatter.publish).trim().toLowerCase();
    const isPublish = frontmatter.publish === true || pubVal === 'true' || pubVal.startsWith('true');
    const isExcalidrawOrCanvas = relFile.endsWith('.excalidraw.md') || relFile.endsWith('.canvas');
    
    console.log(`File: ${relFile}`);
    console.log(`  isPublish: ${isPublish} (publish: ${frontmatter.publish})`);
    console.log(`  isExcalidrawOrCanvas: ${isExcalidrawOrCanvas}`);
    console.log(`  Skipped: ${!isPublish && !isExcalidrawOrCanvas}`);
});
