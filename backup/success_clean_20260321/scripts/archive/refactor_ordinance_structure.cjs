
const fs = require('fs');
const path = require('path');

// Provincial Mapping (Manual definition based on administrative divisions)
const provinceMapping = {
    // Metro Cities (Do not nest)
    '서울특별시': null,
    '부산광역시': null,
    '대구광역시': null,
    '인천광역시': null,
    '광주광역시': null,
    '대전광역시': null,
    '울산광역시': null,
    '세종특별자치시': null,
    '제주특별자치도': null,

    // Gyeonggi-do
    '경기도': null, // Itself
    '수원시': '경기도',
    '성남시': '경기도',
    '의정부시': '경기도',
    '안양시': '경기도',
    '부천시': '경기도',
    '부천시': '경기도',
    '광명시': '경기도',
    '평택시': '경기도',
    '평택시': '경기도',
    '동두천시': '경기도',
    '안산시': '경기도',
    '고양시': '경기도',
    '과천시': '경기도',
    '구리시': '경기도',
    '남양주시': '경기도',
    '오산시': '경기도',
    '시흥시': '경기도',
    '군포시': '경기도',
    '의왕시': '경기도',
    '하남시': '경기도',
    '용인시': '경기도',
    '파주시': '경기도',
    '이천시': '경기도',
    '안성시': '경기도',
    '김포시': '경기도',
    '화성시': '경기도',
    '광주시': '경기도',
    '양주시': '경기도',
    '포천시': '경기도',
    '여주시': '경기도',
    '연천군': '경기도',
    '가평군': '경기도',
    '양평군': '경기도',

    // Gangwon-do
    '강원도': null, // Old
    '강원특별자치도': null, // New
    '춘천시': '강원특별자치도',
    '원주시': '강원특별자치도',
    '강릉시': '강원특별자치도',
    '동해시': '강원특별자치도',
    '태백시': '강원특별자치도',
    '속초시': '강원특별자치도',
    '삼척시': '강원특별자치도',
    '홍천군': '강원특별자치도',
    '횡성군': '강원특별자치도',
    '영월군': '강원특별자치도',
    '평창군': '강원특별자치도',
    '정선군': '강원특별자치도',
    '철원군': '강원특별자치도',
    '화천군': '강원특별자치도',
    '양구군': '강원특별자치도',
    '인제군': '강원특별자치도',
    '고성군': '강원특별자치도',
    '양양군': '강원특별자치도',

    // Chungbuk
    '충청북도': null,
    '청주시': '충청북도',
    '충주시': '충청북도',
    '제천시': '충청북도',
    '보은군': '충청북도',
    '옥천군': '충청북도',
    '영동군': '충청북도',
    '증평군': '충청북도',
    '진천군': '충청북도',
    '괴산군': '충청북도',
    '음성군': '충청북도',
    '단양군': '충청북도',

    // Chungnam
    '충청남도': null,
    '천안시': '충청남도',
    '공주시': '충청남도',
    '보령시': '충청남도',
    '아산시': '충청남도',
    '서산시': '충청남도',
    '논산시': '충청남도',
    '계룡시': '충청남도',
    '당진시': '충청남도',
    '금산군': '충청남도',
    '부여군': '충청남도',
    '서천군': '충청남도',
    '청양군': '충청남도',
    '홍성군': '충청남도',
    '예산군': '충청남도',
    '태안군': '충청남도',

    // Jeonbuk
    '전라북도': null,
    '전북특별자치도': null,
    '전주시': '전북특별자치도',
    '군산시': '전북특별자치도',
    '익산시': '전북특별자치도',
    '정읍시': '전북특별자치도',
    '남원시': '전북특별자치도',
    '김제시': '전북특별자치도',
    '완주군': '전북특별자치도',
    '진안군': '전북특별자치도',
    '무주군': '전북특별자치도',
    '장수군': '전북특별자치도',
    '임실군': '전북특별자치도',
    '순창군': '전북특별자치도',
    '고창군': '전북특별자치도',
    '부안군': '전북특별자치도',

    // Jeonnam
    '전라남도': null,
    '목포시': '전라남도',
    '여수시': '전라남도',
    '순천시': '전라남도',
    '나주시': '전라남도',
    '광양시': '전라남도',
    '담양군': '전라남도',
    '곡성군': '전라남도',
    '구례군': '전라남도',
    '고흥군': '전라남도',
    '보성군': '전라남도',
    '화순군': '전라남도',
    '장흥군': '전라남도',
    '강진군': '전라남도',
    '해남군': '전라남도',
    '영암군': '전라남도',
    '무안군': '전라남도',
    '함평군': '전라남도',
    '영광군': '전라남도',
    '장성군': '전라남도',
    '완도군': '전라남도',
    '진도군': '전라남도',
    '신안군': '전라남도',

    // Gyeongbuk
    '경상북도': null,
    '포항시': '경상북도',
    '경주시': '경상북도',
    '김천시': '경상북도',
    '안동시': '경상북도',
    '구미시': '경상북도',
    '영주시': '경상북도',
    '영천시': '경상북도',
    '상주시': '경상북도',
    '문경시': '경상북도',
    '경산시': '경상북도',
    '군위군': '대구광역시', // Changed recently? But let's stick to standard or leave alone if unsure.
    '의성군': '경상북도',
    '청송군': '경상북도',
    '영양군': '경상북도',
    '영덕군': '경상북도',
    '청도군': '경상북도',
    '고령군': '경상북도',
    '성주군': '경상북도',
    '칠곡군': '경상북도',
    '예천군': '경상북도',
    '봉화군': '경상북도',
    '울진군': '경상북도',
    '울릉군': '경상북도',

    // Gyeongnam
    '경상남도': null,
    '창원시': '경상남도',
    '진주시': '경상남도',
    '통영시': '경상남도',
    '사천시': '경상남도',
    '김해시': '경상남도',
    '밀양시': '경상남도',
    '거제시': '경상남도',
    '양산시': '경상남도',
    '의령군': '경상남도',
    '함안군': '경상남도',
    '창녕군': '경상남도',
    '고성군': '경상남도',
    '남해군': '경상남도',
    '하동군': '경상남도',
    '산청군': '경상남도',
    '함양군': '경상남도',
    '거창군': '경상남도',
    '합천군': '경상남도',

    // Jeju
    '제주시': '제주특별자치도',
    '서귀포시': '제주특별자치도'
};


