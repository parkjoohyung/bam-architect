
import https from 'https';

const encodedUrl = 'https://www.law.go.kr/%EC%9E%90%EC%B9%98%EB%B2%95%EA%B7%9C/%EB%B6%80%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C%EB%8F%84%EC%8B%9C%EA%B3%84%ED%9A%8D%EC%A1%B0%EB%A1%80';
const decodedUrl = decodeURI(encodedUrl);

function check(u, label) {
    console.log(`Checking ${label}: ${u}`);
    https.get(u, (res) => {
        console.log(`${label} Status: ${res.statusCode}`);
        if (res.statusCode >= 300 && res.statusCode < 400) {
            console.log(`${label} Redirect to: ${res.headers.location}`);
            return;
        }
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const match = data.match(/<iframe[^>]*src="([^"]+)"/);
            if (match) {
                console.log(`${label} SUCCESS: Found src ${match[1]}`);
            } else {
                console.log(`${label} FAILED: No iframe. Body len: ${data.length}`);
                // console.log(data.substring(0, 200));
            }
        });
    }).on('error', e => console.error(`${label} Error: ${e.message}`));
}

check(encodedUrl, 'ENCODED');
check(decodedUrl, 'DECODED');
