import fs from 'fs';
import lz from 'lz-string';

const fileContent = fs.readFileSync('public/posts/web_blog/용도변경/data/data.excalidraw.md', 'utf8');
const startIdx = fileContent.indexOf('```compressed-json');
const endIdx = fileContent.indexOf('```', startIdx + 18);

const base64 = fileContent.substring(startIdx + 18, endIdx).trim().replace(/\s/g, '');
const jsonText = lz.decompressFromBase64(base64);
const data = JSON.parse(jsonText);

console.log('Text elements in the compressed JSON:');
data.elements.filter(e => e.type === 'text').forEach(e => {
    console.log(`- ID: ${e.id}, Container: ${e.containerId}`);
    console.log(`  Text: [${e.text.replace(/\n/g, '\\n')}]`);
});
