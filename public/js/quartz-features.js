/**
 * Quartz-style Search and Graph View Features
 * Based on: https://quartz.jzhao.xyz/
 * Uses PixiJS + D3.js for WebGL-based graph rendering
 */

// ============================================
// GLOBAL MARKDOWN RENDERER (Obsidian compatible)
// ============================================
window.renderMarkdown = function(content, filename = '') {
    try {
        if (!content || typeof content !== 'string') return '';
        if (typeof window.marked !== 'undefined' && typeof window.marked.use === 'function') {
            window.marked.use({ breaks: true, gfm: true });
        }
        let renderedContent = content;

        // Headings: 들여쓰기(공백, 탭)가 있는 heading 기호(#)에서 앞부분 공백을 제거하여 marked가 올바르게 헤더로 렌더링하도록 수정
        renderedContent = renderedContent.replace(/^[ \t]*(#+)[ \t]+(.+)$/gm, '$1 $2');

        // A. Check if the page being rendered is a Canvas file
        if (filename.endsWith('.canvas') || (content.includes('"nodes"') && content.includes('"edges"'))) {
            return `\n\n<iframe src="canvas.html?canvas=${filename}" class="canvas-iframe-embed" style="width: 100%; height: 650px; border: 1.5px solid var(--q-lightgray); border-radius: 8px; display: block; margin: 1.5rem auto; background: var(--q-light);"></iframe>\n\n`;
        }

        // B. Check if the page being rendered is an Excalidraw drawing
        if (filename.includes('excalidraw') || filename.includes('_draw') || content.includes('excalidraw-plugin: raw') || content.includes('"type": "excalidraw"')) {
            const src = `posts/${filename}`;
            return `\n\n<div class="interactive-excalidraw" data-src="${src}" style="width: 100%; height: 650px; border: 1.5px solid var(--q-lightgray); border-radius: 8px; overflow: hidden; position: relative; background: var(--q-light, #ffffff); display: block; margin: 1.5rem auto;">Loading drawing...</div>\n\n`;
        }

        // 1. Convert wikilinks for images/files/canvas: ![[filename.png]], ![[filename.canvas]], or ![[filename.excalidraw]]
        renderedContent = renderedContent.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, file, size) => {
            const fileTrimmed = file.trim();
            
            // Parse filename and hash/frame anchor
            const hashIdx = fileTrimmed.indexOf('#');
            let baseFile = fileTrimmed;
            let hash = '';
            if (hashIdx !== -1) {
                baseFile = fileTrimmed.slice(0, hashIdx).trim();
                hash = fileTrimmed.slice(hashIdx + 1).trim();
            }
            
            const isCanvas = baseFile.endsWith('.canvas');
            const isExcalidraw = baseFile.endsWith('.excalidraw') || baseFile.endsWith('.excalidraw.md') || baseFile.endsWith('_draw.md') || baseFile.endsWith('_draw');
            
            let dir = '';
            if (filename) {
                dir = filename.split('/').slice(0, -1).join('/');
            }
            
            // Resolve URL based on whether baseFile contains path separators
            let src = '';
            if (baseFile.includes('/')) {
                if (baseFile.startsWith('web_blog/')) {
                    src = `posts/${baseFile}`;
                } else {
                    src = `posts/web_blog/${baseFile}`;
                }
            } else {
                src = filename ? `posts/${dir}/${baseFile}` : `posts/${baseFile}`;
            }
            
            if (isCanvas) {
                const canvasPath = baseFile.includes('/') ? 
                    (baseFile.startsWith('web_blog/') ? baseFile : `web_blog/${baseFile}`) :
                    (dir ? `${dir}/${baseFile}` : baseFile);
                return `\n\n<iframe src="canvas.html?canvas=${canvasPath}" class="canvas-iframe-embed" style="width: 100%; height: 500px; border: 1.5px solid var(--q-lightgray); border-radius: 8px; display: block; margin: 1.5rem auto; background: var(--q-light);"></iframe>\n\n`;
            } else {
                if (isExcalidraw) {
                    const cleanHash = hash ? hash.replace(/^\^/, '').replace(/^group=/, '').trim() : '';
                    return `\n\n<div class="interactive-excalidraw" data-src="${src}" data-hash="${cleanHash}" data-size="${size || ''}" style="width: 100%; height: 550px; border: 1.5px solid var(--q-lightgray); border-radius: 8px; overflow: hidden; position: relative; background: var(--q-light, #ffffff); display: block; margin: 1.5rem auto;">Loading drawing...</div>\n\n`;
                }
                const widthStyle = size ? `width: ${size}px; max-width: 100%;` : 'max-width: 100%;';
                return `<img src="${src}" style="${widthStyle}" class="quartz-image" />`;
            }
        });

        // 2. Convert wikilinks for canvas nodes: [[MyCanvas.canvas#^nodeId|Text]] or [[MyCanvas.canvas#nodeId]]
        renderedContent = renderedContent.replace(/\[\[([^\]|#]+)\.canvas#\^?([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, canvasFile, nodeId, text) => {
            const dir = filename ? filename.split('/').slice(0, -1).join('/') : '';
            const canvasPath = canvasFile.trim().includes('/') ? 
                (canvasFile.trim().startsWith('web_blog/') ? `${canvasFile.trim()}.canvas` : `web_blog/${canvasFile.trim()}.canvas`) :
                (dir ? `${dir}/${canvasFile.trim()}.canvas` : `${canvasFile.trim()}.canvas`);
            const label = text || `${canvasFile.trim()} (${nodeId})`;
            return `<a href="canvas.html?canvas=${canvasPath}&node=${nodeId}" target="_blank" class="canvas-link" data-canvas="${canvasPath}" data-node="${nodeId}">${label}</a>`;
        });

        // 3. Convert normal note wikilinks: [[NoteName]] or [[NoteName|Label]]
        renderedContent = renderedContent.replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (match, noteName, header, label) => {
            const noteId = noteName.trim().replace(/\s+/g, '-').toLowerCase();
            const hash = header ? `#${header.trim().replace(/\s+/g, '-').toLowerCase()}` : '';
            const text = label || noteName;
            return `<a href="blog-post.html?id=${noteId}${hash}" class="internal-link">${text}</a>`;
        });

        // 4. Convert Obsidian highlights: ==text== to <mark>text</mark>
        renderedContent = renderedContent.replace(/==([^=]+)==/g, '<mark>$1</mark>');

        // 5. Convert Obsidian Callouts
        let calloutsData = [];

        function renderCalloutHTML(type, title, fold, contentMarkdown) {
            let contentHTML = contentMarkdown;
            try {
                if (typeof window.marked !== 'undefined') {
                    if (typeof window.marked.parse === 'function') {
                        contentHTML = window.marked.parse(contentMarkdown);
                    } else if (typeof window.marked === 'function') {
                        contentHTML = window.marked(contentMarkdown);
                    }
                }
            } catch (e) {
                console.error('Error in marked callout parser:', e);
            }

            let lawLinkHtml = '';
            const lawMatch = title.match(/^([가-힣\s]+)\s+(?:제)?(\d+)조(?:의(\d+))?/);
            if (lawMatch) {
                const lawName = lawMatch[1].trim().replace(/\s+/g, '');
                const main = lawMatch[2];
                const sub = lawMatch[3] ? `의${lawMatch[3]}` : '';
                const article = `제${main}조${sub}`;
                const lawUrl = `https://www.law.go.kr/법령/${lawName}/${article}`;
                
                lawLinkHtml = `
                    <a href="${lawUrl}" target="_blank" class="callout-law-link" title="국가법령정보센터 조문 바로가기">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                `;
            }

            return `
<div class="quartz-callout callout-${type}" data-callout="${type}">
    <div class="callout-title">
        <div class="callout-title-inner">${title}</div>
        ${lawLinkHtml}
    </div>
    <div class="callout-content">
        ${contentHTML}
    </div>
</div>
`;
        }

        function preprocessCallouts(markdown) {
            const lines = markdown.split('\n');
            let inCallout = false;
            let calloutLines = [];
            let calloutType = '';
            let calloutTitle = '';
            let calloutFold = '';
            const result = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.match(/^\s*>\s*\[\!(\w+)([-+])?\]\s*(.*)/);

                if (match) {
                    if (inCallout) {
                        const html = renderCalloutHTML(calloutType, calloutTitle, calloutFold, calloutLines.join('\n'));
                        const placeholder = `<!-- CALLOUT_PLACEHOLDER_${calloutsData.length} -->`;
                        calloutsData.push({ placeholder, html });
                        result.push(placeholder);
                        calloutLines = [];
                    }
                    inCallout = true;
                    calloutType = match[1].toLowerCase();
                    calloutFold = match[2] || '';
                    calloutTitle = match[3].trim() || (calloutType.charAt(0).toUpperCase() + calloutType.slice(1));
                } else if (inCallout) {
                    const hasGreater = line.match(/^\s*>\s?(.*)/);
                    const isBlank = line.trim() === '';
                    const isHeader = line.trim().startsWith('#');

                    if (hasGreater) {
                        calloutLines.push(hasGreater[1]);
                    } else if (!isBlank && !isHeader) {
                        calloutLines.push(line.trim());
                    } else {
                        const html = renderCalloutHTML(calloutType, calloutTitle, calloutFold, calloutLines.join('\n'));
                        const placeholder = `<!-- CALLOUT_PLACEHOLDER_${calloutsData.length} -->`;
                        calloutsData.push({ placeholder, html });
                        result.push(placeholder);
                        inCallout = false;
                        calloutLines = [];
                        result.push(line);
                    }
                } else {
                    result.push(line);
                }
            }
            if (inCallout) {
                const html = renderCalloutHTML(calloutType, calloutTitle, calloutFold, calloutLines.join('\n'));
                const placeholder = `<!-- CALLOUT_PLACEHOLDER_${calloutsData.length} -->`;
                calloutsData.push({ placeholder, html });
                result.push(placeholder);
            }
            return result.join('\n');
        }

        let parsedMarkdown = preprocessCallouts(renderedContent);
        let htmlContent = parsedMarkdown;
        try {
            if (typeof window.marked !== 'undefined') {
                if (typeof window.marked.parse === 'function') {
                    htmlContent = window.marked.parse(parsedMarkdown);
                } else if (typeof window.marked === 'function') {
                    htmlContent = window.marked(parsedMarkdown);
                }
            }
        } catch (e) {
            console.error('Error in marked parser:', e);
        }

        // Replace callout placeholders
        calloutsData.forEach(item => {
            htmlContent = htmlContent.replace(item.placeholder, item.html);
        });

        return htmlContent;
    } catch (e) {
        console.error('Failed to render markdown:', e);
        return content || '';
    }
};

// ============================================
// SEARCH FEATURE - Quartz Style
// ============================================

class QuartzSearch {
    constructor(posts) {
        this.posts = posts;
        this.selectedIndex = 0;
        this.results = [];
        this.overlay = null;
        this.init();
    }

    init() {
        this.createOverlay();
        this.bindKeyboardShortcuts();
    }

