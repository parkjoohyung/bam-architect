import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scratch/flowchart_original.json', 'utf8'));
console.log('Original flowchart elements count:', data.elements.length);
const types = {};
data.elements.forEach(e => {
    types[e.type] = (types[e.type] || 0) + 1;
});
console.log('Original element types:', types);
