import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scratch/decoded_data_excalidraw.json', 'utf8'));
const rect = data.elements.find(el => el.type === 'rectangle');
const text = data.elements.find(el => el.type === 'text');
console.log('--- RECT ---');
console.log(JSON.stringify(rect, null, 2));
console.log('--- TEXT ---');
console.log(JSON.stringify(text, null, 2));