    createOverlay() {
        document.getElementById('quartz-search-overlay')?.remove();

        this.overlay = document.createElement('div');
        this.overlay.id = 'quartz-search-overlay';
        this.overlay.className = 'quartz-search-overlay';
        this.overlay.innerHTML = `
            <div class="quartz-search-container" onclick="event.stopPropagation()">
                <div class="quartz-search-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="quartz-search-input" placeholder="Search..." autocomplete="off" />
                    <kbd>ESC</kbd>
                </div>
                <div class="quartz-search-body">
                    <div class="quartz-search-results" id="quartz-search-results">
                        <div class="quartz-search-empty">Start typing to search...</div>
                    </div>
                    <div class="quartz-search-preview" id="quartz-search-preview">
                        <div class="quartz-search-preview-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <p>Select a result to preview</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.overlay.addEventListener('click', () => this.close());
        document.body.appendChild(this.overlay);

        const input = document.getElementById('quartz-search-input');
        input.addEventListener('input', (e) => this.search(e.target.value));
        input.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    handleKeydown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectNext();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectPrev();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.openSelected();
        }
    }

    open() {
        this.overlay.classList.add('active');
        document.getElementById('quartz-search-input').focus();
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        document.getElementById('quartz-search-input').value = '';
        this.results = [];
        this.selectedIndex = 0;
        document.body.style.overflow = '';
    }

    isOpen() {
        return this.overlay.classList.contains('active');
    }

    async search(query) {
        const resultsContainer = document.getElementById('quartz-search-results');
        const previewContainer = document.getElementById('quartz-search-preview');

        if (query.length < 2) {
            resultsContainer.innerHTML = '<div class="quartz-search-empty">Start typing to search...</div>';
            previewContainer.innerHTML = `
                <div class="quartz-search-preview-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <p>Select a result to preview</p>
                </div>
            `;
            return;
        }

        const lowerQuery = query.toLowerCase();
        this.results = [];

        for (const post of this.posts) {
            if (post.id.endsWith('_draw')) continue;
            let score = 0;

            if (post.title.toLowerCase().includes(lowerQuery)) {
                score += 10;
            }

            if (post.tags?.some(t => t.toLowerCase().includes(lowerQuery))) {
                score += 5;
            }

            if (post.content) {
                const contentLower = post.content.toLowerCase();
                if (contentLower.includes(lowerQuery)) {
                    score += 3;
                }
            }

            if (score > 0) {
                this.results.push({ post, score });
            }
        }

        this.results.sort((a, b) => b.score - a.score);
        this.selectedIndex = 0;

        if (this.results.length === 0) {
            resultsContainer.innerHTML = '<div class="quartz-search-empty">No results found</div>';
            previewContainer.innerHTML = `
                <div class="quartz-search-preview-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No matching documents</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = this.results.map((result, i) => `
            <div class="quartz-search-result ${i === this.selectedIndex ? 'selected' : ''}" 
                 data-index="${i}"
                 onclick="quartzSearch.selectAndOpen(${i})">
                <div class="result-title">${this.highlight(result.post.title, query)}</div>
                <div class="result-meta">${result.post.date}</div>
            </div>
        `).join('');

        resultsContainer.querySelectorAll('.quartz-search-result').forEach((el, i) => {
            el.addEventListener('mouseenter', () => {
                this.selectedIndex = i;
                this.updateSelection();
            });
        });

        this.showPreview();
    }

    highlight(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    selectNext() {
        if (this.results.length > 0) {
            this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
            this.updateSelection();
        }
    }

    selectPrev() {
        if (this.results.length > 0) {
            this.selectedIndex = (this.selectedIndex - 1 + this.results.length) % this.results.length;
            this.updateSelection();
        }
    }

    updateSelection() {
        const resultsContainer = document.getElementById('quartz-search-results');
        resultsContainer.querySelectorAll('.quartz-search-result').forEach((el, i) => {
            el.classList.toggle('selected', i === this.selectedIndex);
        });

        const selected = resultsContainer.querySelector('.quartz-search-result.selected');
        if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
        }

        this.showPreview();
    }

    async showPreview() {
        const previewContainer = document.getElementById('quartz-search-preview');
        if (this.results.length === 0 || this.selectedIndex >= this.results.length) return;

        const result = this.results[this.selectedIndex];
        const post = result.post;
        const query = document.getElementById('quartz-search-input').value;

        let content = post.content || '';
        // Remove frontmatter
        content = content.replace(/^---[\s\S]*?---\n?/, '');
        // Remove Logseq properties (key:: value format)
        content = content.split('\n')
            .filter(line => !line.match(/^\s*\w+::/))
            .join('\n');

        // Remove duplicate title (First H1) if it matches post title
        const escapedTitle = this.escapeRegex(post.title);
        // Match # Title at the beginning of the content (after frontmatter removal)
        // We use a looser match for the title content to catch slight variations or just remove first H1
        const titleRegex = new RegExp(`^\\s*#\\s+${escapedTitle}\\s*$`, 'm');
        content = content.replace(titleRegex, '');

        let htmlContent = this.markdownToHtml(content);
        if (query.length >= 2) {
            htmlContent = this.highlight(htmlContent, query);
        }

        previewContainer.innerHTML = `
            <div class="quartz-preview-scroll">
                <div class="quartz-preview-header">
                    <div class="preview-breadcrumb">Home › ${post.title}</div>
                    <div class="preview-meta">
                        <span>${post.date}</span>
                        ${post.tags ? `<span class="preview-tags">${post.tags.map(t => '#' + t).join(' ')}</span>` : ''}
                    </div>
                </div>
                <h1 class="preview-title">${this.highlight(post.title, query)}</h1>
                <div class="preview-content quartz-article-body">${htmlContent}</div>
            </div>
        `;

        if (typeof window.initInteractiveExcalidraw === 'function') {
            window.initInteractiveExcalidraw();
        }
    }

    markdownToHtml(md) {
        if (typeof window.renderMarkdown === 'function') {
            const result = this.results[this.selectedIndex];
            return window.renderMarkdown(md, result && result.post ? result.post.filename : '');
        }

        // Clean up the markdown
        let html = md
            // Remove frontmatter if present (redundant check but safe)
            .replace(/^---[\s\S]*?---\n?/, '')
            // Code blocks (must be before other replacements)
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            // Horizontal rules
            .replace(/^---$/gm, '<hr>')
            .replace(/^\*\*\*$/gm, '<hr>')
            // Headings (allow optional leading whitespace)
            .replace(/^\s*#### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^\s*### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^\s*## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^\s*# (.+)$/gm, '<h1>$1</h1>')
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
            // Bold and Italic (fixed for multiline)
            .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Fix italic collision with bold
            .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
            .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '<em>$1</em>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Images (Obsidian/Wiki style) ![[image.png]]
            // Try to resolve path - simple assumption: link is file path
            .replace(/!\[\[([^\]]+)\]\]/g, '<img src="$1" alt="$1" class="quartz-image" loading="lazy">')
            // Images (Standard)
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
            // Links (Standard)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Wikilinks [[Link]]
            .replace(/\[\[([^\]]+)\]\]/g, '<a class="internal-link">$1</a>')
            // Unordered lists (simple)
            .replace(/^[\s]*[-*+] (.+)$/gm, '<li>$1</li>')
            // Ordered lists
            .replace(/^[\s]*\d+\. (.+)$/gm, '<li>$1</li>');

        // Wrap consecutive <li> items in <ul> or <ol>
        html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');

        // Merge consecutive blockquotes
        html = html.replace(/<\/blockquote>\s*<blockquote>/g, '');

        // Convert remaining newlines to paragraphs
        const blocks = html.split(/\n\n+/);
        html = blocks.map(block => {
            block = block.trim();
            if (!block) return '';
            // Skip if already a block element
            if (block.startsWith('<h') ||
                block.startsWith('<ul') ||
                block.startsWith('<ol') ||
                block.startsWith('<blockquote') ||
                block.startsWith('<pre') ||
                block.startsWith('<hr') ||
                block.startsWith('<img') ||
                block.startsWith('<div')) {
                return block;
            }
            // Wrap in paragraph
            return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        }).join('\n');

        return html;
    }

    selectAndOpen(index) {
        this.selectedIndex = index;
        this.openSelected();
    }

    openSelected() {
        if (this.results.length > 0 && this.selectedIndex < this.results.length) {
            const post = this.results[this.selectedIndex].post;
            window.location.href = `blog-post.html?id=${post.id}`;
        }
    }
}

// ============================================
// GRAPH VIEW - PixiJS + D3.js WebGL Rendering
// ============================================

class QuartzGraphPixi {
    constructor(container, posts, currentPostId = null) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        if (!this.container) return;

        this.posts = posts;
        this.currentPostId = currentPostId;
        this.width = this.container.clientWidth || 280;
        this.height = this.container.clientHeight || 200;
        this.app = null;
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        this.nodeGraphics = [];
        this.linkGraphics = [];
        this.labels = [];
        this.hoveredNodeId = null;
        this.currentTransform = { k: 1, x: 0, y: 0 };
        this.dragging = false;

