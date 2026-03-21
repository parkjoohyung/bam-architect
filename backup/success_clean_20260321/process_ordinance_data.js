import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, 'law_data_scraped.json');
const targetFile = path.join(__dirname, 'js', 'law_data_ordinance.js');

try {
    const rawData = fs.readFileSync(sourceFile, 'utf8');
    const data = JSON.parse(rawData);

    function cleanUrl(url) {
        if (!url) return url;
        // Check for Google redirect
        if (url.includes('google.com/url?q=')) {
            const match = url.match(/q=([^&]+)/);
            if (match && match[1]) {
                return decodeURIComponent(match[1]);
            }
        }
        return url;
    }

    function processItem(item) {
        if (Array.isArray(item)) {
            return item.map(processItem);
        } else if (typeof item === 'object' && item !== null) {
            const newItem = {};
            for (const key in item) {
                if (key === 'url') {
                    newItem[key] = cleanUrl(item[key]);
                } else if (key === 'ordinances' || key === 'rows' || key === 'children') { // Recurse into common array fields if structure varies
                    newItem[key] = processItem(item[key]);
                } else {
                    newItem[key] = processItem(item[key]);
                }
            }
            return newItem;
        }
        return item;
    }

    const processedData = processItem(data).map(item => {
        // Transformation for law.js compatibility
        // law.js expects a 'rows' array. If we have direct 'ordinances', wrap them.
        if (item.ordinances && !item.rows) {
            return {
                ...item,
                type: 'metro', // Force flat list display to avoid "Seoul -> Seoul" nesting
                rows: [
                    {
                        region: item.region || item.parent,
                        ordinances: item.ordinances
                    }
                ]
            };
        }
        return item;
    });

    const seoul = processedData.find(d => d.parent === '서울특별시' || d.region === '서울특별시');
    if (seoul) {
        console.log(`Found Seoul data with ${seoul.ordinances ? seoul.ordinances.length : (seoul.rows ? seoul.rows.length : 'unknown')} items.`);
    }

    const fileContent = `window.ordinanceData = ${JSON.stringify(processedData, null, 4)};\n`;

    fs.writeFileSync(targetFile, fileContent, 'utf8');
    console.log(`Successfully updated ${targetFile}`);

} catch (error) {
    console.error('Error processing ordinance data:', error);
}
