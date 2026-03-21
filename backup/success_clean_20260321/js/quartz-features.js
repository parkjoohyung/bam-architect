/**
 * Quartz-style Search and Graph View Features
 * Based on: https://quartz.jzhao.xyz/
 * Uses PixiJS + D3.js for WebGL-based graph rendering
 */

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

        // Convert Logseq bullet format (leading - ) to standard markdown
        content = content.replace(/^(\t*)- /gm, '$1');

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
    }

    markdownToHtml(md) {
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
        this.prepareData();
        await this.createPixiApp();
        this.createSimulation();
        this.createGraphics();
        this.addZoomDrag();
        this.addGlobalButton();
        this.startAnimation();
    }

    prepareData() {
        this.nodes = this.posts.map(post => ({
            id: post.id,
            title: post.title,
            isCurrent: post.id === this.currentPostId,
            x: this.width / 2 + (Math.random() - 0.5) * 50,
            y: this.height / 2 + (Math.random() - 0.5) * 50
        }));

        this.links = [];
        this.posts.forEach(post => {
            if (post.links) {
                post.links.forEach(targetId => {
                    if (this.nodes.find(n => n.id === targetId)) {
                        this.links.push({ source: post.id, target: targetId });
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
            this.app.canvas.style.background = '#1e1e20';

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
            .style('background', '#1e1e20')
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
            const color = node.isCurrent ? this.colors.current : this.colors.normal;

            const gfx = new PIXI.Graphics();
            gfx.circle(0, 0, radius);
            gfx.fill(color);
            gfx.eventMode = 'static';
            gfx.cursor = 'pointer';

            gfx.on('pointerover', () => this.onNodeHover(node));
            gfx.on('pointerout', () => this.onNodeOut());
            gfx.on('pointerdown', (e) => this.onNodeDragStart(e, node));
            gfx.on('click', () => this.onNodeClick(node));

            this.nodeContainer.addChild(gfx);

            // Create label
            const label = new PIXI.Text({
                text: node.title.length > 12 ? node.title.slice(0, 12) + '...' : node.title,
                style: {
                    fontSize: 10,
                    fill: this.colors.labelColor,
                    fontFamily: 'system-ui, sans-serif'
                }
            });
            label.anchor.set(0.5, -0.5);
            label.alpha = 0;
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

        // Show label
        const nodeData = this.nodeGraphics.find(n => n.node.id === node.id);
        if (nodeData) {
            nodeData.label.alpha = 1;
        }
    }

    onNodeOut() {
        this.hoveredNodeId = null;
        this.updateHighlight();

        // Hide all labels
        this.nodeGraphics.forEach(n => {
            n.label.alpha = 0;
        });
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

        // Update nodes
        this.nodeGraphics.forEach(({ node, gfx }) => {
            if (this.hoveredNodeId) {
                gfx.alpha = connectedIds.has(node.id) ? 1 : 0.2;
            } else {
                gfx.alpha = 1;
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
        const wrapper = this.container.querySelector('.quartz-graph-wrapper');
        if (!wrapper) return;

        const button = document.createElement('button');
        button.className = 'quartz-graph-global-btn';
        button.title = 'Open full graph view';
        button.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    background: rgba(0, 0, 0, 0.8);
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
    background: #1e1e20;
    border: 1px solid #393639;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.quartz-search-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #393639;
    background: #161618;
    flex-shrink: 0;
}

.quartz-search-header svg {
    color: #888;
    flex-shrink: 0;
}

#quartz-search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    color: #e0e0e0;
    outline: none;
    font-family: inherit;
}

#quartz-search-input::placeholder {
    color: #666;
}

.quartz-search-header kbd {
    padding: 0.25rem 0.5rem;
    background: #2a2a2a;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: monospace;
    color: #888;
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
    border-right: 1px solid #393639;
    overflow-y: auto;
    background: #161618;
    scrollbar-width: thin;
    scrollbar-color: #555 #1a1a1a;
}

.quartz-search-results::-webkit-scrollbar {
    width: 8px;
}

.quartz-search-results::-webkit-scrollbar-track {
    background: #1a1a1a;
}

.quartz-search-results::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
}

.quartz-search-preview {
    width: 68%;
    overflow: hidden;
    background: #1e1e20;
    display: flex;
    flex-direction: column;
}

.quartz-preview-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    scrollbar-width: thin;
    scrollbar-color: #555 #1a1a1a;
}

.quartz-preview-scroll::-webkit-scrollbar {
    width: 8px;
}

.quartz-preview-scroll::-webkit-scrollbar-track {
    background: #1a1a1a;
}

.quartz-preview-scroll::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
}

.quartz-search-empty {
    padding: 2rem;
    text-align: center;
    color: #888;
}

.quartz-search-result {
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.15s;
}

.quartz-search-result:hover,
.quartz-search-result.selected {
    background: rgba(123, 151, 170, 0.15);
    border-left-color: #7B97AA;
}

.quartz-search-result .result-title {
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 0.25rem;
}

.quartz-search-result .result-meta {
    font-size: 0.8rem;
    color: #666;
}

.quartz-search-result mark,
.quartz-search-preview mark {
    background: rgba(255, 230, 0, 0.4);
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
    color: #666;
}

.quartz-search-preview-empty svg {
    margin-bottom: 1rem;
}

.quartz-preview-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #393639;
}

.preview-breadcrumb {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.5rem;
}

.preview-meta {
    font-size: 0.85rem;
    color: #666;
    display: flex;
    gap: 1rem;
}

.preview-tags {
    color: #7B97AA;
}

.preview-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e0e0e0;
    margin: 0 0 1.5rem 0;
    line-height: 1.3;
}

.preview-content {
    font-size: 1.05rem;
    line-height: 1.75;
    color: #d4d4d4;
    font-family: 'Source Sans Pro', 'Noto Sans KR', sans-serif;
}

/* Headings - Blog Style */
.preview-content h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ebebec;
    margin: 2rem 0 1rem 0;
    line-height: 1.3;
    border-bottom: 1px solid #393639;
    padding-bottom: 0.5rem;
}

.preview-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ebebec;
    margin: 1.75rem 0 0.75rem 0;
    line-height: 1.4;
}