        this.colors = {
            current: '#84a59d',
            visited: '#7B97AA',
            normal: '#888888',
            link: '#666666',
            linkHover: '#84a59d',
            labelColor: '#e0e0e0'
        };
    }

    initGlobal() {
        this.currentPostId = null;
        return this.init();
    }

    initLocal() {
        if (!this.currentPostId) return this.initGlobal();

        // Filter for local graph (neighbors)
        const connectedIds = new Set([this.currentPostId]);
        this.posts.forEach(post => {
            // Outgoing
            if (post.id === this.currentPostId && post.links) {
                post.links.forEach(l => connectedIds.add(l));
            }
            // Incoming
            if (post.links && post.links.includes(this.currentPostId)) {
                connectedIds.add(post.id);
            }
        });

        // Filter posts to only include connected nodes
        // Create a new array to avoid mutating original posts logic if reused
        this.posts = this.posts.filter(p => connectedIds.has(p.id));
        return this.init();
    }

    async init() {
        // Force dark mode styling for Graph View in all themes (both light and dark modes)
        this.isDark = true;
        
        this.colors = {
            current: '#84a59d',
            visited: '#7B97AA',
            normal: '#ffffff',
            link: '#333336',
            linkHover: '#84a59d',
            labelColor: '#e0e0e0'
        };

        this.prepareData();
        await this.createPixiApp();
        this.createSimulation();
        this.createGraphics();
        this.addZoomDrag();
        this.addGlobalButton();
        this.startAnimation();
    }

    prepareData() {
        const filteredPosts = this.posts.filter(post => !post.id.match(/(_draw|_Draw|_드로우)$/));

        this.nodes = filteredPosts.map(post => ({
            id: post.id,
            title: post.title,
            isCurrent: post.id === this.currentPostId,
            x: this.width / 2 + (Math.random() - 0.5) * 50,
            y: this.height / 2 + (Math.random() - 0.5) * 50
        }));

        this.links = [];
        this.posts.forEach(post => {
            const sourceId = post.id.replace(/(_draw|_Draw|_드로우)$/, '');
            if (post.links) {
                post.links.forEach(targetRaw => {
                    const targetId = targetRaw.split('#')[0].replace(/(_draw|_Draw|_드로우)$/, '');
                    if (sourceId !== targetId && this.nodes.find(n => n.id === targetId) && this.nodes.find(n => n.id === sourceId)) {
                        const linkExists = this.links.some(l => 
                            (l.source === sourceId && l.target === targetId) ||
                            (l.source === targetId && l.target === sourceId)
                        );
                        if (!linkExists) {
                            this.links.push({ source: sourceId, target: targetId });
                        }
                    }
                });
            }
        });
    }

    async createPixiApp() {
        this.container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'quartz-graph-wrapper';
        wrapper.style.cssText = 'position: relative; width: 100%; height: 100%;';
        this.container.appendChild(wrapper);

        // Check if PIXI is available
        if (typeof PIXI === 'undefined') {
            console.warn('PixiJS not loaded, falling back to SVG');
            this.useSVGFallback(wrapper);
            return;
        }

        try {
            this.app = new PIXI.Application();
            await this.app.init({
                width: this.width,
                height: this.height,
                antialias: true,
                backgroundAlpha: 0,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });

            wrapper.appendChild(this.app.canvas);
            this.app.canvas.style.borderRadius = '8px';
            this.app.canvas.style.background = this.isDark ? '#1e1e20' : '#ffffff';

            // Create containers
            this.linkContainer = new PIXI.Container();
            this.nodeContainer = new PIXI.Container();
            this.labelContainer = new PIXI.Container();

            this.app.stage.addChild(this.linkContainer);
            this.app.stage.addChild(this.nodeContainer);
            this.app.stage.addChild(this.labelContainer);
        } catch (error) {
            console.warn('PixiJS initialization failed, falling back to SVG:', error);
            this.useSVGFallback(wrapper);
        }
    }

    useSVGFallback(wrapper) {
        // SVG fallback for older browsers
        this.isSVGMode = true;
        const svg = d3.select(wrapper)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .style('background', this.isDark ? '#1e1e20' : '#ffffff')
            .style('border-radius', '8px');

        this.svgGroup = svg.append('g');
        this.linkGroup = this.svgGroup.append('g');
        this.nodeGroup = this.svgGroup.append('g');
    }

    createSimulation() {
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(50)
                .strength(0.5))
            .force('charge', d3.forceManyBody().strength(-80))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(12));
    }

    createGraphics() {
        if (this.isSVGMode) {
            this.createSVGGraphics();
            return;
        }

        // Create link graphics
        this.links.forEach(link => {
            const gfx = new PIXI.Graphics();
            this.linkContainer.addChild(gfx);
            this.linkGraphics.push({ link, gfx });
        });

        // Create node graphics
        this.nodes.forEach(node => {
            const radius = node.isCurrent ? 7 : 4;
            const gfx = new PIXI.Graphics();
            
            if (this.isDark) {
                // Glow colors (stars shine bright white/silver, current has a sage-greenish star flare)
                const glowColor = node.isCurrent ? '#84a59d' : '#ffffff';
                const coreColor = '#ffffff';

                // Outer soft halo
                gfx.circle(0, 0, radius * 3.0);
                gfx.fill({ color: glowColor, alpha: 0.15 });

                // Inner tighter halo
                gfx.circle(0, 0, radius * 1.8);
                gfx.fill({ color: glowColor, alpha: 0.35 });

                // Core star
                gfx.circle(0, 0, radius);
                gfx.fill(coreColor);
            } else {
                // Light mode: Clean solid dark-accent node cores
                const color = node.isCurrent ? this.colors.current : this.colors.normal;
                gfx.circle(0, 0, radius);
                gfx.fill(color);
            }
            gfx.eventMode = 'static';
            gfx.cursor = 'pointer';

            gfx.on('pointerover', () => this.onNodeHover(node));
            gfx.on('pointerout', () => this.onNodeOut());
            gfx.on('pointerdown', (e) => this.onNodeDragStart(e, node));
            gfx.on('click', () => this.onNodeClick(node));

            this.nodeContainer.addChild(gfx);

            // Create label
            const displayTitle = node.title.replace(/(_draw|_Draw|_드로우)$/, '');
            const label = new PIXI.Text({
                text: displayTitle.length > 12 ? displayTitle.slice(0, 12) + '...' : displayTitle,
                style: {
                    fontSize: 10,
                    fill: this.colors.labelColor,
                    fontFamily: 'system-ui, sans-serif'
                }
            });
            label.anchor.set(0.5, -0.5);
            label.alpha = 0.8;
            this.labelContainer.addChild(label);

            this.nodeGraphics.push({ node, gfx, label });
        });
    }

    createSVGGraphics() {
        // SVG Links
        this.linkGroup.selectAll('line')
            .data(this.links)
            .enter()
            .append('line')
            .style('stroke', this.colors.link)
            .style('stroke-opacity', 0.4);

        // SVG Nodes
        const nodeGroups = this.nodeGroup.selectAll('g')
            .data(this.nodes)
            .enter()
            .append('g')
            .style('cursor', 'pointer')
            .on('click', (e, d) => this.onNodeClick(d));

        nodeGroups.append('circle')
            .attr('r', d => d.isCurrent ? 7 : 4)
            .style('fill', d => d.isCurrent ? this.colors.current : this.colors.normal);

        this.simulation.on('tick', () => {
            this.linkGroup.selectAll('line')
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodeGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);
        });
    }

    onNodeHover(node) {
        this.hoveredNodeId = node.id;
        this.updateHighlight();
    }

    onNodeOut() {
        this.hoveredNodeId = null;
        this.updateHighlight();
    }

    onNodeClick(node) {
        window.location.href = `blog-post.html?id=${node.id}`;
    }

    onNodeDragStart(e, node) {
        this.dragging = true;
        this.simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;

        const onMove = (e) => {
            const pos = e.global;
            const scale = this.currentTransform.k;
            node.fx = (pos.x - this.currentTransform.x) / scale;
            node.fy = (pos.y - this.currentTransform.y) / scale;
        };

        const onEnd = () => {
            this.dragging = false;
            this.simulation.alphaTarget(0);
            node.fx = null;
            node.fy = null;
            this.app.stage.off('pointermove', onMove);
            this.app.stage.off('pointerup', onEnd);
            this.app.stage.off('pointerupoutside', onEnd);
        };

        this.app.stage.on('pointermove', onMove);
        this.app.stage.on('pointerup', onEnd);
        this.app.stage.on('pointerupoutside', onEnd);
    }

    updateHighlight() {
        if (this.isSVGMode) return;

        const connectedIds = new Set();
        if (this.hoveredNodeId) {
            connectedIds.add(this.hoveredNodeId);
            this.links.forEach(link => {
                const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                if (srcId === this.hoveredNodeId) connectedIds.add(tgtId);
                if (tgtId === this.hoveredNodeId) connectedIds.add(srcId);
            });
        }

        // Update nodes and labels
        this.nodeGraphics.forEach(({ node, gfx, label }) => {
            if (this.hoveredNodeId) {
                const isConnected = connectedIds.has(node.id);
                gfx.alpha = isConnected ? 1 : 0.2;
                label.alpha = isConnected ? 1 : 0.2;
            } else {
                gfx.alpha = 1;
                label.alpha = 0.8;
            }
        });

        // Update links
        this.linkGraphics.forEach(({ link, gfx }) => {
            const srcId = typeof link.source === 'object' ? link.source.id : link.source;
            const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

            if (this.hoveredNodeId) {
                const isConnected = srcId === this.hoveredNodeId || tgtId === this.hoveredNodeId;
                link._alpha = isConnected ? 1 : 0.1;
                link._color = isConnected ? this.colors.linkHover : this.colors.link;
            } else {
                link._alpha = 0.4;
                link._color = this.colors.link;
            }
        });
    }

    addZoomDrag() {
        if (this.isSVGMode || !this.app) return;

        const canvas = this.app.canvas;

        // Zoom with wheel
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(0.3, Math.min(5, this.currentTransform.k * scaleFactor));

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.currentTransform.x = mouseX - (mouseX - this.currentTransform.x) * (newScale / this.currentTransform.k);
            this.currentTransform.y = mouseY - (mouseY - this.currentTransform.y) * (newScale / this.currentTransform.k);
            this.currentTransform.k = newScale;

            this.applyTransform();
        });

        // Pan
        let isPanning = false;
        let lastPos = { x: 0, y: 0 };

        canvas.addEventListener('pointerdown', (e) => {
            if (e.button === 0 && !this.dragging) {
                isPanning = true;
                lastPos = { x: e.clientX, y: e.clientY };
            }
        });

        canvas.addEventListener('pointermove', (e) => {
            if (isPanning && !this.dragging) {
                this.currentTransform.x += e.clientX - lastPos.x;
                this.currentTransform.y += e.clientY - lastPos.y;
                lastPos = { x: e.clientX, y: e.clientY };
                this.applyTransform();
            }
        });

        canvas.addEventListener('pointerup', () => { isPanning = false; });
        canvas.addEventListener('pointerleave', () => { isPanning = false; });
    }

    applyTransform() {
        if (!this.app) return;

        // Clamp scale
        const minScale = 0.5;
        const maxScale = 5;
        this.currentTransform.k = Math.max(minScale, Math.min(this.currentTransform.k, maxScale));

        // Clamp translation to keep graph mostly in view
        const margin = 100 * this.currentTransform.k;
        const width = this.width;
        const height = this.height;

        this.currentTransform.x = Math.max(-width * this.currentTransform.k + margin, Math.min(this.currentTransform.x, width - margin));
        this.currentTransform.y = Math.max(-height * this.currentTransform.k + margin, Math.min(this.currentTransform.y, height - margin));

        this.app.stage.scale.set(this.currentTransform.k);
        this.app.stage.position.set(this.currentTransform.x, this.currentTransform.y);
    }

    startAnimation() {
        if (this.isSVGMode) return;

        const animate = () => {
            if (!this.app) return;

            // Update link positions
            this.linkGraphics.forEach(({ link, gfx }) => {
                const src = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                const tgt = typeof link.target === 'object' ? link.target : this.nodes.find(n => n.id === link.target);

                if (src && tgt && src.x !== undefined && tgt.x !== undefined) {
                    gfx.clear();
                    gfx.moveTo(src.x, src.y);
                    gfx.lineTo(tgt.x, tgt.y);
                    gfx.stroke({ width: 1, color: link._color || this.colors.link, alpha: link._alpha || 0.4 });
                }
            });

            // Update node positions
            this.nodeGraphics.forEach(({ node, gfx, label }) => {
                if (node.x !== undefined && node.y !== undefined) {
                    gfx.position.set(node.x, node.y);
                    label.position.set(node.x, node.y);
                }
            });

            requestAnimationFrame(animate);
        };

        this.simulation.on('tick', () => { });
        requestAnimationFrame(animate);
    }

    addGlobalButton() {
        // Do not add the global button if we are already inside the global graph container (fullscreen mode)
        if (this.container.closest('.quartz-global-graph-container')) return;

        const wrapper = this.container.querySelector('.quartz-graph-wrapper');
        if (!wrapper) return;

        const button = document.createElement('button');
        button.className = 'quartz-graph-global-btn';
        button.title = 'Open full graph view';
        button.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
            </svg>
        `;
        button.addEventListener('click', () => this.openGlobalGraph());
        wrapper.appendChild(button);
    }

    openGlobalGraph() {
        const overlay = document.createElement('div');
        overlay.className = 'quartz-global-graph-overlay';
        overlay.innerHTML = `
            <div class="quartz-global-graph-container">
                <div class="global-graph-header">
                    <h3>Global Graph View</h3>
                    <button class="global-graph-close" id="close-global-graph">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="global-graph-canvas" id="global-graph-canvas"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        document.getElementById('close-global-graph').addEventListener('click', () => overlay.remove());
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // Use requestAnimationFrame to ensure DOM is ready and layout is calculated
        requestAnimationFrame(() => {
            const canvas = document.getElementById('global-graph-canvas');
            if (canvas) {
                // Ensure the container has explicit dimensions before init
                const rect = canvas.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                }

                // Initialize with Global Graph settings
                const graph = new QuartzGraphPixi(canvas, this.posts, null);

                // Override init to ensure it starts with optimal zoom for global view
                graph.initGlobal().then(() => {
                    // Center the graph after a short delay to allow simulation to settle
                    setTimeout(() => {
                        graph.currentTransform = { k: 0.8, x: graph.width / 2, y: graph.height / 2 };
                        graph.applyTransform();

                        // Re-center logic
                        graph.currentTransform.x = (graph.width - graph.width * graph.currentTransform.k) / 2;
                        graph.currentTransform.y = (graph.height - graph.height * graph.currentTransform.k) / 2;
                        graph.applyTransform();
                    }, 100);
                });
            }
        });
    }

    destroy() {
        if (this.simulation) this.simulation.stop();
        if (this.app) this.app.destroy(true);
    }
}

// ============================================
// STYLES
// ============================================