// 1. Read the file
const filePath = path.join(__dirname, 'js', 'law_data_ordinance.js');
const rawContent = fs.readFileSync(filePath, 'utf-8');

// 2. Extract JSON part (strip "window.ordinanceData = " and ";")
let jsonStr = rawContent.replace('window.ordinanceData = ', '').trim();
if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

let data = JSON.parse(jsonStr);

// 3. Transformation
const provinces = {};
const others = [];

// First pass: Find existing provinces and independent items
data.forEach(item => {
    const parentName = item.parent.trim();
    // If it's a known province root, keep it
    if (provinceMapping[parentName] === null) {
        if (!provinces[parentName]) {
            provinces[parentName] = item;
            item.type = 'province'; // Force type
            if (!item.rows) item.rows = [];
        } else {
            // Already exists, merge rows?
            provinces[parentName].rows.push(...item.rows);
        }
    } else {
        // Update parent name for consistency
        item.parent = parentName;
        others.push(item);
        console.log('Unmatched parent:', parentName, 'Code:', parentName.charCodeAt(0));
    }
});

// Second pass: Process others
others.forEach(item => {
    let parentName = item.parent.trim();

    // Fix corrupted strings (Gwangmyeong-si)
    // '광' is 44305. If it starts with '광' and ends with '시' and length is not 3, assume corrupted.
    if (parentName.startsWith('광') && parentName.endsWith('시') && parentName.length !== 3) {
        console.log('Fixing corrupted Gwangmyeong-si:', parentName);
        parentName = '광명시';
        item.parent = '광명시';
        item.rows.forEach(r => r.region = '광명시');
    }
    // Fix corrupted strings (Seogwipo-si)
    // '서' (49436). Log showed '서귀포' (contains '포').
    if (parentName.startsWith('서') && parentName.includes('포')) {
        console.log('Fixing corrupted Seogwipo-si:', parentName);
        parentName = '서귀포시';
        item.parent = '서귀포시';
        item.rows.forEach(r => r.region = '서귀포시');
    }

    const targetProvince = provinceMapping[parentName];

    if (targetProvince && provinces[targetProvince]) {
        // This is a city that belongs to a province
        // Check its rows. Usually independent cities have region="" in rows or region=CityName

        item.rows.forEach(row => {
            // Fix region name if missing
            if (!row.region) row.region = parentName;

            // Add to province
            provinces[targetProvince].rows.push(row);
        });
    } else {
        // Unknown or independent (like Metros usually)
        if (!provinces[parentName]) {
            // Create it as new if not exists (should be Metro)
            provinces[parentName] = item;
        } else {
            // Merge
            provinces[parentName].rows.push(...item.rows);
        }
    }
});

// 4. Reconstruct Array preserving order for key metros
const order = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
    '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
];

const finalData = [];
order.forEach(name => {
    if (provinces[name]) {
        finalData.push(provinces[name]);
        delete provinces[name];
    }
});

// Append any remaining (shouldn't be any usually, but just in case)
Object.values(provinces).forEach(p => finalData.push(p));

// 5. Rewrite file
const newContent = `window.ordinanceData = ${JSON.stringify(finalData, null, 4)};`;
fs.writeFileSync(filePath, newContent, 'utf-8');

console.log('Ordinance data restructured successfully.');
