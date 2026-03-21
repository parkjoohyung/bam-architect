const https = require('https');
const fs = require('fs');

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMwTQommz0-7Y61Pub2rnZILJa4LssHEUqipvXGWJxJumxCIKsAg9uIC_mI0PFMPo3tuXBq2WBf12k/pubhtml?gid=1093091332&single=true";
const OUTPUT_FILE = "law_data_scraped.json";

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
            res.on('error', (err) => reject(err));
        });
    });
};

const cleanText = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const extractLinks = (html) => {
    const linkRegex = /href="([^"]*)"[^>]*>(.*?)<\/a>/;
    const match = linkRegex.exec(html);
    if (match) {
        return { url: match[1], title: match[2].replace(/<[^>]*>/g, '').trim() };
    }
    return null;
};

const parseData = (html) => {
    const rows = [];
    const regex = /<tr[^>]*>(.*?)<\/tr>/gs;
    let match;

    while ((match = regex.exec(html)) !== null) {
        const rowContent = match[1];
        const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
        const cells = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
            cells.push(cellMatch[1]);
        }

        if (cells.length > 0) {
            rows.push(cells);
        }
    }
    return rows;
};

const main = async () => {
    try {
        console.log("Fetching data...");
        const html = await fetchUrl(SHEET_URL);
        console.log("Data fetched. Parsing...");

        const rows = parseData(html);
        const data = [];
        let currentParent = "";

        // Skip header if needed (assuming first row is header if no ID)
        let startIndex = 0;
        // Basic check if first row is header
        if (rows.length > 0 && isNaN(parseInt(cleanText(rows[0][0])))) {
            startIndex = 1;
        }

        for (let i = startIndex; i < rows.length; i++) {
            const cells = rows[i];
            if (cells.length < 3) continue;

            let col0 = cleanText(cells[0]); // Index
            let col1 = cleanText(cells[1]); // Parent Region
            let col2 = cleanText(cells[2]); // Target Region

            // Handle merged cells vertical repetition behavior
            // If col1 is present, update currentParent. If empty, use currentParent.
            if (col1) {
                currentParent = col1;
            } else {
                col1 = currentParent;
            }

            // Extract ordinances
            // Assuming subsequent columns are ordinances
            const ordinances = [];
            for (let j = 3; j < cells.length; j++) {
                const link = extractLinks(cells[j]);
                if (link) {
                    ordinances.push(link);
                }
            }

            if (ordinances.length > 0) {
                data.push({
                    id: parseInt(col0) || 0,
                    parent: currentParent,
                    region: col2,
                    ordinances: ordinances
                });
            }
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
        console.log(`Saved ${data.length} items to ${OUTPUT_FILE}`);

    } catch (err) {
        console.error("Error:", err);
    }
};

main();
