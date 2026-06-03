import xlsx from 'xlsx';
import fs from 'fs';

const EXCEL_FILE = 'data/시행령별표1.xlsx';
const OUTPUT_FILE = 'public/building_types.json';

try {
    if (!fs.existsSync(EXCEL_FILE)) {
        console.error(`Error: File not found: ${EXCEL_FILE}`);
        process.exit(1);
    }

    const workbook = xlsx.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Read raw data (header: 1 means array of arrays)
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Skip header row
    const dataRows = rows.slice(1);

    const result = dataRows.map((row, index) => {
        // Map columns based on user request "Show Group Number and don't map/transform too much"
        // Index 1: 군 (Group Number)
        // Index 2: 시설군 (Group Name)
        // Index 3: 호 (Number)
        // Index 4: 용도군 (Type)
        // Index 5: 세부용도 (Kind)
        // Index 6: 비고 (Remark)

        const groupNum = row[1];      // 군
        const facilityGroup = row[2]; // 시설군
        const number = row[3];        // 호
        const type = row[4];          // 용도군
        const kind = row[5];          // 세부용도
        const remark = row[6];        // 비고

        // Must have at least Type or Kind to be valid
        if (!type && !kind) return null;

        return {
            index: index + 1,
            "군": groupNum ? String(groupNum).trim() : "",
            "시설군": facilityGroup ? String(facilityGroup).trim() : "",
            "번호": number ? String(number).trim() : "",
            "유형": type ? String(type).trim() : "",
            "종류": kind ? String(kind).trim().replace(/\r\n/g, '\n') : "",
            "비고": remark ? String(remark).trim().replace(/\r\n/g, '\n') : ""
        };
    }).filter(item => item !== null);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
    console.log(`Successfully converted ${result.length} items to ${OUTPUT_FILE}`);

} catch (error) {
    console.error('Conversion failed:', error);
    process.exit(1);
}
