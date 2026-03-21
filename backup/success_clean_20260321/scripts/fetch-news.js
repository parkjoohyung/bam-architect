import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const parser = new Parser();
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'news.json');

// RSS Feeds
const FEEDS = [
    {
        source: 'Google News (Architecture)',
        url: 'https://news.google.com/rss/search?q=Architecture+when:7d&hl=en-US&gl=US&ceid=US:en'
    },
    {
        source: 'ArchDaily',
        url: 'https://www.archdaily.com/feed/rss/'
    },
    {
        source: 'Google News (Korea Architecture)',
        url: 'https://news.google.com/rss/search?q=%EA%B1%B4%EC%B6%95+when:7d&hl=ko&gl=KR&ceid=KR:ko'
    }
];

async function fetchNews() {
    console.log('Fetching news...');
    let allNews = [];

    for (const feed of FEEDS) {
        try {
            const feedData = await parser.parseURL(feed.url);
            console.log(`✅ Loaded ${feedData.items.length} items from ${feed.source}`);

            const items = feedData.items.slice(0, 5).map(item => { // Limit to 5 per source
                // Try to extract an image if available (HTML in content)
                let imageUrl = 'favicon.svg'; // Default image
                const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/) ||
                    item['content:encoded']?.match(/<img[^>]+src="([^">]+)"/);

                if (imgMatch) {
                    imageUrl = imgMatch[1];
                }

                return {
                    title: item.title,
                    link: item.link,
                    date: new Date(item.pubDate).toLocaleDateString(),
                    source: feed.source,
                    snippet: item.contentSnippet ? item.contentSnippet.substring(0, 100) + '...' : '',
                    image: imageUrl
                };
            });

            allNews = [...allNews, ...items];
        } catch (error) {
            console.error(`❌ Failed to fetch ${feed.source}:`, error.message);
        }
    }

    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allNews, null, 4));
    console.log(`🎉 Saved ${allNews.length} news items to public/news.json`);
}

fetchNews();
