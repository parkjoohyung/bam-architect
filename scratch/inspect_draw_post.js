import fs from 'fs';
import lz from 'lz-string';

try {
    const content = fs.readFileSync('public/posts/web_blog/용도변경/용도변경·기재사항변경_draw.md', 'utf8');
    const match = content.match(/```compressed-json\n([\s\S]*?)\n```/);
    if (!match) throw new Error("No compressed block");
    const json = JSON.parse(lz.decompressFromBase64(match[1].trim().replace(/\s/g, '')));
    
    console.log("=== ELEMENT COORDINATES ===");
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    json.elements.forEach(el => {
        if (el.isDeleted) return;
        console.log(`Type: ${el.type}, X: ${el.x}, Y: ${el.y}, W: ${el.width}, H: ${el.height}, Link: ${el.link}, Text: ${el.text ? el.text.substring(0, 20) : ''}`);
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + (el.width || 0));
        maxY = Math.max(maxY, el.y + (el.height || 0));
    });
    console.log(`BBOX: MinX=${minX}, MinY=${minY}, MaxX=${maxX}, MaxY=${maxY}`);
} catch (e) {
    console.error(e);
}
