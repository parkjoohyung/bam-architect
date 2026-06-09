import fs from 'fs';
import lz from 'lz-string';

try {
    const fileContent = fs.readFileSync('public/posts/web_blog/용도변경/용도변경·기재사항변경_draw.md', 'utf8');
    const startIdx = fileContent.indexOf('```compressed-json');
    const endIdx = fileContent.indexOf('```', startIdx + 18);
    if (startIdx === -1 || endIdx === -1) {
        console.log('JSON block not found');
        process.exit(1);
    }
    
    const base64 = fileContent.substring(startIdx + 18, endIdx).trim().replace(/\s/g, '');
    const jsonText = lz.decompressFromBase64(base64);
    if (!jsonText) {
        console.log('Decompression failed');
        process.exit(1);
    }
    
    fs.writeFileSync('scratch/decoded_example.json', jsonText);
    console.log('Successfully saved to scratch/decoded_example.json');
} catch (e) {
    console.error(e);
}
