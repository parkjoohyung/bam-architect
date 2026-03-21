const fs = require('fs');

const files = [
    'd:\\park\\05.web\\js\\law_data_ordinance.js',
    'd:\\park\\05.web\\seongnam_data.json',
    'd:\\park\\05.web\\seongnam_debug.json'
];

files.forEach(file => {
    try {
        if (!fs.existsSync(file)) return;

        let content = fs.readFileSync(file, 'utf8');
        let count = 0;

        // Upgrade law.go.kr
        const newContent = content.replace(/http:\/\/www\.law\.go\.kr/g, (match) => {
            count++;
            return 'https://www.law.go.kr';
        });

        // Upgrade seoul.go.kr (urban, news, etc)
        // Be careful, some subdomains might not support HTTPS, but most government sites do now.
        // Let's stick to law.go.kr first as that's the main issue.

        if (count > 0) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated ${count} links in ${file}`);
        } else {
            console.log(`No http links found in ${file}`);
        }
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});
