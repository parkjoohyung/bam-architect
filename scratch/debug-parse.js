import fs from 'fs';
import path from 'path';

try {
    const filename = 'web_blog/용도변경/용도변경.excalidraw.md';
    const filePath = path.join('public', 'posts', filename);
    const text = fs.readFileSync(filePath, 'utf-8');
    
    console.log('Total length:', text.length);
    console.log('--- LAST 2000 CHARS ---');
    console.log(text.substring(text.length - 2000));
    console.log('------------------------');
} catch (e) {
    console.error(e);
}