const quartzFeaturesStyles = `
/* Search Overlay */
.quartz-search-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 5vh;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
}

.quartz-search-overlay.active {
    opacity: 1;
    visibility: visible;
}

.quartz-search-container {
    width: 95%;
    max-width: 1200px;
    height: 85vh;
    max-height: 800px;
    background: var(--q-light);
    border: 1px solid var(--q-lightgray);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.quartz-search-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--q-lightgray);
    background: var(--q-light);
    flex-shrink: 0;
}

.quartz-search-header svg {
    color: var(--q-gray);
    flex-shrink: 0;
}

#quartz-search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    color: var(--q-dark);
    outline: none;
    font-family: var(--q-font-header);
}

#quartz-search-input::placeholder {
    color: var(--q-gray);
}

.quartz-search-header kbd {
    padding: 0.25rem 0.5rem;
    background: var(--q-lightgray);
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: var(--q-font-code);
    color: var(--q-darkgray);
}

.quartz-search-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.quartz-search-results {
    width: 32%;
    min-width: 280px;
    border-right: 1px solid var(--q-lightgray);
    overflow-y: auto;
    background: var(--q-light);
    scrollbar-width: thin;
    scrollbar-color: var(--q-gray) var(--q-lightgray);
}

.quartz-search-results::-webkit-scrollbar {
    width: 8px;
}

.quartz-search-results::-webkit-scrollbar-track {
    background: var(--q-light);
}

.quartz-search-results::-webkit-scrollbar-thumb {
    background: var(--q-lightgray);
    border-radius: 4px;
}

.quartz-search-preview {
    width: 68%;
    overflow: hidden;
    background: var(--q-light);
    display: flex;
    flex-direction: column;
}

.quartz-preview-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--q-gray) var(--q-lightgray);
}

.quartz-preview-scroll::-webkit-scrollbar {
    width: 8px;
}

.quartz-preview-scroll::-webkit-scrollbar-track {
    background: var(--q-light);
}

.quartz-preview-scroll::-webkit-scrollbar-thumb {
    background: var(--q-lightgray);
    border-radius: 4px;
}

.quartz-search-empty {
    padding: 2rem;
    text-align: center;
    color: var(--q-gray);
}

.quartz-search-result {
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.15s;
}

.quartz-search-result:hover,
.quartz-search-result.selected {
    background: var(--q-highlight);
    border-left-color: var(--q-dark);
}

.quartz-search-result .result-title {
    font-weight: 600;
    color: var(--q-dark);
    margin-bottom: 0.25rem;
    font-family: var(--q-font-header);
}

.quartz-search-result .result-meta {
    font-size: 0.8rem;
    color: var(--q-darkgray);
    opacity: 0.8;
}

.quartz-search-result mark,
.quartz-search-preview mark {
    background: var(--q-text-highlight);
    color: inherit;
    padding: 0 2px;
    border-radius: 2px;
}

.quartz-search-preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--q-gray);
}

.quartz-search-preview-empty svg {
    margin-bottom: 1rem;
}

.quartz-preview-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--q-lightgray);
}

.preview-breadcrumb {
    font-size: 0.8rem;
    color: var(--q-gray);
    margin-bottom: 0.5rem;
}

.preview-meta {
    font-size: 0.85rem;
    color: var(--q-darkgray);
    opacity: 0.8;
    display: flex;
    gap: 1rem;
}

.preview-tags {
    color: var(--q-secondary);
}

.preview-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--q-dark);
    margin: 0 0 1.5rem 0;
    line-height: 1.3;
    font-family: var(--q-font-header);
}

.preview-content {
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--q-dark);
    font-family: var(--q-font-body);
}

/* Headings - Blog Style */
.preview-content h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--q-dark);
    margin: 2rem 0 1rem 0;
    line-height: 1.3;
    border-bottom: 1px solid var(--q-lightgray);
    padding-bottom: 0.5rem;
    font-family: var(--q-font-header);
}

.preview-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--q-dark);
    margin: 1.75rem 0 0.75rem 0;
    line-height: 1.4;
    font-family: var(--q-font-header);
}

.preview-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--q-dark);
    margin: 1.5rem 0 0.5rem 0;
    font-family: var(--q-font-header);
}

.preview-content h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--q-darkgray);
    margin: 1.25rem 0 0.5rem 0;
    font-family: var(--q-font-header);
}

/* Paragraphs */
.preview-content p {
    margin: 0 0 1.25rem 0;
    text-align: justify;
    word-break: keep-all;
}

/* Lists - Blog Style */
.preview-content ul,
.preview-content ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.preview-content li {
    margin-bottom: 0.5rem;
    line-height: 1.7;
}

.preview-content li::marker {
    color: var(--q-secondary);
}

/* Blockquote - Blog Style */
.preview-content blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.25rem;
    border-left: 4px solid var(--q-secondary);
    background: var(--q-highlight);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: var(--q-darkgray);
}

.preview-content blockquote p {
    margin: 0;
}

/* Code - Blog Style */
.preview-content code {
    background: var(--q-lightgray);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: var(--q-font-code);
    color: var(--q-tertiary);
}

.preview-content pre {
    background: var(--q-light);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.25rem 0;
    border: 1px solid var(--q-lightgray);
}

.preview-content pre code {
    background: none;
    padding: 0;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--q-dark);
}

/* Links - Blog Style */
.preview-content a {
    color: var(--q-secondary);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
}

.preview-content a:hover {
    text-decoration: underline;
}

/* Internal Links (Wikilinks) */
.preview-content .internal-link {
    color: var(--q-tertiary);
    background: rgba(132, 165, 157, 0.1);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
}

/* Images */
.preview-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
}

/* Horizontal Rule */
.preview-content hr {
    border: none;
    border-top: 1px solid var(--q-lightgray);
    margin: 2rem 0;
}

/* Strong and Em */
.preview-content strong {
    font-weight: 600;
    color: var(--q-dark);
}

.preview-content em {
    font-style: italic;
    color: var(--q-darkgray);
}

/* Graph */
.quartz-graph-global-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border: none;
    background: var(--q-lightgray);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--q-darkgray);
    transition: all 0.2s;
    z-index: 10;
}

.quartz-graph-global-btn:hover {
    background: var(--q-dark);
    color: var(--q-light);
}

.quartz-global-graph-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.quartz-global-graph-container {
    width: 90%;
    height: 85%;
    background: var(--q-light);
    border: 1px solid var(--q-lightgray);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.global-graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--q-lightgray);
    flex-shrink: 0;
    background: var(--q-light);
}

.global-graph-header h3 {
    margin: 0;
    color: var(--q-dark);
    font-family: var(--q-font-header);
}

.global-graph-close {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--q-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.global-graph-close:hover {
    background: var(--q-lightgray);
    color: var(--q-dark);
}

.global-graph-canvas {
    flex: 1;
    background: var(--q-light);
}

.quartz-graph-container {
    height: 200px;
    position: relative;
    background: var(--q-light);
    border-radius: 8px;
}

@media (max-width: 768px) {
    .quartz-search-container { width: 95%; height: 90vh; }
    .quartz-search-body { flex-direction: column; }
    .quartz-search-results { width: 100%; height: 40%; border-right: none; border-bottom: 1px solid var(--q-lightgray); }
    .quartz-search-preview { width: 100%; height: 60%; }
}

/* Aggressive global focus and active outline reset to eliminate light blue focus borders */
*:focus,
*:active,
*:focus-visible,
:focus,
:active,
:focus-visible,
a,
a:focus,
a:active,
a:focus-visible,
button,
button:focus,
button:active,
button:focus-visible,
input,
input:focus,
input:active,
input:focus-visible,
[role="button"],
[role="button"]:focus,
[role="button"]:active,
[role="button"]:focus-visible,
.toc-header,
.toc-header:focus,
.toc-header:active,
.toc-header:focus-visible,
#toc-toggle,
#toc-toggle:focus,
#toc-toggle:active,
#toc-toggle:focus-visible,
.quartz-theme-toggle,
.quartz-theme-toggle:focus,
.quartz-theme-toggle:active,
.quartz-theme-toggle:focus-visible,
#theme-toggle-btn,
#theme-toggle-btn:focus,
#theme-toggle-btn:active,
#theme-toggle-btn:focus-visible,
#draw-mode-btn,
#draw-mode-btn:focus,
#draw-mode-btn:active,
#draw-mode-btn:focus-visible,
.toc-content a,
.toc-content a:focus,
.toc-content a:active,
.toc-content a:focus-visible,
ul.toc-content li a,
ul.toc-content li a:focus,
ul.toc-content li a:active,
ul.toc-content li a:focus-visible {
    outline: none !important;
    outline-width: 0 !important;
    outline-color: transparent !important;
    box-shadow: none !important;
    -webkit-tap-highlight-color: transparent !important;
}

/* Active TOC items highlighting */
ul.toc-content li a.in-view {
    color: #000000 !important;
    opacity: 1 !important;
    font-weight: 700 !important;
    border-left: 3px solid var(--q-dark) !important;
    padding-left: 0.5rem !important;
}

.dark-mode ul.toc-content li a.in-view,
:root[saved-theme="dark"] ul.toc-content li a.in-view {
    color: #ffffff !important; /* Pure white highlight */
    font-weight: 700 !important;
    opacity: 1 !important;
    border-left: 3px solid #ffffff !important; /* Pure white vertical line */
    padding-left: 0.5rem !important;
}

@media (max-width: 800px) {
    .quartz-theme-toggle {
        min-height: 0 !important;
        min-width: 0 !important;
        padding: 0.5rem 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
    }
    
    .quartz-theme-toggle span {
        font-size: 0.9rem !important;
    }
    
    .excalidraw-btn {
        min-height: 0 !important;
        min-width: 0 !important;
        padding: 0 !important;
        width: 32px !important;
        height: 32px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1 !important;
    }

    .excalidraw-btn svg {
        display: block !important;
        margin: 0 !important;
        flex-shrink: 0 !important;
    }
}

/* Bulletproof theme toggle SVG display rules */
#theme-toggle-btn svg {
    display: none !important;
}
#theme-toggle-btn svg[style*="display: inline"],
#theme-toggle-btn svg[style*="display:inline"] {
    display: block !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
}
#draw-mode-btn svg {
    display: block !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
}
`;

function injectQuartzStyles() {
    if (!document.getElementById('quartz-features-styles')) {
        const style = document.createElement('style');
        style.id = 'quartz-features-styles';
        style.textContent = quartzFeaturesStyles;
        document.head.appendChild(style);
    }
}

// ============================================
// TOC & BACKLINKS
// ============================================

class QuartzTOC {
    constructor() {
        this.container = document.getElementById('toc-list');
        this.tocSection = document.getElementById('toc-section');
        this.isScrolling = false;
        this.scrollTimeout = null;
    }

    init() {
        if (!this.container) return;

        const headers = document.querySelectorAll('.quartz-article-body h1, .quartz-article-body h2, .quartz-article-body h3, .quartz-article-body h4, .quartz-article-body h5, .quartz-article-body h6');

        if (headers.length === 0) {
            if (this.tocSection) this.tocSection.style.display = 'none';
            return;
        }

        if (this.tocSection) this.tocSection.style.display = 'block';

        let html = '';
        headers.forEach((header, index) => {
            if (!header.id) {
                header.id = `header-${header.innerText.toLowerCase().replace(/\s+/g, '-').replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣-]/g, '') || index}`;
            }

            const level = parseInt(header.tagName.substring(1));
            const text = header.innerText;
            const id = header.id;

            html += `<li class="toc-depth-${level}"><a href="#${id}" data-for="${id}">${text}</a></li>`;
        });

        this.container.innerHTML = html;
        this.setupObserver(headers);

        // Click listener for smooth scroll and flash highlight
        this.container.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            e.preventDefault();
            const targetId = link.getAttribute('data-for');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                // Set scrolling flag to prevent observer from overriding active state
                this.isScrolling = true;
                if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

                const offset = 100; // Offset for fixed header
                const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Remove highlight from any other elements
                document.querySelectorAll('.quartz-article-body *').forEach(el => el.classList.remove('header-flash'));
                
                // Add highlight class
                targetEl.classList.add('header-flash');
                
                // Update active link in TOC manually on click
                this.container.querySelectorAll('a').forEach(a => a.classList.remove('in-view'));
                link.classList.add('in-view');
                
                // Remove the flash class after animation ends (e.g. 2s)
                setTimeout(() => {
                    targetEl.classList.remove('header-flash');
                }, 2000);

                // Update URL hash without jumping
                history.pushState(null, null, `#${targetId}`);

                // Reset scrolling flag after scrolling finishes (approx 800ms)
                this.scrollTimeout = setTimeout(() => {
                    this.isScrolling = false;
                }, 1000);
            }
        });
    }

    setupObserver(headers) {
        const updateActiveTOC = () => {
            if (this.isScrolling) return;
            
            let activeHeader = null;
            const scrollPosition = window.scrollY + 120; // 120px offset to match header and scroll-margin
            
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const headerTop = header.getBoundingClientRect().top + window.scrollY;
                
                if (scrollPosition >= headerTop) {
                    activeHeader = header;
                } else {
                    break;
                }
            }
            
            // Highlight the first header if scroll is above the first header
            if (!activeHeader && headers.length > 0) {
                activeHeader = headers[0];
            }
            
            if (activeHeader) {
                const id = activeHeader.id;
                const link = this.container.querySelector(`a[data-for="${id}"]`);
                if (link) {
                    this.container.querySelectorAll('a').forEach(a => a.classList.remove('in-view'));
                    link.classList.add('in-view');
                }
            }
        };

        window.addEventListener('scroll', updateActiveTOC, { passive: true });
        window.addEventListener('resize', updateActiveTOC, { passive: true });
        
        // Initial trigger
        setTimeout(updateActiveTOC, 100);
    }
}

class QuartzBacklinks {
    constructor(posts, currentPostId) {
        this.posts = posts;
        this.currentPostId = currentPostId;
        this.container = document.getElementById('backlinks-list');
        this.section = document.getElementById('post-backlinks');
        this.emptyMsg = document.getElementById('backlinks-empty');
    }

    init() {
        if (!this.container || !this.currentPostId) return;

        const backlinks = this.findBacklinks();

        if (backlinks.length > 0) {
            if (this.section) this.section.style.display = 'block';
            this.container.innerHTML = backlinks.map(post =>
                `<li>
                    <a href="blog-post.html?id=${post.id}" class="internal-link">
                        <span style="font-weight: 500; font-size: 0.95em;">${post.title}</span>
                    </a>
                 </li>`
            ).join('');
        } else {
            if (this.section) this.section.style.display = 'none';
        }
    }

    findBacklinks() {
        // Find posts that link to the current post
        const currentPost = this.posts.find(p => p.id === this.currentPostId);
        if (!currentPost) return [];

        const title = currentPost.title;
        const id = currentPost.id; // e.g. "2026_01_17" or slug

        return this.posts.filter(post => {
            if (post.id === this.currentPostId) return false;

            const content = post.content || '';

            // Check for various link formats:
            // 1. [[Title]]
            // 2. [[ID]]
            // 3. (blog-post.html?id=ID)

            const hasWikiLinkTitle = content.includes(`[[${title}]]`);
            const hasWikiLinkID = content.includes(`[[${id}]]`);
            const hasStandardLink = content.includes(`id=${id}`);

            return hasWikiLinkTitle || hasWikiLinkID || hasStandardLink;
        });
    }
}

// ============================================
// HOVER PREVIEW
// ============================================

class QuartzHoverPreview {
    constructor(posts) {
        this.posts = posts;
        this.previewEl = null;
        this.isVisible = false;
        this.showTimer = null;
        this.hideTimer = null;
    }

    init() {
        // Create preview element
        this.previewEl = document.createElement('div');
        this.previewEl.className = 'quartz-hover-preview';
        this.previewEl.style.cssText = `
            position: fixed;
            display: none;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: auto; /* Enable interaction */
        `;
        document.body.appendChild(this.previewEl);

        // Allow entering the preview without hiding it
        this.previewEl.addEventListener('mouseenter', () => {
            if (this.hideTimer) clearTimeout(this.hideTimer);
        });

        this.previewEl.addEventListener('mouseleave', () => {
            this.hide();
        });

        this.attach();
    }

    attach() {
        const attachToElements = () => {
            const titles = document.querySelectorAll('.quartz-post-item-title, .quartz-explorer-item a, .quartz-backlinks-list a');
            titles.forEach(el => {
                if (el.dataset.hoverAttached) return;
                el.dataset.hoverAttached = 'true';

                el.addEventListener('mouseenter', (e) => this.onHover(e, el));
                el.addEventListener('mouseleave', () => this.onLeave());
            });
        };

        attachToElements();
        setInterval(attachToElements, 1000);
    }

    onHover(e, el) {
        if (this.hideTimer) clearTimeout(this.hideTimer);

        // If already visible and hovering over the same element, do nothing to prevent jumping
        // But if we moved to a new link, we might want to update.
        // For now, let's keep it simple: if visible, we don't move it unless it's a new link?
        // Actually, to support scrolling, we MUST NOT update position if it's already visible.

        let target = el;
        if (target.tagName !== 'A') target = target.closest('a');
        if (!target) return;

        const href = target.getAttribute('href');
        if (!href || !href.includes('id=')) return;

        const id = href.split('id=')[1];
        const post = this.posts.find(p => p.id === id);

        if (post) {
            // If we are already showing this post, do nothing (preserve scroll/position)
            if (this.isVisible && this.previewEl.dataset.currentPostId === id) {
                return;
            }

            // Position near cursor once
            const x = e.clientX;
            const y = e.clientY;

            // Shorten delay for responsiveness
            this.showTimer = setTimeout(() => this.show(x, y, post), 300);
        }
    }

