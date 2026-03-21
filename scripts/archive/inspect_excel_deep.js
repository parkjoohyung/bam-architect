import xlsx from 'xlsx';

const workbook = xlsx.readFile('data/시행령별표1.xlsx');
console.log('Sheets:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', data.length);
console.log('--- Row 0 ---');
console.log(JSON.stringify(data[0]));
console.log('--- Row 1 ---');
console.log(JSON.stringify(data[1]));
console.log('--- Row 2 ---');
console.log(JSON.stringify(data[2]));
console.log('--- Row 3 ---');
console.log(JSON.stringify(data[3]));
console.log('--- Row 4 ---');
console.log(JSON.stringify(data[4]));
