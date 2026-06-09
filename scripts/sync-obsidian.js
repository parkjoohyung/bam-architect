/**
 * Obsidian 노트를 블로그로 동기화하는 스크립트
 * - publish: true 인 노트만 추출
 * - 프론트매터 파싱
 * - posts.json 생성
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정
const CONFIG = {
    // Obsidian 폴더 경로
    obsidianPath: 'D:/park/05.web/public/posts/web_blog',
    // 블로그 posts 폴더
    postsPath: path.join(__dirname, '..', 'posts'),
    // posts.json 경로
    indexPath: path.join(__dirname, '..', 'posts.json')
};

// 재귀적으로 마크다운 파일 찾기
function getMarkdownFiles(dir, baseDir = dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== '.obsidian' && file !== '.git') {
                results = results.concat(getMarkdownFiles(filePath, baseDir));
            }
        } else if (file.endsWith('.md') && !file.startsWith('.')) {
            // baseDir 기준의 상대 경로 저장 (폴더 구조 유지 목적)
            const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
            results.push(relativePath);
        }
    });
    return results;
}

// 프론트매터 파싱
function parseFrontmatter(content) {
    // Normalize line endings
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, content };

    const frontmatterStr = match[1];
    const frontmatter = {};

    frontmatterStr.split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            let value = line.slice(colonIdx + 1).trim();

            // Boolean
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            // Array (simple format: [a, b, c])
            else if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
            }
            // Remove quotes
            else if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            frontmatter[key] = value;
        }
    });

    // Handle multiline tags
    if (!frontmatter.tags && frontmatterStr.includes('tags:')) {
        const tagsMatch = frontmatterStr.match(/tags:\s*\n((?:\s+-\s*.+\n?)+)/);
        if (tagsMatch) {
            frontmatter.tags = tagsMatch[1]
                .split('\n')
                .map(line => line.replace(/^\s*-\s*/, '').trim())
                .filter(t => t);
        }
    }

    const restContent = content.slice(match[0].length).trim();
    return { frontmatter, content: restContent };
}

// 파일명을 ID로 변환 (한글 지원)
function generateId(filename) {
    const filenameOnly = path.basename(filename);
    return filenameOnly
        .replace(/\.md$/, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
}

// 날짜 포맷
function formatDate(dateStr) {
    if (!dateStr) {
        return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    }

    // 다양한 형식 지원
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return dateStr; // 이미 포맷된 경우
    }

    return date.toISOString().slice(0, 10).replace(/-/g, '.');
}

// 설명 추출
function extractDescription(content, maxLength = 150) {
    // 첫 번째 문단 찾기
    const lines = content.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed &&
            !trimmed.startsWith('#') &&
            !trimmed.startsWith('!') &&
            !trimmed.startsWith('[[') &&
            !trimmed.includes('::');
    });

    const firstPara = lines.slice(0, 3).join(' ').trim();
    if (firstPara.length > maxLength) {
        return firstPara.slice(0, maxLength) + '...';
    }
    return firstPara;
}

// 내부 링크 추출
function extractInternalLinks(content) {
    const links = [];
    const regex = /\[\[([^\]]+)\]\]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const linkText = match[1].split('|')[0].trim();
        links.push(linkText);
    }

    return [...new Set(links)];
}

// 메인 동기화 함수
async function syncObsidianNotes() {
    console.log('📂 Obsidian 노트 동기화 시작...\n');

    // posts 폴더 확인/생성
    if (!fs.existsSync(CONFIG.postsPath)) {
        fs.mkdirSync(CONFIG.postsPath, { recursive: true });
        console.log('📁 posts 폴더 생성');
    }

    // Obsidian 폴더 확인
    if (!fs.existsSync(CONFIG.obsidianPath)) {
        console.error(`❌ Obsidian 폴더를 찾을 수 없습니다: ${CONFIG.obsidianPath}`);
        console.log('\n💡 CONFIG.obsidianPath를 올바른 경로로 수정하세요.');
        return;
    }

    // 마크다운 파일 수집 (재귀 스캔)
    const files = getMarkdownFiles(CONFIG.obsidianPath);

    console.log(`📄 발견된 마크다운 파일: ${files.length}개\n`);

    const posts = [];
    const linkGraph = {}; // 노트 간 연결 그래프

    for (const file of files) {
        const filePath = path.join(CONFIG.obsidianPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, content: bodyContent } = parseFrontmatter(content);

        // publish: true 필터링 (단, _draw.md 파일과 .canvas 파일은 publish 여부와 상관없이 허용)
        const isDrawOrCanvas = file.endsWith('_draw.md') || file.endsWith('.canvas');
        if (frontmatter.publish !== true && frontmatter.publish !== 'true' && !isDrawOrCanvas) {
            console.log(`⏭️  스킵 (publish ≠ true): ${file}`);
            continue;
        }

        const filenameOnly = path.basename(file);
        const id = generateId(filenameOnly);
        const title = frontmatter.title || filenameOnly.replace('.md', '');
        const date = formatDate(frontmatter.date);
        const tags = frontmatter.tags || [];
        const description = frontmatter.description || extractDescription(bodyContent);
        const links = extractInternalLinks(content);

        // 링크 그래프 구축
        linkGraph[id] = links.map(l => generateId(l));

        // posts.json 엔트리
        posts.push({
            id,
            title,
            date,
            filename: file,
            tags: Array.isArray(tags) ? tags : [tags],
            description,
            links: linkGraph[id]
        });

        // 파일 복사 (하위 폴더 구조 생성 후 복사)
        const destPath = path.join(CONFIG.postsPath, file);
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(filePath, destPath);

        console.log(`✅ 동기화: ${title} (${date})`);
        if (tags.length) console.log(`   태그: ${tags.join(', ')}`);
        if (links.length) console.log(`   링크: ${links.join(', ')}`);
    }

    // 날짜순 정렬 (최신순)
    posts.sort((a, b) => b.date.localeCompare(a.date));

    // posts.json 저장
    fs.writeFileSync(CONFIG.indexPath, JSON.stringify(posts, null, 2), 'utf-8');
    const publicIndexPath = path.join(__dirname, '..', 'public', 'posts.json');
    fs.writeFileSync(publicIndexPath, JSON.stringify(posts, null, 2), 'utf-8');

    console.log(`\n✨ 동기화 완료!`);
    console.log(`   - 총 ${posts.length}개 포스트`);
    console.log(`   - posts.json 및 public/posts.json 저장됨`);
    console.log(`   - posts/ 폴더에 파일 복사됨`);

    // 통계
    const allTags = posts.flatMap(p => p.tags);
    const tagCounts = {};
    allTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);

    console.log(`\n📊 태그 통계:`);
    Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tag, count]) => console.log(`   #${tag}: ${count}`));
}

// 실행
syncObsidianNotes().catch(console.error);
