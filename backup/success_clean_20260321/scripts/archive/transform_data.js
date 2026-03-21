import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read source data
const rawDataPath = path.resolve(__dirname, 'law_data_scraped.json');
if (!fs.existsSync(rawDataPath)) {
    console.error('Error: law_data_scraped.json not found. Run scrape_sheet.js first.');
    process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

const groups = {};
const groupOrder = [];

// Explicit Mapping for Provinces
const provinceMappings = {
    "경기도": [
        "수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시", "동두천시",
        "안산시", "고양시", "과천시", "구리시", "남양주시", "오산시", "시흥시", "군포시",
        "의왕시", "하남시", "용인시", "파주시", "이천시", "안성시", "김포시", "화성시",
        "광주시", "양주시", "포천시", "여주시", "연천군", "가평군", "양평군"
    ],
    "강원특별자치도": [
        "강원도", "춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시",
        "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군",
        "인제군", "고성군", "양양군"
    ],
    "충청북도": [
        "충청북도", "청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군",
        "진천군", "괴산군", "음성군", "단양군"
    ],
    "충청남도": [
        "충청남도", "천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시",
        "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"
    ],
    "전북특별자치도": [
        "전라북도", "전주시", "군산시", "익산시", "정읍시", "남원시", "김제시",
        "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"
    ],
    "전라남도": [
        "전라남도", "목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군",
        "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군",
        "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"
    ],
    "경상북도": [
        "경상북도", "포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시",
        "문경시", "경산시", "군위군", "의성군", "청송군", "영양군", "영덕군", "청도군",
        "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"
    ],
    "경상남도": [
        "경상남도", "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시",
        "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군",
        "거창군", "합천군"
    ],
    "제주특별자치도": [
        "제주특별자치도", "제주시", "서귀포시"
    ]
};

rawData.forEach(item => {
    let originalParent = item.parent ? item.parent.trim() : "";
    let regionName = item.region ? item.region.trim() : "";

    // If region is empty, it's likely the city name was in the parent column
    if (!regionName && originalParent) {
        regionName = originalParent;
    }

    let parentName = originalParent;
    if (!parentName && regionName) parentName = regionName;

    // Apply Mapping
    for (const [province, cities] of Object.entries(provinceMappings)) {
        if (cities.some(city => parentName.includes(city) || regionName.includes(city))) {
            parentName = province;
            break;
        }
    }

    // Initialize group
    if (!groups[parentName]) {
        groups[parentName] = {
            id: null,
            parent: parentName,
            region: parentName,
            ordinances: [],
            rows: [],
            type: 'province'
        };
        groupOrder.push(groups[parentName]);
    }

    const group = groups[parentName];

    const rowEntry = {
        region: regionName || parentName,
        ordinances: item.ordinances
    };

    group.rows.push(rowEntry);
});

// Custom Sort Order
const sortOrder = [
    // Metros
    '서울특별시', '부산광역시', '대구광역시', '인천광역시',
    '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
    // Provinces (User Request: Jeju -> Gangwon -> Gyeonggi)
    '제주특별자치도',
    '강원특별자치도',
    '경기도',
    '충청북도', '충청남도',
    '전북특별자치도', '전라남도',
    '경상북도', '경상남도'
];

groupOrder.sort((a, b) => {
    const indexA = sortOrder.indexOf(a.parent);
    const indexB = sortOrder.indexOf(b.parent);

    // If both are in the list, compare indices
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;

    // If only A is in list, it comes first
    if (indexA !== -1) return -1;

    // If only B is in list, it comes first
    if (indexB !== -1) return 1;

    // Otherwise alphabetical or original order
    return 0;
});

// Final Polish
groupOrder.forEach((group, index) => {
    group.id = index + 1;

    const metroNames = [
        '서울특별시', '부산광역시', '대구광역시', '인천광역시',
        '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'
    ];

    if (metroNames.includes(group.parent)) {
        group.type = 'metro';
        if (group.rows.length > 0) {
            group.ordinances = group.rows.flatMap(r => r.ordinances);
        }
    } else {
        group.type = 'province';
    }
});

const fileContent = `window.ordinanceData = ${JSON.stringify(groupOrder, null, 4)};`;

const dest1 = path.resolve('public/js/law_data_ordinance.js');
const dest2 = path.resolve('js/law_data_ordinance.js');

try {
    fs.writeFileSync(dest1, fileContent);
    console.log(`Updated ${dest1}`);
} catch (e) { console.error(`Could not write to ${dest1}`); }

try {
    fs.writeFileSync(dest2, fileContent);
    console.log(`Updated ${dest2}`);
} catch (e) { console.error(`Could not write to ${dest2}`); }

console.log('Transformation Complete.');