    onLeave() {
        if (this.showTimer) clearTimeout(this.showTimer);
        // Delay hiding to allow moving mouse into preview
        this.hideTimer = setTimeout(() => this.hide(), 300);
    }

    show(x, y, post) {
        if (!this.previewEl) return;

        // Store current post ID
        this.previewEl.dataset.currentPostId = post.id;

        const search = window.quartzSearch || new QuartzSearch([], []);
        let html = search.markdownToHtml(post.content);

        // Remove title from content if present (h1)
        const escapedTitle = post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const titleRegex = new RegExp(`^\\s*<h1[^>]*>${escapedTitle}<\\/h1>`, 'i');
        html = html.replace(titleRegex, '');

        this.previewEl.innerHTML = `
            <div class="quartz-preview-content-inner">
                <div class="quartz-preview-meta">${post.date}</div>
                <h3 class="quartz-preview-title">${post.title}</h3>
                <div class="quartz-article-body" style="font-size: 0.9em; overflow-wrap: break-word;">${html}</div>
            </div>
        `;

        this.previewEl.style.display = 'block';

        if (typeof window.initInteractiveExcalidraw === 'function') {
            window.initInteractiveExcalidraw();
        }

        // Calculate position based on mouse X Y but keep it fixed once shown
        this.position(x, y);

        // Force reflow
        this.previewEl.offsetHeight;
        this.previewEl.style.opacity = '1';
        this.isVisible = true;
    }

    hide() {
        if (!this.previewEl) return;
        this.previewEl.style.opacity = '0';
        this.isVisible = false;
        this.previewEl.dataset.currentPostId = ''; // Clear ID
        setTimeout(() => {
            if (!this.isVisible) this.previewEl.style.display = 'none';
        }, 200);
    }

    position(x, y) {
        if (!this.previewEl) return;

        const offset = 15;
        let left = x + offset;
        let top = y + offset;

        const rect = this.previewEl.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Smart positioning to keep within viewport
        if (left + rect.width > winW) {
            left = x - rect.width - offset;
        }

        if (top + rect.height > winH) {
            // If it goes below viewport, flip it up
            top = y - rect.height - offset;
        }

        if (top < 0) top = offset; // Hard limit top
        if (left < 0) left = offset; // Hard limit left

        this.previewEl.style.left = `${left}px`;
        this.previewEl.style.top = `${top}px`;
    }
}

// Global initialization function
window.initQuartzFeatures = function (posts, currentPostId = null) {
    injectQuartzStyles();

    // 1. Search Feature
    if (!window.quartzSearch) {
        window.quartzSearch = new QuartzSearch(posts);
    } else {
        window.quartzSearch.posts = posts; // Update posts if re-initialized
    }

    // 2. Data for Graph and others
    // For the graph on list page, we might not have a currentPostId

    // 3. Graph View
    // Try both small sidebar container and big global container if they exist
    const sidebarGraphContainer = document.getElementById('graph-container');
    if (sidebarGraphContainer) {
        // If on blog post page, local graph (neighbors). If on list page, global graph.
        if (currentPostId) {
            new QuartzGraphPixi(sidebarGraphContainer, posts, currentPostId).initLocal();
        } else {
            new QuartzGraphPixi(sidebarGraphContainer, posts).initGlobal();
        }
    }

    // 4. Hover Preview
    if (!window.quartzHover) {
        window.quartzHover = new QuartzHoverPreview(posts);
        window.quartzHover.init();
    } else {
        window.quartzHover.posts = posts;
    }

    // 4. TOC (Only for single post)
    if (currentPostId) {
        new QuartzTOC().init();
        new QuartzBacklinks(posts, currentPostId).init();
    }

    // 5. Render Inline Canvas Embeds
    initCanvasInlineEmbeds();
};

