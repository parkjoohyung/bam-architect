import xlsx from 'xlsx';
import fs from 'fs';

const JSON_FILE = 'data/building_types_backup.json'; // Or public/building_types.json
const EXCEL_FILE = 'data/시행령별표1.xlsx';

try {
    if (!fs.existsSync(JSON_FILE)) {
        console.error(`Backup file not found: ${JSON_FILE}`);
        // Try public
        if (fs.existsSync('public/building_types.json')) {
            console.log('Using public/building_types.json instead.');
            // Read public file logic here if needed, but for now assuming backup exists per previous step.
        } else {
            process.exit(1);
        }
    }

    const rawData = fs.readFileSync(JSON_FILE, 'utf8');
    const jsonData = JSON.parse(rawData);

    console.log(`Restoring ${jsonData.length} items to Excel...`);

    // Header: [null, 군, 시설군, 호, 용도군, 세부용도, 비고]
    const header = [null, "군", "시설군", "호", "용도군", "세부용도", "비고"];
    const wbData = [header];

    jsonData.forEach(item => {
        // Map JSON keys back to Excel Columns
        wbData.push([
            null,
            item.군 || "",
            item.시설군 || "",
            item.번호 || "",
            item.유형 || "",
            item.종류 || "",
            item.비고 || ""
        ]);
    });

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(wbData);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

    xlsx.writeFile(wb, EXCEL_FILE);
    console.log(`Successfully restored Excel file: ${EXCEL_FILE}`);

} catch (error) {
    console.error('Restore failed:', error);
}
