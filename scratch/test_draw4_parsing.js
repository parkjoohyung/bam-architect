import fs from 'fs';
import lz from 'lz-string';

try {
    const fileContent = fs.readFileSync('public/posts/web_blog/용도변경/data/draw4.excalidraw.md', 'utf8');
    const match = fileContent.match(/```compressed-json\n([\s\S]*?)\n```/);
    if (!match) throw new Error("No compressed-json block found!");

    const compressed = match[1].trim().replace(/\s/g, '');
    const decompressed = lz.decompressFromBase64(compressed);
    if (!decompressed) throw new Error("Failed to decompress");
    
    const data = JSON.parse(decompressed);
    console.log("Decompression and JSON parsing successful!");
    console.log("Number of elements:", data.elements.length);
} catch (e) {
    console.error("Error checking draw4:", e.message);
}