async function initCanvasInlineEmbeds() {
    const embeds = document.querySelectorAll('.canvas-inline-embed');
    for (const embed of embeds) {
        if (embed.dataset.rendered) continue;
        embed.dataset.rendered = 'true';
        
        const canvasUrl = embed.dataset.canvas;
        try {
            const res = await fetch(`${canvasUrl}?t=${Date.now()}`);
            const data = await res.json();
            
            if (!data.nodes || data.nodes.length === 0) continue;
            
            // Calculate bounds
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
            
            data.nodes.forEach(node => {
                minX = Math.min(minX, node.x);
                minY = Math.min(minY, node.y);
                maxX = Math.max(maxX, node.x + node.width);
                maxY = Math.max(maxY, node.y + node.height);
            });
            
            const padding = 20;
            const width = (maxX - minX) + padding * 2;
            const height = (maxY - minY) + padding * 2;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'canvas-inline-wrapper';
            wrapper.style.cssText = 'width: 100%; overflow-x: auto; padding: 1.5rem 0; display: flex; justify-content: center; box-sizing: border-box;';
            
            const container = document.createElement('div');
            container.className = 'canvas-inline-container';
            container.style.cssText = `position: relative; width: ${width}px; height: ${height}px; flex-shrink: 0; overflow: visible; background: transparent;`;
            
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none;';
            
            const getSideCoordinate = (node, side) => {
                const nx = node.x - minX + padding;
                const ny = node.y - minY + padding;
                switch (side) {
                    case 'top': return { x: nx + node.width / 2, y: ny };
                    case 'right': return { x: nx + node.width, y: ny + node.height / 2 };
                    case 'bottom': return { x: nx + node.width / 2, y: ny + node.height };
                    case 'left': return { x: nx, y: ny + node.height / 2 };
                    default: return { x: nx + node.width / 2, y: ny + node.height / 2 };
                }
            };
            
            if (data.edges) {
                data.edges.forEach(edge => {
                    const fromNode = data.nodes.find(n => n.id === edge.fromNode);
                    const toNode = data.nodes.find(n => n.id === edge.toNode);
                    if (!fromNode || !toNode) return;
                    
                    const p1 = getSideCoordinate(fromNode, edge.fromSide);
                    const p2 = getSideCoordinate(toNode, edge.toSide);
                    
                    const dx = Math.abs(p2.x - p1.x) * 0.5;
                    const dy = Math.abs(p2.y - p1.y) * 0.5;
                    let cp1x = p1.x, cp1y = p1.y, cp2x = p2.x, cp2y = p2.y;
                    
                    if (edge.fromSide === 'right') cp1x += dx;
                    else if (edge.fromSide === 'left') cp1x -= dx;
                    else if (edge.fromSide === 'bottom') cp1y += dy;
                    else if (edge.fromSide === 'top') cp1y -= dy;
                    
                    if (edge.toSide === 'right') cp2x += dx;
                    else if (edge.toSide === 'left') cp2x -= dx;
                    else if (edge.toSide === 'bottom') cp2y += dy;
                    else if (edge.toSide === 'top') cp2y -= dy;
                    
                    const pathData = `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
                    
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathData);
                    path.setAttribute('stroke', 'var(--q-gray)');
                    path.setAttribute('stroke-width', '1.5px');
                    path.setAttribute('fill', 'none');
                    path.style.cssText = 'transition: stroke 0.2s ease;';
                    svg.appendChild(path);
                });
            }
            
            container.appendChild(svg);
            
            data.nodes.forEach(node => {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = 'canvas-node';
                nodeDiv.style.cssText = `
                    position: absolute;
                    left: ${node.x - minX + padding}px;
                    top: ${node.y - minY + padding}px;
                    width: ${node.width}px;
                    height: ${node.height}px;
                    background: var(--q-light);
                    border: 1.5px solid var(--q-lightgray);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                    transition: border-color 0.2s, box-shadow 0.2s;
                `;
                
                nodeDiv.addEventListener('mouseenter', () => {
                    nodeDiv.style.borderColor = 'var(--q-dark)';
                    nodeDiv.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                });
                nodeDiv.addEventListener('mouseleave', () => {
                    nodeDiv.style.borderColor = 'var(--q-lightgray)';
                    nodeDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                });
                
                if (node.type === 'text') {
                    const body = document.createElement('div');
                    body.className = 'canvas-node-body';
                    body.style.cssText = 'padding: 0.8rem 1rem; font-size: 0.88rem; line-height: 1.5; color: var(--q-dark); overflow-y: auto; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 100%; box-sizing: border-box; font-family: var(--q-font-body);';
                    
                    if (typeof window.marked !== 'undefined' && window.marked.parseInline) {
                        body.innerHTML = window.marked.parseInline(node.text || '');
                    } else {
                        body.innerHTML = (node.text || '')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br>');
                    }
                    nodeDiv.appendChild(body);
                } else if (node.type === 'file') {
                    const canvasDir = canvasUrl.split('/').slice(0, -1).join('/');
                    const imgUrl = `${canvasDir}/${node.file}`;
                    const img = document.createElement('img');
                    img.src = imgUrl;
                    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
                    nodeDiv.appendChild(img);
                }
                
                container.appendChild(nodeDiv);
            });
            
            wrapper.appendChild(container);
            embed.replaceWith(wrapper);
        } catch (e) {
            console.error('Failed to render inline canvas:', e);
            embed.innerHTML = `<div style="color: red; padding: 1rem; border: 1.5px solid var(--q-lightgray); border-radius: 8px;">Failed to render Canvas: ${e.message}</div>`;
        }
    }
}

window.initInteractiveExcalidraw = function() {
    const escapeHtml = (text) => {
        if (!text || typeof text !== 'string') return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    document.querySelectorAll('.interactive-excalidraw').forEach(async (container) => {
        if (container.getAttribute('data-loaded')) return;
        container.setAttribute('data-loaded', 'true');
        const src = container.getAttribute('data-src');
        const hash = container.getAttribute('data-hash') || '';
        const urlParams = new URLSearchParams(window.location.search);
        const isMainDrawPage = window.location.pathname.includes('blog-post.html') && (urlParams.get('id') || '').endsWith('_draw');
        const isNested = container.closest('foreignObject') !== null || container.closest('.direct-embed-item') !== null;
        const isCleanInline = isNested || (hash && !isMainDrawPage);
        if (!src) return;
        try {
            const cacheBuster = Date.now();
            let res = await fetch(src + '?v=' + cacheBuster);
            
            // Try fallback URLs to support data/ subfolder drawings and missing extension cases
            if (!res.ok) {
                res = await fetch(src + '.md?v=' + cacheBuster);
            }
            if (!res.ok) {
                const parts = src.split('/');
                const filename = parts.pop();
                const dataSubfolderSrc = [...parts, 'data', filename].join('/');
                res = await fetch(dataSubfolderSrc + '?v=' + cacheBuster);
                if (!res.ok) {
                    res = await fetch(dataSubfolderSrc + '.md?v=' + cacheBuster);
                }
            }
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const content = await res.text();
            
            // Extract JSON robustly (handling carriage returns and trailing markdown)
            let jsonText = '';
            
            if (content.includes('```compressed-json')) {
                const startIdx = content.indexOf('```compressed-json');
                const endIdx = content.indexOf('```', startIdx + 18);
                if (startIdx !== -1 && endIdx !== -1) {
                    let base64 = content.substring(startIdx + 18, endIdx).trim();
                    // Clean whitespace
                    base64 = base64.replace(/\s/g, '');
                    if (typeof LZString === 'undefined') {
                        console.warn('LZString library not loaded! Trying dynamic load...');
                        await new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js';
                            script.onload = resolve;
                            script.onerror = reject;
                            document.head.appendChild(script);
                        });
                    }
                    jsonText = LZString.decompressFromBase64(base64);
                }
            }
            
            if (!jsonText) {
                const jsonStartIdx = content.indexOf('```json');
                if (jsonStartIdx !== -1) {
                    const realStart = content.indexOf('{', jsonStartIdx);
                    const codeBlockEnd = content.indexOf('```', jsonStartIdx + 7);
                    if (realStart !== -1 && codeBlockEnd !== -1) {
                        const realEnd = content.lastIndexOf('}', codeBlockEnd);
                        if (realEnd !== -1 && realEnd > realStart) {
                            jsonText = content.substring(realStart, realEnd + 1);
                        }
                    }
                }
            }
            const jsonData = JSON.parse(jsonText);
            let elements = jsonData.elements || [];
            
            const debugLog = (msg) => {
                console.log(msg);
            };
            debugLog(`Loaded jsonData elements count: ${elements.length}`);
            debugLog(`Hash: "${hash}"`);

            // If hash is specified, e.g. "rect-0", filter elements FIRST before loading embeddables
            if (hash) {
                const targetEl = elements.find(el => el.id === hash);
                const targetGroupIds = targetEl && targetEl.groupIds ? targetEl.groupIds : [];
                elements = elements.filter(el => 
                    el.id === hash || 
                    el.containerId === hash || 
                    (el.type === 'arrow' && el.id.includes(hash)) ||
                    (targetGroupIds.length > 0 && el.groupIds && el.groupIds.some(gId => targetGroupIds.includes(gId)))
                );
            }

            // Pre-process embeddable elements to resolve their contents asynchronously
            for (let el of elements) {
                if (el.type === 'embeddable' && el.link && !el.isDeleted) {
                    try {
                        debugLog(`Found embeddable: ${el.link}`);
                        const linkMatch = el.link.match(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/);
                        if (linkMatch) {
                            const noteName = linkMatch[1].trim();
                            const section = linkMatch[2];
                            debugLog(`Parsed noteName: "${noteName}", section: "${section}"`);
                            
                            let targetNote = null;
                            debugLog(`window.allPosts defined? ${!!window.allPosts}`);
                            if (window.allPosts) {
                                debugLog(`Total posts in allPosts: ${window.allPosts.length}`);
                                const cleanNoteName = noteName.toLowerCase().replace(/\s+/g, '-');
                                targetNote = window.allPosts.find(p => p.title === noteName || p.id === cleanNoteName);
                            }
                            
                            if (targetNote) {
                                debugLog(`Found target note: ${targetNote.filename}`);
                                const noteRes = await fetch(`posts/${targetNote.filename}`);
                                debugLog(`Fetch note status: ${noteRes.status}`);
                                if (noteRes.ok) {
                                    const noteText = await noteRes.text();
                                    
                                    let sectionContent = '';
                                    if (section) {
                                         const lines = noteText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
                                         let inSection = false;
                                         let sectionLines = [];
                                         let matchHeaderLevel = 0;
                                         
                                         const normalizeText = (str) => {
                                             return str.replace(/[\s\-\_\.\·]/g, '').toLowerCase().trim();
                                         };
                                         const cleanHeaderTarget = normalizeText(section);
                                         
                                         for (let line of lines) {
                                             const match = line.match(/^(#+)\s+(.*)/);
                                             if (match) {
                                                 const level = match[1].length;
                                                 const headingText = match[2].trim();
                                                 const cleanHeadingText = normalizeText(headingText);
                                                 
                                                 if (inSection) {
                                                     if (level <= matchHeaderLevel) {
                                                         break;
                                                     }
                                                 } else {
                                                     // 앞쪽의 번호들 (예: 1.3, 1.1)이 있어도 매칭되도록 함
                                                     const targetWithoutNumbers = cleanHeaderTarget.replace(/^[\d\.]+/g, '');
                                                     const headingWithoutNumbers = cleanHeadingText.replace(/^[\d\.]+/g, '');
                                                     if (cleanHeadingText === cleanHeaderTarget || 
                                                         cleanHeadingText.includes(cleanHeaderTarget) || 
                                                         cleanHeaderTarget.includes(cleanHeadingText) ||
                                                         (targetWithoutNumbers && headingWithoutNumbers.includes(targetWithoutNumbers)) ||
                                                         (headingWithoutNumbers && targetWithoutNumbers.includes(headingWithoutNumbers))) {
                                                         inSection = true;
                                                         matchHeaderLevel = level;
                                                     }
                                                 }
                                             }
                                             if (inSection) {
                                                 sectionLines.push(line);
                                             }
                                         }
                                         sectionContent = sectionLines.join('\n');
                                         debugLog(`Extracted content size: ${sectionContent.length}`);
                                    } else {
                                        sectionContent = noteText;
                                    }
                                    
                                    // Render the markdown content to HTML
                                    const renderedHtml = window.renderMarkdown(sectionContent, targetNote.filename);
                                    el.embeddedHtml = renderedHtml;
                                    debugLog(`HTML rendered successfully: ${!!renderedHtml}`);
                                }
                            }
                        }
                    } catch (err) {
                        debugLog(`❌ Error: ${err.message}`);
                        console.error('Failed to pre-process embeddable element:', err);
                    }
                }
            }
            
            const nonDeletedElements = elements.filter(el => !el.isDeleted);
            const embeddables = nonDeletedElements.filter(el => el.type === 'embeddable');
            const isExcalidraw = src.includes('excalidraw') || src.includes('_draw') || content.includes('excalidraw-plugin: raw') || content.includes('"type": "excalidraw"');
            
            if (!isMainDrawPage && !isExcalidraw && embeddables.length > 0) {
                const htmlContent = embeddables
                    .map(el => {
                        if (!el.embeddedHtml) return '';
                        
                        let title = 'Embedded Document';
                        let targetUrl = '#';
                        if (el.link) {
                            const linkMatch = el.link.match(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/);
                            if (linkMatch) {
                                const noteName = linkMatch[1].trim();
                                const section = linkMatch[2];
                                title = section || noteName;
                                const noteId = noteName.replace(/\s+/g, '-').toLowerCase();
                                const hashVal = section ? `#${section.trim().replace(/\s+/g, '-').toLowerCase()}` : '';
                                targetUrl = `blog-post.html?id=${noteId}${hashVal}`;
                            }
                        }
                        
                        return `
                            <div class="direct-embed-item" style="position: relative; border: 1.5px solid var(--q-lightgray, #e5e5e5); border-radius: 8px; overflow: hidden; background: transparent; margin-bottom: 20px; width: 100%;">
                                <a href="${targetUrl}" target="_parent" style="position: absolute; top: 8px; right: 8px; color: var(--q-link, #0969da); text-decoration: none; display: flex; align-items: center; justify-content: center; z-index: 10; width: 20px; height: 20px; background: rgba(255,255,255,0.85); border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.1);" title="Open link">
                                    <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                                        <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5A1.75 1.75 0 0 1 3.75 2Zm7.78 1.03 1.22 1.22-4.25 4.25a.75.75 0 1 0 1.06 1.06l4.25-4.25 1.22 1.22a.25.25 0 0 0 .42-.18V1.75a.25.25 0 0 0-.25-.25h-3.75a.25.25 0 0 0-.18.42Z"></path>
                                    </svg>
                                </a>
                                <div style="padding: 16px; font-size: 14px; line-height: 1.6; color: var(--q-dark, #2b2b2b); text-align: left;">
                                    ${el.embeddedHtml}
                                </div>
                            </div>
                        `;
                    })
                    .filter(html => html.trim() !== '')
                    .join('\n');
                
                if (htmlContent) {
                    container.innerHTML = `<div class="direct-rendered-embeddables" style="width: 100%; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; color: var(--q-dark, #2b2b2b);">
                        ${htmlContent}
                    </div>`;
                    container.style.border = 'none';
                    container.style.background = 'transparent';
                    container.style.height = 'auto';
                    container.style.overflow = 'visible';
                    return;
                }
            }
            
            if (elements.length === 0) {
                container.innerHTML = '<div style="padding: 1rem; color: var(--q-gray); font-size: 0.9rem; text-align: center;">No elements found to render.</div>';
                return;
            }
            
            // Calculate bounding box of visible elements to set viewBox
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            elements.forEach(el => {
                if (el.isDeleted) return;
                if (el.type === 'arrow' && el.points) {
                    const startX = el.x;
                    const startY = el.y;
                    el.points.forEach(p => {
                        const px = startX + p[0];
                        const py = startY + p[1];
                        minX = Math.min(minX, px);
                        minY = Math.min(minY, py);
                        maxX = Math.max(maxX, px);
                        maxY = Math.max(maxY, py);
                    });
                } else {
                    minX = Math.min(minX, el.x);
                    minY = Math.min(minY, el.y);
                    maxX = Math.max(maxX, el.x + el.width);
                    maxY = Math.max(maxY, el.y + el.height);
                }
            });
            
            const padding = 15;
            const width = (maxX - minX) + padding * 2;
            const height = (maxY - minY) + padding * 2;
            const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;
            
            // SVG 배경: 흰색이면 CSS 변수로 교체하여 다크모드 지원
            const rawBgColor = jsonData.appState?.viewBackgroundColor || '#ffffff';
            const isDefaultWhite = ['#ffffff', '#fff', 'white'].includes(rawBgColor.toLowerCase());
            const svgBgColor = isCleanInline ? 'transparent' : (isDefaultWhite ? 'var(--q-light, #ffffff)' : rawBgColor);
            
            // 색상을 무채색으로 변환하는 함수 (오류 방지를 위해 try-catch 및 타입 검증 적용)
            const toGrayscale = (color) => {
                try {
                    if (!color || typeof color !== 'string' || color === 'none' || color === 'transparent') return color;
                    if (color.startsWith('var(')) return color;
                    
                    let r = 0, g = 0, b = 0, a = 1;
                    const matchHex = color.match(/^#([0-9a-f]{3,8})$/i);
                    if (matchHex) {
                        let hex = matchHex[1];
                        if (hex.length === 3) {
                            r = parseInt(hex[0] + hex[0], 16);
                            g = parseInt(hex[1] + hex[1], 16);
                            b = parseInt(hex[2] + hex[2], 16);
                        } else if (hex.length === 4) {
                            r = parseInt(hex[0] + hex[0], 16);
                            g = parseInt(hex[1] + hex[1], 16);
                            b = parseInt(hex[2] + hex[2], 16);
                            a = parseInt(hex[3] + hex[3], 16) / 255;
                        } else if (hex.length === 6) {
                            r = parseInt(hex.substring(0, 2), 16);
                            g = parseInt(hex.substring(2, 4), 16);
                            b = parseInt(hex.substring(4, 6), 16);
                        } else if (hex.length === 8) {
                            r = parseInt(hex.substring(0, 2), 16);
                            g = parseInt(hex.substring(2, 4), 16);
                            b = parseInt(hex.substring(4, 6), 16);
                            a = parseInt(hex.substring(6, 8), 16) / 255;
                        }
                    } else {
                        const matchRgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
                        if (matchRgb) {
                            r = parseInt(matchRgb[1], 10);
                            g = parseInt(matchRgb[2], 10);
                            b = parseInt(matchRgb[3], 10);
                            if (matchRgb[4]) a = parseFloat(matchRgb[4]);
                        } else {
                            return color;
                        }
                    }
                    
                    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                    
                    // 임계값에 따라 사이트 테마 변수로 맵핑
                    if (gray < 80) {
                        return 'var(--q-dark)';      // 가장 진한 텍스트/라인
                    } else if (gray < 180) {
                        return 'var(--q-darkgray)';  // 중간 강조 텍스트/화살표/라인
                    } else {
                        return 'var(--q-lightgray)'; // 보조선/박스 테두리
                    }
                } catch (e) {
                    console.error('Error in toGrayscale:', e);
                    return color;
                }
            };

            // 기본 다크 텍스트 색상 → CSS 변수로 교체
            const defaultDarkColors = ['#1e1e1e', '#2b2b2b', '#000000', '#000', '#1c1c1e'];
            const resolveColor = (color, fallback = 'var(--q-dark, #2b2b2b)') => {
                if (!color) return fallback;
                const lower = color.toLowerCase();
                if (defaultDarkColors.includes(lower)) return fallback;
                if (['#ffffff', '#fff', 'white'].includes(lower)) return 'var(--q-highlight, #f5f5f5)';
                return toGrayscale(color);
            };
            const resolveStroke = (color) => {
                if (!color) return 'rgba(0,0,0,0.08)';
                const lower = color.toLowerCase();
                // 완전 흰색·무색 테두리만 CSS 변수로 교체, 나머지는 원본 색상 유지 후 무채색화
                if (['#ffffff', '#fff', 'white'].includes(lower)) {
                    return 'var(--q-lightgray, rgba(0,0,0,0.08))';
                }
                // 기본 다크 텍스트 색상은 CSS 변수로 교체
                if (defaultDarkColors.includes(lower)) return 'var(--q-dark, #2b2b2b)';
                return toGrayscale(color);
            };
            let svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" style="background-color: ${svgBgColor};">
              <defs>
                <marker id="excalidraw-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="var(--q-lightgray, #b8b8b8)" />
                </marker>
              </defs>
            `;
            
            
            elements.forEach(el => {
                if (el.isDeleted) return;
                
                const hasLink = el.link && el.link.trim() !== '' && el.type !== 'embeddable';
                if (hasLink) {
                    let targetUrl = el.link.trim();
                    const linkMatch = targetUrl.match(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/);
                    if (linkMatch) {
                        const noteName = linkMatch[1].trim();
                        const section = linkMatch[2];
                        const noteId = noteName.replace(/\s+/g, '-').toLowerCase();
                        const hash = section ? `#${section.trim().replace(/\s+/g, '-').toLowerCase()}` : '';
                        targetUrl = `blog-post.html?id=${noteId}${hash}`;
                    }
                    svgHtml += `  <a href="${targetUrl}" target="_blank" style="cursor: pointer;">\n`;
                }
                
                if (el.type === 'rectangle') {
                    const fill = 'none'; // 박스 배경은 항상 투명하게
                    const stroke = resolveStroke(el.strokeColor);
                    const rx = el.roundness ? 4 : 0;
                    svgHtml += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.5}" />\n`;
                } else if (el.type === 'text') {
                    // frameId가 있는 텍스트는 frame 요소가 이미 라벨을 렌더링하므로 스킵
                    if (el.frameId) return;
                    let fill = resolveColor(el.strokeColor);
                    if (el.link && el.link.trim() !== '') {
                        fill = 'var(--q-secondary, #284b63)';
                    } else if (el.text && el.text.trim().startsWith('•')) {
                        fill = 'var(--q-darkgray, #4e4e4e)';
                    }
                    const lines = el.text.split('\n');
                    const fontSize = el.fontSize || 14;
                    const lineH = fontSize * (el.lineHeight || 1.35);
                    const totalTextHeight = lines.length * lineH;
                    // verticalAlign: top이면 상단 기준, 아니면 수직 중앙
                    const vAlign = el.verticalAlign || 'middle';
                    const baseY = vAlign === 'top'
                        ? el.y + fontSize * 0.9
                        : el.y + (el.height - totalTextHeight) / 2 + fontSize * 0.95;
                    // textAlign 반영: left, center, right
                    const hAlign = el.textAlign || 'center';
                    let textAnchor, textX;
                    if (hAlign === 'left') {
                        textAnchor = 'start';
                        textX = el.x + 2;
                    } else if (hAlign === 'right') {
                        textAnchor = 'end';
                        textX = el.x + el.width - 2;
                    } else {
                        textAnchor = 'middle';
                        textX = el.x + el.width / 2;
                    }
                    
                    lines.forEach((line, index) => {
                        const lineY = baseY + index * lineH;
                        if (line.trim().startsWith('•') && line.includes(':')) {
                            const colonIdx = line.indexOf(':');
                            const prefix = line.slice(0, colonIdx + 1);
                            const suffix = line.slice(colonIdx + 1);
                            svgHtml += `  <text x="${textX}" y="${lineY}" font-family="var(--q-font-body, system-ui, -apple-system, sans-serif)" font-size="${fontSize}" font-weight="500" text-anchor="${textAnchor}"><tspan fill="var(--q-dark, #2b2b2b)" font-weight="700">${escapeHtml(prefix)}</tspan><tspan fill="var(--q-darkgray, #4e4e4e)">${escapeHtml(suffix)}</tspan></text>\n`;
                        } else {
                            svgHtml += `  <text x="${textX}" y="${lineY}" fill="${fill}" font-family="var(--q-font-body, system-ui, -apple-system, sans-serif)" font-size="${fontSize}" font-weight="500" text-anchor="${textAnchor}">${escapeHtml(line)}</text>\n`;
                        }
                    });
                } else if (el.type === 'frame') {
                    // Excalidraw frame: rect + name label inside top-left (Obsidian style)
                    const stroke = resolveStroke(el.strokeColor);
                    const fill = 'none'; // 박스 배경은 항상 투명하게
                    const rx = 4;
                    const clipId = `frame-clip-${el.id}`;
                    svgHtml += `  <defs><clipPath id="${clipId}"><rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" /></clipPath></defs>\n`;
                    svgHtml += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.5}" />\n`;
                    if (el.name) {
                        const labelFontSize = el.fontSize || 16;
                        svgHtml += `  <text x="${el.x + 12}" y="${el.y + labelFontSize + 8}" fill="var(--q-dark, #2b2b2b)" font-family="system-ui, -apple-system, sans-serif" font-size="${labelFontSize}" font-weight="700" clip-path="url(#${clipId})">${escapeHtml(el.name)}</text>\n`;
                    }
                } else if (el.type === 'arrow' && el.points) {
                    const stroke = toGrayscale(el.strokeColor || '#b8b8b8');
                    const strokeWidth = el.strokeWidth || 1.5;
                    const startX = el.x;
                    const startY = el.y;
                    
                    let pathData = `M ${startX} ${startY}`;
                    for (let k = 1; k < el.points.length; k++) {
                        pathData += ` L ${startX + el.points[k][0]} ${startY + el.points[k][1]}`;
                    }
                    
                    const startMarker = el.startArrowhead ? 'marker-start="url(#excalidraw-arrow)"' : '';
                    const endMarker = el.endArrowhead !== null ? 'marker-end="url(#excalidraw-arrow)"' : '';
                    svgHtml += `  <path d="${pathData}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" ${startMarker} ${endMarker} />\n`;
                } else if (el.type === 'embeddable') {
                    const stroke = toGrayscale(el.strokeColor || '#b8b8b8');
                    const rx = 8;
                    
                    if (el.embeddedDrawing) {
                        const subElements = el.embeddedDrawing.elements.filter(subEl => !subEl.isDeleted);
                        
                        let subMinX = Infinity, subMinY = Infinity, subMaxX = -Infinity, subMaxY = -Infinity;
                        subElements.forEach(subEl => {
                            if (subEl.type === 'arrow' && subEl.points) {
                                const startX = subEl.x;
                                const startY = subEl.y;
                                subEl.points.forEach(p => {
                                    subMinX = Math.min(subMinX, startX + p[0]);
                                    subMinY = Math.min(subMinY, startY + p[1]);
                                    subMaxX = Math.max(subMaxX, startX + p[0]);
                                    subMaxY = Math.max(subMaxY, startY + p[1]);
                                });
                            } else {
                                subMinX = Math.min(subMinX, subEl.x);
                                subMinY = Math.min(subMinY, subEl.y);
                                subMaxX = Math.max(subMaxX, subEl.x + subEl.width);
                                subMaxY = Math.max(subMaxY, subEl.y + subEl.height);
                            }
                        });
                        
                        const subWidth = subMaxX - subMinX;
                        const subHeight = subMaxY - subMinY;
                        
                        if (subWidth > 0 && subHeight > 0) {
                            const padding = 15;
                            const targetW = el.width - padding * 2;
                            const targetH = el.height - padding * 2;
                            const s = Math.min(targetW / subWidth, targetH / subHeight);
                            const dx = el.x + (el.width - subWidth * s) / 2 - subMinX * s;
                            const dy = el.y + (el.height - subHeight * s) / 2 - subMinY * s;
                            
                            const fill = 'none'; // 박스 배경은 항상 투명하게
                            svgHtml += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.5}" />\n`;
                            
                            subElements.forEach(subEl => {
                                if (subEl.type === 'rectangle') {
                                    const fill = 'none'; // 서브 박스 배경도 항상 투명하게
                                    const subStroke = resolveStroke(subEl.strokeColor);
                                    const subRx = subEl.roundness ? 4 * s : 0;
                                    svgHtml += `  <rect x="${subEl.x * s + dx}" y="${subEl.y * s + dy}" width="${subEl.width * s}" height="${subEl.height * s}" rx="${subRx}" ry="${subRx}" fill="${fill}" stroke="${subStroke}" stroke-width="${(subEl.strokeWidth || 1.5) * s}" />\n`;
                                } else if (subEl.type === 'text') {
                                    let fill = resolveColor(subEl.strokeColor);
                                    if (subEl.link && subEl.link.trim() !== '') {
                                        fill = 'var(--q-secondary, #284b63)';
                                    } else if (subEl.text && subEl.text.trim().startsWith('•')) {
                                        fill = 'var(--q-darkgray, #4e4e4e)';
                                    }
                                    const lines = subEl.text.split('\n');
                                    const fontSize = (subEl.fontSize || 14) * s;
                                    const totalTextHeight = lines.length * fontSize * 1.3;
                                    const startY = (subEl.y * s + dy) + (subEl.height * s - totalTextHeight) / 2 + fontSize * 0.95;
                                    
                                    lines.forEach((line, index) => {
                                        const lineY = startY + index * fontSize * 1.3;
                                        if (line.trim().startsWith('•') && line.includes(':')) {
                                            const colonIdx = line.indexOf(':');
                                            const prefix = line.slice(0, colonIdx + 1);
                                            const suffix = line.slice(colonIdx + 1);
                                            svgHtml += `  <text x="${(subEl.x + subEl.width / 2) * s + dx}" y="${lineY}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="500" text-anchor="middle" dominant-baseline="middle"><tspan fill="var(--q-dark, #2b2b2b)" font-weight="700">${escapeHtml(prefix)}</tspan><tspan fill="var(--q-darkgray, #4e4e4e)">${escapeHtml(suffix)}</tspan></text>\n`;
                                        } else {
                                            svgHtml += `  <text x="${(subEl.x + subEl.width / 2) * s + dx}" y="${lineY}" fill="${fill}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="500" text-anchor="middle" dominant-baseline="middle">${escapeHtml(line)}</text>\n`;
                                        }
                                    });
                                } else if (subEl.type === 'arrow' && subEl.points) {
                                    const subStroke = resolveStroke(subEl.strokeColor);
                                    const subStrokeWidth = (subEl.strokeWidth || 1.5) * s;
                                    
                                    let pathData = `M ${subEl.x * s + dx} ${subEl.y * s + dy}`;
                                    for (let k = 1; k < subEl.points.length; k++) {
                                        pathData += ` L ${(subEl.x + subEl.points[k][0]) * s + dx} ${(subEl.y + subEl.points[k][1]) * s + dy}`;
                                    }
                                    
                                    const startMarker = subEl.startArrowhead ? 'marker-start="url(#excalidraw-arrow)"' : '';
                                    const endMarker = subEl.endArrowhead !== null ? 'marker-end="url(#excalidraw-arrow)"' : '';
                                    svgHtml += `  <path d="${pathData}" fill="none" stroke="${subStroke}" stroke-width="${subStrokeWidth}" ${startMarker} ${endMarker} />\n`;
                                }
                            });
                        } else {
                            svgHtml += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="none" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.5}" />\n`;
                        }
                    } else if (el.embeddedHtml) {
                        const fill = 'none'; // 임베디드 HTML의 박스 배경도 항상 투명하게
                        const stroke = resolveStroke(el.strokeColor);
                        svgHtml += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.5}" />\n`;
                        
                        let targetUrl = '#';
                        if (el.link) {
                            const linkMatch = el.link.match(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/);
                            if (linkMatch) {
                                const noteName = linkMatch[1].trim();
                                const section = linkMatch[2];
                                const noteId = noteName.trim();
                                const hash = section ? `#${section.trim().replace(/\s+/g, '-').toLowerCase()}` : '';
                                targetUrl = `blog-post.html?id=${encodeURIComponent(noteId)}${hash}`;
                            }
                        }

                        // 제목을 추출하지 않고 원본 HTML 그대로 렌더링 (Obsidian과 동일한 구조)
                        svgHtml += `  <foreignObject x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}">
                            <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;position:relative;overflow:hidden;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;background:transparent;outline:none;outline-color:transparent;">
                                <a href="${targetUrl}" target="_parent" style="position:absolute;top:6px;right:6px;color:var(--q-link,#0969da);text-decoration:none;display:flex;align-items:center;justify-content:center;z-index:10;width:18px;height:18px;background:rgba(255,255,255,0.85);border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid rgba(0,0,0,0.1);outline:none;" title="Open link">
                                    <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5A1.75 1.75 0 0 1 3.75 2Zm7.78 1.03 1.22 1.22-4.25 4.25a.75.75 0 1 0 1.06 1.06l4.25-4.25 1.22 1.22a.25.25 0 0 0 .42-.18V1.75a.25.25 0 0 0-.25-.25h-3.75a.25.25 0 0 0-.18.42Z"></path></svg>
                                </a>
                                <div class="markdown-embed" style="width:100%;height:100%;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;font-size:13px;line-height:1.5;color:var(--q-dark,#2b2b2b);padding:10px 15px;outline:none;">
                                    ${el.embeddedHtml}
                                </div>
                            </div>
                        </foreignObject>\n`;
                    } else {
                        const fill = 'none'; // 박스 배경은 항상 투명하게
                        svgHtml += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.5}" />\n`;
                        
                        let label = 'Embedded Document';
                        let targetUrl = '#';
                        if (el.link) {
                            const linkMatch = el.link.match(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/);
                            if (linkMatch) {
                                const noteName = linkMatch[1];
                                const section = linkMatch[2];
                                const customLabel = linkMatch[3];
                                label = customLabel || (section ? `${noteName} > ${section}` : noteName);
                                
                                const noteId = noteName.trim().replace(/\s+/g, '-').toLowerCase();
                                const hash = section ? `#${section.trim().replace(/\s+/g, '-').toLowerCase()}` : '';
                                targetUrl = `blog-post.html?id=${noteId}${hash}`;
                            } else {
                                label = el.link;
                                targetUrl = el.link;
                            }
                        }
                        
                        const centerX = el.x + el.width / 2;
                        const centerY = el.y + el.height / 2;
                        svgHtml += `  <a href="${targetUrl}" target="_parent">
                            <rect x="${centerX - 120}" y="${centerY - 25}" width="240" height="50" rx="6" ry="6" fill="var(--q-light, #ffffff)" stroke="${resolveStroke(el.strokeColor)}" stroke-width="1" style="cursor: pointer;" />
                            <text x="${centerX}" y="${centerY + 4}" fill="var(--q-dark, #2b2b2b)" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" text-anchor="middle" dominant-baseline="middle" style="cursor: pointer;">🔗 ${escapeHtml(label)}</text>
                        </a>\n`;
                    }
                }
                
                if (hasLink) {
                    svgHtml += `  </a>\n`;
                }
            });
            const controlsDisplay = isCleanInline ? 'display: none;' : 'display: flex; gap: 5px;';
            const viewportCursor = isCleanInline ? 'default' : 'grab';
            const viewportHeight = isCleanInline ? 'auto' : '100%';
            
            if (!isMainDrawPage) {
                container.style.height = `${height}px`;
            }
            if (isCleanInline) {
                container.style.border = 'none';
                container.style.background = 'transparent';
                container.style.overflow = 'visible';
            }
            
            container.innerHTML = `
                <div class="excalidraw-controls" style="position: absolute; top: 10px; right: 10px; ${controlsDisplay} z-index: 10;">
                    <button class="excalidraw-btn zoom-in" style="background: var(--q-light, #ffffff); border: 1.5px solid var(--q-lightgray, #e5e5e5); color: var(--q-dark, #2b2b2b); padding: 0; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; font-family: system-ui; box-shadow: 0 2px 6px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px; transition: all 0.15s;" title="줌 인">+</button>
                    <button class="excalidraw-btn zoom-out" style="background: var(--q-light, #ffffff); border: 1.5px solid var(--q-lightgray, #e5e5e5); color: var(--q-dark, #2b2b2b); padding: 0; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; font-family: system-ui; box-shadow: 0 2px 6px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px; transition: all 0.15s;" title="줌 아웃">-</button>
                    <button class="excalidraw-btn reset" style="background: var(--q-light, #ffffff); border: 1.5px solid var(--q-lightgray, #e5e5e5); color: var(--q-dark, #2b2b2b); padding: 0; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px; transition: all 0.15s;" title="화면 맞춤">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    </button>
                    ${isMainDrawPage ? `
                    <button class="excalidraw-btn maximize" style="background: var(--q-light, #ffffff); border: 1.5px solid var(--q-lightgray, #e5e5e5); color: var(--q-dark, #2b2b2b); padding: 0; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px; transition: all 0.15s;" title="크게 보기">
                        <svg class="maximize-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    </button>` : ''}
                </div>
                <div class="excalidraw-viewport" style="width: 100%; height: ${viewportHeight}; cursor: ${viewportCursor}; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <div class="excalidraw-wrapper" style="transform-origin: center center; transition: transform 0.05s ease-out; will-change: transform; display: flex; align-items: center; justify-content: center; ${isCleanInline ? 'width: 100%;' : ''}">
                        ${svgHtml}
                    </div>
                </div>
            `;
            
            const viewport = container.querySelector('.excalidraw-viewport');
            const wrapper = container.querySelector('.excalidraw-wrapper');
            const svgEl = wrapper.querySelector('svg');
            
            if (svgEl) {
                svgEl.removeAttribute('width');
                svgEl.removeAttribute('height');
                if (isCleanInline) {
                    svgEl.style.width = '100%';
                    svgEl.style.height = 'auto';
                    const dataSize = container.getAttribute('data-size');
                    const limitWidth = (dataSize && parseInt(dataSize, 10)) ? parseInt(dataSize, 10) : width;
                    svgEl.style.maxWidth = `${limitWidth}px`;
                    svgEl.style.maxHeight = 'none';
                } else {
                    svgEl.style.width = `${width}px`;
                    svgEl.style.height = `${height}px`;
                    svgEl.style.maxWidth = 'none';
                    svgEl.style.maxHeight = 'none';
                }
                svgEl.style.display = 'block';
            }
            
            let scale = 1;
            let panX = 0;
            let panY = 0;
            let isDragging = false;
            let startX = 0;
            let startY = 0;
            
            const updateTransform = () => {
                wrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
            };
            
            viewport.addEventListener('mousedown', (e) => {
                if (isCleanInline) return;
                if (e.target.closest('.excalidraw-controls')) return;
                isDragging = true;
                startX = e.clientX - panX;
                startY = e.clientY - panY;
                viewport.style.cursor = 'grabbing';
            });
            
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                panX = e.clientX - startX;
                panY = e.clientY - startY;
                updateTransform();
            });
            
            window.addEventListener('mouseup', () => {
                isDragging = false;
                if (!isCleanInline) {
                    viewport.style.cursor = 'grab';
                }
            });
            
            viewport.addEventListener('wheel', (e) => {
                if (isCleanInline) return;
                e.preventDefault();
                const zoomFactor = 1.05;
                const nextScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
                scale = Math.min(Math.max(nextScale, 0.15), 4.0);
                updateTransform();
            }, { passive: false });
            
            // Touch support
            let lastTouchDistance = 0;
            viewport.addEventListener('touchstart', (e) => {
                if (isCleanInline) return;
                if (e.target.closest('.excalidraw-controls')) return;
                if (e.touches.length === 1) {
                    isDragging = true;
                    startX = e.touches[0].clientX - panX;
                    startY = e.touches[0].clientY - panY;
                } else if (e.touches.length === 2) {
                    isDragging = false;
                    lastTouchDistance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                }
            });
 
            viewport.addEventListener('touchmove', (e) => {
                if (isDragging && e.touches.length === 1) {
                    panX = e.touches[0].clientX - startX;
                    panY = e.touches[0].clientY - startY;
                    updateTransform();
                } else if (e.touches.length === 2) {
                    const dist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    const factor = dist / lastTouchDistance;
                    scale = Math.min(Math.max(scale * factor, 0.15), 4.0);
                    lastTouchDistance = dist;
                    updateTransform();
                }
            });
 
            viewport.addEventListener('touchend', () => {
                isDragging = false;
            });
            
            const fitToViewport = () => {
                const cw = container.clientWidth;
                const ch = container.clientHeight;
                if (width && height && cw && ch) {
                    if (isCleanInline) {
                        scale = 1;
                        panX = 0;
                        panY = 0;
                    } else {
                        scale = Math.min(Math.min((cw - 40) / width, (ch - 40) / height), 1.0);
                        panX = 0;
                        panY = 0;
                    }
                    updateTransform();
                }
            };
            
            container.querySelector('.zoom-in').addEventListener('click', () => {
                scale = Math.min(scale * 1.2, 4.0);
                updateTransform();
            });
            
            container.querySelector('.zoom-out').addEventListener('click', () => {
                scale = Math.max(scale / 1.2, 0.15);
                updateTransform();
            });
            
            container.querySelector('.reset').addEventListener('click', () => {
                fitToViewport();
            });
            
            if (isMainDrawPage) {
                container.querySelector('.maximize').addEventListener('click', (e) => {
                    const btn = e.currentTarget;
                    const isMaximized = container.classList.toggle('excalidraw-maximized');
                    
                    // 기존에 떠있을 수 있는 복제본 제거
                    container.querySelector('.maximized-body-search')?.remove();
                    
                    if (isMaximized) {
                        container.style.position = 'fixed';
                        container.style.top = '0';
                        container.style.left = '0';
                        container.style.width = '100vw';
                        container.style.height = '100vh';
                        container.style.zIndex = '9999';
                        container.style.margin = '0';
                        container.style.borderRadius = '0';
                        container.style.border = 'none';
                        
                        const controls = container.querySelector('.excalidraw-controls');
                        if (controls) controls.style.right = '30px';

                        btn.innerHTML = `<svg class="maximize-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6m10-6h-6v6M20 4l-6 6M4 20l6-6"/></svg>`;
                        btn.setAttribute('title', '원래대로');
                        
                        // 하단 본문검색 바 삽입
                        const originalSearchContainer = document.querySelector('.body-search-container');
                        if (originalSearchContainer) {
                            const floatingSearch = document.createElement('div');
                            floatingSearch.className = 'maximized-body-search';
                            floatingSearch.style.cssText = `
                                position: absolute;
                                bottom: 20px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: var(--q-light, #ffffff);
                                border: 1.5px solid var(--q-lightgray, #e5e5e5);
                                border-radius: 8px;
                                padding: 8px 12px;
                                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                                z-index: 10000;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                width: 90%;
                                max-width: 480px;
                            `;
                            
                            // 인풋 및 컨트롤 생성
                            floatingSearch.innerHTML = `
                                <input type="text" class="floating-search-input" placeholder="본문 내 검색..." style="flex: 1; padding: 6px 10px; border: 1px solid var(--q-lightgray); background: var(--q-light); color: var(--q-dark); border-radius: 6px; font-size: 13px; outline: none;" autocomplete="off" />
                                <div class="floating-search-controls" style="display: none; align-items: center; gap: 6px;">
                                    <span class="floating-search-count" style="color: var(--q-gray); font-size: 12px; font-family: var(--q-font-code);">0/0</span>
                                    <button class="floating-search-prev" style="background: var(--q-lightgray); border: none; border-radius: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--q-darkgray); font-weight: bold;">↑</button>
                                    <button class="floating-search-next" style="background: var(--q-lightgray); border: none; border-radius: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--q-darkgray); font-weight: bold;">↓</button>
                                    <button class="floating-search-clear" style="background: var(--q-lightgray); border: none; border-radius: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--q-darkgray); font-weight: bold;">×</button>
                                </div>
                            `;
                            
                            container.appendChild(floatingSearch);
                            
                            // 기존 사이드바 본문검색 요소를 찾아서 동기화
                            const origInput = document.getElementById('body-search-input');
                            const origPrev = document.getElementById('body-search-prev');
                            const origNext = document.getElementById('body-search-next');
                            const origClear = document.getElementById('body-search-clear');
                            const origCount = document.getElementById('body-search-count');
                            const origControls = document.getElementById('body-search-controls');
                            
                            const floatInput = floatingSearch.querySelector('.floating-search-input');
                            const floatControls = floatingSearch.querySelector('.floating-search-controls');
                            const floatCount = floatingSearch.querySelector('.floating-search-count');
                            const floatPrev = floatingSearch.querySelector('.floating-search-prev');
                            const floatNext = floatingSearch.querySelector('.floating-search-next');
                            const floatClear = floatingSearch.querySelector('.floating-search-clear');
                            
                            // 기존 검색어 복사 및 컨트롤 초기화
                            if (origInput && origInput.value) {
                                floatInput.value = origInput.value;
                                floatControls.style.display = origControls.style.display;
                                floatCount.textContent = origCount.textContent;
                            }
                            
                            // 실시간 이벤트 바인딩 및 양방향 싱크
                            floatInput.addEventListener('input', () => {
                                if (origInput) {
                                    origInput.value = floatInput.value;
                                    origInput.dispatchEvent(new Event('input'));
                                    
                                    // 카운트 및 컨트롤 가시성 갱신
                                    setTimeout(() => {
                                        floatControls.style.display = origControls.style.display;
                                        floatCount.textContent = origCount.textContent;
                                    }, 10);
                                }
                            });
                            
                            floatInput.addEventListener('keydown', (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (e.shiftKey) { floatPrev.click(); } else { floatNext.click(); }
                                }
                            });
                            
                            floatPrev.addEventListener('click', () => {
                                origPrev?.click();
                                setTimeout(() => { floatCount.textContent = origCount.textContent; }, 10);
                            });
                            floatNext.addEventListener('click', () => {
                                origNext?.click();
                                setTimeout(() => { floatCount.textContent = origCount.textContent; }, 10);
                            });
                            floatClear.addEventListener('click', () => {
                                floatInput.value = '';
                                floatControls.style.display = 'none';
                                origClear?.click();
                            });
                            
                            // 기존 사이드바 입력 시 팝업 검색창 상태 동적 동기화
                            const origObserver = new MutationObserver(() => {
                                floatControls.style.display = origControls.style.display;
                                floatCount.textContent = origCount.textContent;
                            });
                            if (origCount && origControls) {
                                origObserver.observe(origCount, { characterData: true, childList: true });
                                origObserver.observe(origControls, { attributes: true, attributeFilter: ['style'] });
                            }
                            
                            // 포커스
                            setTimeout(() => { floatInput.focus(); }, 100);
                        }
                    } else {
                        container.style.position = 'relative';
                        container.style.top = '';
                        container.style.left = '';
                        container.style.width = '100%';
                        container.style.height = '650px';
                        container.style.zIndex = '';
                        container.style.margin = '1.5rem auto';
                        container.style.borderRadius = '8px';
                        container.style.border = '1.5px solid var(--q-lightgray)';
                        
                        const controls = container.querySelector('.excalidraw-controls');
                        if (controls) controls.style.right = '10px';

                        btn.innerHTML = `<svg class="maximize-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
                        btn.setAttribute('title', '크게 보기');
                    }
                    setTimeout(() => {
                        fitToViewport();
                    }, 150);
                });
            }
 
            // Auto fit
            setTimeout(() => {
                fitToViewport();
                
                const nested = container.querySelectorAll('.interactive-excalidraw:not([data-loaded])');
                if (nested.length > 0) {
                    window.initInteractiveExcalidraw();
                }
            }, 100);
            
        } catch (err) {
            console.error('Failed to parse and render Excalidraw:', err);
            container.innerHTML = '<div style="padding: 1rem; color: var(--q-gray); font-size: 0.9rem; text-align: center;">Failed to render drawing.</div>';
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.initInteractiveExcalidraw, 300);
});

if (typeof module !== 'undefined') {
    module.exports = { QuartzSearch, QuartzGraphPixi, QuartzTOC, QuartzBacklinks, initQuartzFeatures };
}
