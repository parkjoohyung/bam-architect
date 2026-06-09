import fs from 'fs';
import lz from 'lz-string';

const fileContent = fs.readFileSync('public/posts/web_blog/용도변경/data/data.excalidraw.md', 'utf8');
const startIdx = fileContent.indexOf('```compressed-json');
const endIdx = fileContent.indexOf('```', startIdx + 18);

const base64 = fileContent.substring(startIdx + 18, endIdx).trim().replace(/\s/g, '');
const jsonText = lz.decompressFromBase64(base64);
const data = JSON.parse(jsonText);

console.log('Group IDs in drawing:');
const groups = {};
data.elements.forEach(e => {
    if (e.groupIds && e.groupIds.length > 0) {
        e.groupIds.forEach(g => {
            groups[g] = (groups[g] || 0) + 1;
        });
    }
});
console.log(groups);

console.log('\nFrame IDs in drawing:');
const frames = {};
data.elements.forEach(e => {
    if (e.frameId) {
        frames[e.frameId] = (frames[e.frameId] || 0) + 1;
    }
});
console.log(frames);

console.log('\nSample elements with groups:');
data.elements.filter(e => e.groupIds && e.groupIds.length > 0).slice(0, 10).forEach(e => {
    console.log(`- Type: ${e.type}, ID: ${e.id}, Groups: ${JSON.stringify(e.groupIds)}, Text: "${e.text || ''}"`);
});
