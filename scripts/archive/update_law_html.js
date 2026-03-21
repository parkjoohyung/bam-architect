
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'law.html');
let content = fs.readFileSync(filePath, 'utf8');

// I will read the file as lines, replace lines 908-1203 (0-indexed: 907-1202) with my new content.
const lines = content.split(/\r?\n/);
// lines[907] is "                            <!-- Ordinance Area (Seoul City) -->"
// lines[1202] is "                            </div>" (closing ordinance-area)

// Verification
const startLineIdx = 907;
const endLineIdx = 1202;

if (!lines[startLineIdx] || !lines[startLineIdx].includes('Ordinance Area (Seoul City)')) {
    console.error('Start line verification failed.');
    console.error(`Expected to contain "Ordinance Area (Seoul City)", found: "${lines[startLineIdx]}"`);
    process.exit(1);
}

if (!lines[endLineIdx] || !lines[endLineIdx].includes('</div>')) {
    console.error('End line verification failed.');
    console.error(`Expected "</div>", found: "${lines[endLineIdx]}"`);
    process.exit(1);
}

const newContentLines = [
    '                            <!-- Ordinance Area (Dynamic) -->',
    '                            <div class="law-section-container ordinance-area">',
    '                                <h3 class="section-title">조례</h3>',
    '                                <div class="law-grid" id="ordinance_grid_container">',
    '                                    <!-- Dynamic Content Loaded Here -->',
    '                                </div>',
    '                            </div>'
];

// Replace
lines.splice(startLineIdx, endLineIdx - startLineIdx + 1, ...newContentLines);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated law.html');
