import fs from 'fs';
import lz from 'lz-string';

const escapeHtml = (text) => {
    if (typeof text !== 'string') return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// Mock renderMarkdown
const renderMarkdown = (content, filename) => {
    return 'MOCKED_HTML';
};

async function test() {
    const fileContent = fs.readFileSync('public/posts/web_blog/용도변경/용도변경·기재사항변경_draw.md', 'utf8');
    const startIdx = fileContent.indexOf('```compressed-json');
    const endIdx = fileContent.indexOf('```', startIdx + 18);
    const base64 = fileContent.substring(startIdx + 18, endIdx).trim().replace(/\s/g, '');
    const jsonText = lz.decompressFromBase64(base64);
    const jsonData = JSON.parse(jsonText);
    const elements = jsonData.elements || [];

    const isMainDrawPage = true;
    const isCleanInline = false;
    const hash = '';

    // Mock window.allPosts
    const allPosts = [
        { id: '용도변경·기재사항변경', filename: 'web_blog/용도변경/용도변경·기재사항변경.md', title: '용도변경·기재사항변경' }
    ];

    try {
        for (let el of elements) {
            if (el.type === 'embeddable' && el.link && !el.isDeleted) {
                const linkMatch = el.link.match(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/);
                if (linkMatch) {
                    const noteName = linkMatch[1].trim();
                    const section = linkMatch[2];
                    const targetNote = allPosts.find(p => p.title === noteName || p.id === noteName.toLowerCase().replace(/\s+/g, '-'));
                    if (targetNote) {
                        el.embeddedHtml = 'MOCKED_EMBEDDED_HTML';
                    }
                }
            }
        }

        const nonDeletedElements = elements.filter(el => !el.isDeleted);
        const embeddables = nonDeletedElements.filter(el => el.type === 'embeddable');

        // Check if direct-render is bypassed
        if (!isMainDrawPage && embeddables.length > 0) {
            console.log('Would render direct embeddables');
            return;
        }

        let minX = 0, minY = 0, maxX = 100, maxY = 100;
        const padding = 15;
        const width = (maxX - minX) + padding * 2;
        const height = (maxY - minY) + padding * 2;
        const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

        let svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`;

        elements.forEach(el => {
            if (el.isDeleted) return;

            if (el.type === 'embeddable') {
                const stroke = el.strokeColor || '#b8b8b8';
                const rx = 8;

                if (el.embeddedDrawing) {
                    // ...
                } else if (el.embeddedHtml) {
                    const fill = el.backgroundColor === 'transparent' ? '#ffffff' : el.backgroundColor;
                    svgHtml += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.5}" />\n`;
                    
                    let title = 'Embedded Document';
                    let targetUrl = '#';
                    if (el.link) {
                        const linkMatch = el.link.match(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/);
                        if (linkMatch) {
                            const noteName = linkMatch[1];
                            const section = linkMatch[2];
                            title = section || noteName;
                            const noteId = noteName.trim().replace(/\s+/g, '-').toLowerCase();
                            const hashVal = section ? `#${section.trim().replace(/\s+/g, '-').toLowerCase()}` : '';
                            targetUrl = `blog-post.html?id=${noteId}${hashVal}`;
                        }
                    }

                    const showFilename = el.customData?.mdProps?.filenameVisible !== false;
                    
                    svgHtml += `  <foreignObject x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; background: transparent;">
                            ${showFilename ? `
                            <div style="display: flex; align-items: center; justify-content: space-between; height: 36px; min-height: 36px; padding: 0 14px; border-bottom: 1px solid var(--q-lightgray, #e5e5e5); background: var(--q-light, #fafafa); font-size: 13px; font-weight: 600; color: var(--q-dark, #555555); user-select: none; width: 100%; box-sizing: border-box;">
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 85%;">${escapeHtml(title)}</span>
                                <a href="${targetUrl}" target="_parent" style="color: var(--q-link, #0969da); text-decoration: none; display: flex; align-items: center;" title="Open link">
                                    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                        <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5A1.75 1.75 0 0 1 3.75 2Zm7.78 1.03 1.22 1.22-4.25 4.25a.75.75 0 1 0 1.06 1.06l4.25-4.25 1.22 1.22a.25.25 0 0 0 .42-.18V1.75a.25.25 0 0 0-.25-.25h-3.75a.25.25 0 0 0-.18.42Z"></path>
                                    </svg>
                                </a>
                            </div>` : `
                            <a href="${targetUrl}" target="_parent" style="position: absolute; top: 12px; right: 12px; color: var(--q-link, #0969da); text-decoration: none; display: flex; align-items: center; justify-content: center; z-index: 10; width: 22px; height: 22px; background: var(--q-light, rgba(255, 255, 255, 0.85)); border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid var(--q-lightgray, #e5e5e5);" title="Open link">
                                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                    <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5A1.75 1.75 0 0 1 3.75 2Zm7.78 1.03 1.22 1.22-4.25 4.25a.75.75 0 1 0 1.06 1.06l4.25-4.25 1.22 1.22a.25.25 0 0 0 .42-.18V1.75a.25.25 0 0 0-.25-.25h-3.75a.25.25 0 0 0-.18.42Z"></path>
                                </svg>
                            </a>`}
                            <div style="flex: 1; overflow: auto; padding: 20px; font-size: 14px; line-height: 1.6; color: var(--q-dark, #2b2b2b); text-align: left;">
                                ${el.embeddedHtml}
                            </div>
                        </div>
                    </foreignObject>\n`;
                }
            }
        });

        svgHtml += `</svg>`;
        console.log('Render Succeeded!');
    } catch (e) {
        console.error('Render Failed:', e);
    }
}

test();
