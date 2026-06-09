import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scratch/flowchart_original.json', 'utf8'));
const text0 = data.elements.find(e => e.id === 'text-0');
console.log('text-0 full properties:');
console.log(JSON.stringify(text0, null, 2));
