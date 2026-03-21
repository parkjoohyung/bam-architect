
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'public', 'js');
const destDir = path.join(__dirname, 'js');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

const files = ['law.js', 'law_data_ordinance.js'];

files.forEach(file => {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to ${destDir}`);
});
