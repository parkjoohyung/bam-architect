import fs from 'fs';
import lz from 'lz-string';

const targetFile = 'public/posts/web_blog/용도변경/data/data.excalidraw.md';
const fileContent = fs.readFileSync(targetFile, 'utf8');

const match = fileContent.match(/```compressed-json\n([\s\S]*?)\n```/);
const compressed = match[1].trim().replace(/\s/g, '');
const decompressed = lz.decompressFromBase64(compressed);
const data = JSON.parse(decompressed);

data.elements.forEach(el => {
    if (el.text && el.text.includes("제1종 근린생활시설")) {
        console.log("Found text element:");
        console.log(`  ID: ${el.id}`);
        console.log(`  text: ${el.text.substring(0, 30)}...`);
        console.log(`  containerId: ${el.containerId}`);
        console.log(`  groupIds: ${JSON.stringify(el.groupIds)}`);
        console.log(`  isDeleted: ${el.isDeleted}`);
    }
    if (el.type === 'rectangle' && (el.id === '9sYkx3dt' || el.boundElements?.some(b => b.id.includes('p7HTfZDI')))) {
        console.log("Found rectangle element:");
        console.log(`  ID: ${el.id}`);
        console.log(`  groupIds: ${JSON.stringify(el.groupIds)}`);
        console.log(`  boundElements: ${JSON.stringify(el.boundElements)}`);
        console.log(`  isDeleted: ${el.isDeleted}`);
    }
});
