import fs from 'fs';
import lz from 'lz-string';

const targetFile = 'public/posts/web_blog/용도변경/data/data.excalidraw.md';
const fileContent = fs.readFileSync(targetFile, 'utf8');

// Extract compressed json
const match = fileContent.match(/```compressed-json\n([\s\S]*?)\n```/);
if (!match) {
    console.error("No compressed-json found!");
    process.exit(1);
}

const compressed = match[1].trim().replace(/\s/g, '');
const decompressed = lz.decompressFromBase64(compressed);
const data = JSON.parse(decompressed);

console.log(`Total elements: ${data.elements.length}`);
const groups = new Set();
data.elements.forEach(el => {
    if (el.groupIds) {
        el.groupIds.forEach(g => groups.add(g));
    }
});
console.log("Groups found:", Array.from(groups));
console.log("Types count:", data.elements.reduce((acc, el) => {
    acc[el.type] = (acc[el.type] || 0) + 1;
    return acc;
}, {}));
