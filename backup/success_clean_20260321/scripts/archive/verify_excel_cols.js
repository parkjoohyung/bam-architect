import xlsx from 'xlsx';

const workbook = xlsx.readFile('data/시행령별표1.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Read as array of arrays
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Header Row (Index 0) ---');
rows[0].forEach((col, idx) => {
    console.log(`Index ${idx}: ${JSON.stringify(col)}`);
});

console.log('\n--- First Data Row (Index 1) ---');
if (rows.length > 1) {
    rows[1].forEach((col, idx) => {
        console.log(`Index ${idx}: ${JSON.stringify(col)}`);
    });
}

console.log('\n--- Second Data Row (Index 2) ---');
if (rows.length > 2) {
    rows[2].forEach((col, idx) => {
        console.log(`Index ${idx}: ${JSON.stringify(col)}`);
    });
}
