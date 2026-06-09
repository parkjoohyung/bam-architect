import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scratch/flowchart_original.json', 'utf8'));

console.log('Flowchart original elements structure:');
data.elements.slice(0, 15).forEach(e => {
    console.log(`- Type: ${e.type}, ID: ${e.id}, index: ${e.index}, groupIds: ${JSON.stringify(e.groupIds)}, boundElements: ${JSON.stringify(e.boundElements)}, containerId: ${e.containerId}`);
    if (e.type === 'text') {
        console.log(`  Text: "${e.text.replace(/\n/g, '\\n')}"`);
    }
});
