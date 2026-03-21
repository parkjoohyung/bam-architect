
import https from 'https';

const urls = [
    { name: 'Building Act', url: 'https://www.law.go.kr/법령/건축법' },
    { name: 'Building Decree', url: 'https://www.law.go.kr/법령/건축법시행령' },
    { name: 'Building Rules', url: 'https://www.law.go.kr/법령/건축법시행규칙' },
    { name: 'Planning Act', url: 'https://www.law.go.kr/법령/국토의계획및이용에관한법률' },
    { name: 'Planning Decree', url: 'https://www.law.go.kr/법령/국토의계획및이용에관한법률시행령' },
    { name: 'Planning Rules', url: 'https://www.law.go.kr/법령/국토의계획및이용에관한법률시행규칙' },
    { name: 'Housing Act', url: 'https://www.law.go.kr/법령/주택법' },
    { name: 'Housing Decree', url: 'https://www.law.go.kr/법령/주택법시행령' },
    { name: 'Housing Rules', url: 'https://www.law.go.kr/법령/주택법시행규칙' },
    { name: 'Building Management Act', url: 'https://www.law.go.kr/법령/건축물관리법' }
];

async function fetchUrl(item) {
    return new Promise((resolve) => {
        https.get(item.url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/<iframe id="lawService"[^>]*src="([^"]+)"/);
                if (match) {
                    resolve({ name: item.name, src: 'https://www.law.go.kr' + match[1] });
                } else {
                    resolve({ name: item.name, error: 'No iframe found' });
                }
            });
        }).on('error', err => resolve({ name: item.name, error: err.message }));
    });
}

import fs from 'fs';

async function main() {
    try {
        const results = await Promise.all(urls.map(fetchUrl));
        fs.writeFileSync('urls.json', JSON.stringify(results, null, 2), 'utf8');
    } catch (e) {
        console.error(e);
    }
}

main();
