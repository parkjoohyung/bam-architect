import xlsx from 'xlsx';

const workbook = xlsx.readFile('data/시행령별표1.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Row 1 ---');
// Index 1: 군, Index 2: 시설군
console.log('Index 1 (군):', data[1][1]);
console.log('Index 2 (시설군):', data[1][2]);
