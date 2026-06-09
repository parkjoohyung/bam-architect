import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

try {
    const filename = 'web_blog/용도변경/용도변경.excalidraw.md';
    const filePath = path.join('public', 'posts', filename);
    const text = fs.readFileSync(filePath, 'utf-8');
    
    const drawingMarker = '# Drawing\n';
    const markerIdx = text.indexOf(drawingMarker);
    if (markerIdx === -1) {
        throw new Error('# Drawing marker not found');
    }
    
    let base64Text = text.substring(markerIdx + drawingMarker.length).trim();
    const commentEndIdx = base64Text.indexOf('%%');
    if (commentEndIdx !== -1) {
        base64Text = base64Text.substring(0, commentEndIdx).trim();
    }
    
    // Strip ```compressed-json and ```
    if (base64Text.includes('```compressed-json')) {
        base64Text = base64Text.replace(/```compressed-json\n?/, '').replace(/\n?```/, '');
    }
    base64Text = base64Text.trim();
    
    console.log('Cleaned base64 length:', base64Text.length);
    console.log('First 50 chars of cleaned base64:', base64Text.substring(0, 50));
    
    const buffer = Buffer.from(base64Text, 'base64');
    
    // Try raw inflate
    try {
        const decompressed = zlib.inflateRawSync(buffer).toString('utf-8');
        console.log('✅ Success with inflateRaw!');
        console.log(decompressed.substring(0, 300));
    } catch (e) {
        console.log('❌ Failed with inflateRaw:', e.message);
    }
    
    // Try standard inflate
    try {
        const decompressed = zlib.inflateSync(buffer).toString('utf-8');
        console.log('✅ Success with inflate!');
        console.log(decompressed.substring(0, 300));
    } catch (e) {
        console.log('❌ Failed with inflate:', e.message);
    }
    
    // Try gunzip
    try {
        const decompressed = zlib.gunzipSync(buffer).toString('utf-8');
        console.log('✅ Success with gunzip!');
        console.log(decompressed.substring(0, 300));
    } catch (e) {
        console.log('❌ Failed with gunzip:', e.message);
    }
} catch (e) {
    console.error('Error:', e);
}
