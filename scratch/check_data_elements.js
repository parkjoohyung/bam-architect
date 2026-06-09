import fs from 'fs';
import lz from 'lz-string';

const fileContent = fs.readFileSync('public/posts/web_blog/용도변경/data/data.excalidraw.md', 'utf8');
const startIdx = fileContent.indexOf('```compressed-json');
const endIdx = fileContent.indexOf('```', startIdx + 18);
if (startIdx === -1 || endIdx === -1) {
    console.log('JSON block not found');
    process.exit(1);
}

const base64 = fileContent.substring(startIdx + 18, endIdx).trim().replace(/\s/g, '');
const jsonText = lz.decompressFromBase64(base64);
const data = JSON.parse(jsonText);
console.log('Total elements count:', data.elements.length);

const types = {};
data.elements.forEach(e => {
    types[e.type] = (types[e.type] || 0) + 1;
});
console.log('Element types:', types);

const duplicates = {};
data.elements.forEach(e => {
    if (e.type === 'text') {
        duplicates[e.text] = (duplicates[e.text] || 0) + 1;
    }
});
console.log('Duplicate texts:');
Object.entries(duplicates).filter(([text, count]) => count > 1).forEach(([text, count]) => {
    console.log(`- "${text.substring(0, 30).replace(/\n/g, '\\n')}" appears ${count} times`);
});