.preview-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #d4d4d4;
    margin: 1.5rem 0 0.5rem 0;
}

.preview-content h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #b0b0b0;
    margin: 1.25rem 0 0.5rem 0;
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
    color: #7b97aa;
}

/* Blockquote - Blog Style */
.preview-content blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.25rem;
    border-left: 4px solid #7b97aa;
    background: rgba(123, 151, 170, 0.1);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #b0b0b0;
}

.preview-content blockquote p {
    margin: 0;
}

/* Code - Blog Style */
.preview-content code {
    background: #2a2a2c;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
    color: #84a59d;
}

.preview-content pre {
    background: #1a1a1c;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.25rem 0;
    border: 1px solid #393639;
}

.preview-content pre code {
    background: none;
    padding: 0;
    font-size: 0.9rem;
    line-height: 1.6;
    color: #d4d4d4;
}

/* Links - Blog Style */
.preview-content a {
    color: #7b97aa;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
}

.preview-content a:hover {
    border-bottom-color: #7b97aa;
}

/* Internal Links (Wikilinks) */
.preview-content .internal-link {
    color: #84a59d;
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
    border-top: 1px solid #393639;
    margin: 2rem 0;
}

/* Strong and Em */
.preview-content strong {
    font-weight: 600;
    color: #ebebec;
}

.preview-content em {
    font-style: italic;
    color: #b0b0b0;
}

/* Graph */
.quartz-graph-global-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(42, 42, 42, 0.9);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    transition: all 0.2s;
    z-index: 10;
}

.quartz-graph-global-btn:hover {
    background: #7B97AA;
    color: white;
}

.quartz-global-graph-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.quartz-global-graph-container {
    width: 90%;
    height: 85%;
    background: #161618;
    border: 1px solid #393639;
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
    border-bottom: 1px solid #393639;
    flex-shrink: 0;
    background: #1e1e20;
}

.global-graph-header h3 {
    margin: 0;
    color: #e0e0e0;
}

.global-graph-close {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.global-graph-close:hover {
    background: #393639;
    color: #ebebec;
}

.global-graph-canvas {
    flex: 1;
    background: #161618;
}

.quartz-graph-container {
    height: 200px;
    position: relative;
    background: #1e1e20;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .quartz-search-container { width: 95%; height: 90vh; }
    .quartz-search-body { flex-direction: column; }
    .quartz-search-results { width: 100%; height: 40%; border-right: none; border-bottom: 1px solid #2a2a2a; }
    .quartz-search-preview { width: 100%; height: 60%; }
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

            // Adjust level (e.g. if starts with h2, make it indentation 0 or 1)
            html += `<li class="toc-depth-${level}"><a href="#${id}" data-for="${id}">${text}</a></li>`;
        });

        this.container.innerHTML = html;
        this.setupObserver(headers);
    }

    setupObserver(headers) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = this.container.querySelector(`a[data-for="${id}"]`);
                if (link) {
                    if (entry.isIntersecting) {
                        this.container.querySelectorAll('a').forEach(a => a.classList.remove('in-view'));
                        link.classList.add('in-view');
                    }
                }
            });
        }, {
            rootMargin: '-100px 0px -66%'
        });

        headers.forEach(header => observer.observe(header));
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
};

if (typeof module !== 'undefined') {
    module.exports = { QuartzSearch, QuartzGraphPixi, QuartzTOC, QuartzBacklinks, initQuartzFeatures };
}
