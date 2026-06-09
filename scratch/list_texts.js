import fs from 'fs';
import lz from 'lz-string';

const targetFile = 'public/posts/web_blog/용도변경/data/data.excalidraw.md';
const fileContent = fs.readFileSync(targetFile, 'utf8');

const match = fileContent.match(/```compressed-json\n([\s\S]*?)\n```/);
const compressed = match[1].trim().replace(/\s/g, '');
const decompressed = lz.decompressFromBase64(compressed);
const data = JSON.parse(decompressed);

const texts = data.elements.filter(el => el.type === 'text');
texts.forEach(t => {
    console.log(`Text: ${t.text.replace(/\n/g, ' ')} | ID: ${t.id} | Container: ${t.containerId} | X: ${Math.round(t.x)} | Y: ${Math.round(t.y)}`);
});
