const fs = require('fs');
const path = require('path');

const dir = 'd:/park/05.web';
const htmlFiles = ['index.html', 'law.html', 'blog.html', 'blog-post.html', 'about.html', 'ai-studio.html'];

const seoKeywords = '<meta name="keywords" content="건축, 법규, 건축사, 건축설계, 밤아키텍트, BAM Architect, 건축 포트폴리오, 인공지능 건축, 건축 블로그" />';
const seoRobots = '<meta name="robots" content="index, follow" />';
const ogSiteName = '<meta property="og:site_name" content="밤아키텍트 (BAM Architect)" />';
const ogLocale = '<meta property="og:locale" content="ko_KR" />';

htmlFiles.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove old tags if they exist to avoid duplicates
        content = content.replace(/<meta name="keywords".*?>\s*/gi, '');
        content = content.replace(/<meta name="robots".*?>\s*/gi, '');
        content = content.replace(/<link rel="canonical".*?>\s*/gi, '');
        
        // Build new tags
        const canonicalUrl = `<link rel="canonical" href="https://parkjoohyung.github.io/bam-architect/${file === 'index.html' ? '' : file}" />`;
        
        const tagsToInject = `\n    <!-- SEO & Metadata -->\n    ${seoKeywords}\n    ${seoRobots}\n    ${canonicalUrl}\n    ${ogSiteName}\n    ${ogLocale}`;
        
        // Inject right after <meta name="viewport"...>
        if (content.includes('<meta name="viewport"')) {
            content = content.replace(/(<meta name="viewport".*?>)/i, `$1${tagsToInject}`);
        } else {
            // fallback, insert after <head>
            content = content.replace(/<head>/i, `<head>${tagsToInject}`);
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated SEO for ${file}`);
    }
});
