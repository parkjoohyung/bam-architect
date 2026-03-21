
import https from 'https';
import fs from 'fs';

const urls = [
    { name: 'Seoul Building Ordinance', url: 'https://www.law.go.kr/자치법규/서울특별시건축조례' },
    { name: 'Seoul Urban Planning Ordinance', url: 'https://www.law.go.kr/자치법규/서울특별시도시계획조례' },
    { name: 'Seoul Urban Planning Rules', url: 'https://www.law.go.kr/자치법규/서울특별시도시계획조례시행규칙' },
    { name: 'Seoul Parking Ordinance', url: 'https://www.law.go.kr/자치법규/서울특별시주차장설치및관리조례' }
];

async function fetchUrl(item) {
    return new Promise((resolve) => {
        https.get(item.url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/<iframe[^>]*src="([^"]+)"/);
                if (match) {
                    resolve({ name: item.name, src: 'https://www.law.go.kr' + match[1], originalUrl: item.url });
                } else {
                    resolve({ name: item.name, error: 'No iframe found' });
                }
            });
        }).on('error', err => resolve({ name: item.name, error: err.message }));
    });
}

async function main() {
    const results = await Promise.all(urls.map(fetchUrl));
    fs.writeFileSync('ordinance_urls.json', JSON.stringify(results, null, 2));
    console.log('Saved to ordinance_urls.json');
}

main();
