import xlsx from 'xlsx';

const workbook = xlsx.readFile('data/시행령별표1.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', data.length);
console.log('Header (Row 0):', data[0]);
console.log('Row 1:', data[1]);
console.log('Row 2:', data[2]);
console.log('Row 3:', data[3]);
console.log('Row 4:', data[4]);
