import fs from 'fs';
import lz from 'lz-string';

const targetFile = 'public/posts/web_blog/용도변경/data/data.excalidraw.md';
const fileContent = fs.readFileSync(targetFile, 'utf8');

const match = fileContent.match(/```compressed-json\n([\s\S]*?)\n```/);
const compressed = match[1].trim().replace(/\s/g, '');
const decompressed = lz.decompressFromBase64(compressed);
const data = JSON.parse(decompressed);

const texts = data.elements.filter(el => el.type === 'text');
const fontFamilies = new Set(texts.map(t => t.fontFamily));
console.log("Font families in diagram:", Array.from(fontFamilies));
console.log("Example text element:", JSON.stringify(texts[0], null, 2));
