import fs from 'fs';
import lz from 'lz-string';

const targetFile = 'public/posts/web_blog/용도변경/data/data.excalidraw.md';
const fileContent = fs.readFileSync(targetFile, 'utf8');

const match = fileContent.match(/```compressed-json\n([\s\S]*?)\n```/);
const compressed = match[1].trim().replace(/\s/g, '');
const decompressed = lz.decompressFromBase64(compressed);
const data = JSON.parse(decompressed);

const rects = data.elements.filter(el => el.type === 'rectangle');
rects.forEach(r => {
    const textEl = data.elements.find(el => el.containerId === r.id || (r.boundElements && r.boundElements.some(b => b.id === el.id)));
    const textStr = textEl ? textEl.text.replace(/\n/g, ' ') : '';
    console.log(`Rect ID: ${r.id} | X: ${Math.round(r.x)} | Y: ${Math.round(r.y)} | W: ${r.width} | H: ${r.height} | Text: ${textStr}`);
});
