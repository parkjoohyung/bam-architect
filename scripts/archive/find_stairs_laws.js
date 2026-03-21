import fs from 'fs';

const lawDataPath = 'd:/park/05.web/law_data.json';
const rawData = fs.readFileSync(lawDataPath, 'utf8');
const laws = JSON.parse(rawData);

const keyword = '계단';
const results = [];

laws.forEach(law => {
    const lines = law.content.split('\n');
    let currentArticle = '';

    lines.forEach((line, index) => {
        // Track current article header
        if (line.match(/^제\d+조/)) {
            currentArticle = line.trim();
        }

        if (line.includes(keyword)) {
            results.push({
                lawTitle: law.title,
                article: currentArticle,
                content: line.trim(),
                lineIndex: index
            });
        }
    });
});

console.log(JSON.stringify(results, null, 2));
