const fs = require('fs');
const path = 'd:/park/05.web/js/law.js';
let content = fs.readFileSync(path, 'utf8');

const marker = 'updateSelectAllState();';
const forceCheck = `
    // Force National Law filters to be checked by default if not set
    document.querySelectorAll('input[name="lawFilter"]').forEach(cb => {
        cb.checked = true;
    });
    document.querySelectorAll('.group-filter').forEach(cb => {
        cb.checked = true;
    });
`;

if (!content.includes('Force National Law filters')) {
    content = content.replace(marker, marker + forceCheck);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Forced default filter check in law.js');
