const fs = require('fs');
const content = fs.readFileSync('js/law_data_ordinance.js', 'utf8');
// Remove variable declaration
const jsonStr = content.replace(/^window\.ordinanceData\s*=\s*/, '').replace(/;$/, '');
const data = JSON.parse(jsonStr);

// Find Gyeonggi-do
const gyeonggi = data.find(item => item.region === '경기도');
if (gyeonggi && gyeonggi.rows) {
    const seongnam = gyeonggi.rows.find(row => row.region === '성남시');
    const allSeongnam = gyeonggi.rows.filter(row => row.region === '성남시');
    const debugInfo = allSeongnam.map((s, idx) => ({
        index: idx,
        ordinanceCount: s.ordinances ? s.ordinances.length : 0,
        ordinances: s.ordinances ? s.ordinances.slice(0, 3) : []
    }));
    fs.writeFileSync('seongnam_debug.json', JSON.stringify(debugInfo, null, 2), 'utf8');
} else {
    fs.writeFileSync('seongnam_debug.json', "Gyeonggi-do not found or has no rows.", 'utf8');
}
