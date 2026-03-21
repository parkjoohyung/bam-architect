
import https from 'https';

const url = 'https://www.law.go.kr/자치법규/성남시경관조례';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        const match = data.match(/<iframe[^>]*src="([^"]+)"/);
        if (match) {
            console.log('Found src:', 'https://www.law.go.kr' + match[1]);
        } else {
            console.log('No iframe found');
        }
    });
}).on('error', err => console.error(err));
