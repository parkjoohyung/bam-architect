import xlsx from 'xlsx';

const workbook = xlsx.readFile('data/시행령별표1.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Find first row with non-empty Index 6
const rowWithRemark = rows.find(r => r[6] && String(r[6]).trim() !== "" && String(r[6]).trim() !== "\"\"");

if (rowWithRemark) {
    console.log('--- Row with Remark ---');
    console.log(`Index 1 (Ignored?): ${rowWithRemark[1]}`);
    console.log(`Index 2 (Facility): ${rowWithRemark[2]}`);
    console.log(`Index 3 (Number):   ${rowWithRemark[3]}`);
    console.log(`Index 4 (Type):     ${rowWithRemark[4]}`);
    console.log(`Index 5 (Kind):     ${rowWithRemark[5]}`);
    console.log(`Index 6 (Remark):   ${rowWithRemark[6]}`);
} else {
    console.log('No row with non-empty Index 6 found.');
}
