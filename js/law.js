
document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const wrapper = document.querySelector('.law-container-wrapper');
    const searchInput = document.getElementById('lawSearchInput');
    const searchBtn = document.getElementById('lawSearchBtn');
    const searchClear = document.getElementById('lawSearchClear');
    const resultsContainer = document.getElementById('searchResults');

    // Data Stores
    let lawData = [];       // Content data for search (law_data.json)
    let lawMetadata = [];   // Metadata (unused for rendering now)

    // === Global Helper Functions ===
    // (Preserve existing helpers)

    window.expandSnippets = function (btn) {
        const parent = btn.closest('.result-snippets');
        parent.querySelectorAll('.snippet.hidden').forEach(el => {
            el.classList.remove('hidden');
        });
        btn.remove();
    };

    window.toggleFullText = function (e, btn) {
        e.stopPropagation();
        const parent = btn.closest('.snippet');
        const fullText = parent.querySelector('.snippet-full-text');
        const snippetText = parent.querySelector('.snippet-text');

        if (fullText.classList.contains('active')) {
            fullText.classList.remove('active');
            snippetText.style.display = 'block';
            btn.textContent = '전체보기';
        } else {
            fullText.classList.add('active');
            snippetText.style.display = 'none';
            btn.textContent = '간략히 보기';
        }
    };

    window.toggleMaximizeResults = function (btn) {
        const searchOverlay = document.getElementById('searchOverlay');
        const isMaximized = searchOverlay.classList.contains('maximized');

        if (isMaximized) {
            searchOverlay.classList.remove('maximized');
            document.body.style.overflow = '';
            btn.textContent = '크게 보기';
        } else {
            searchOverlay.classList.add('maximized');
            document.body.style.overflow = 'hidden';
            btn.textContent = '작게 보기';
        }
    };

    //Unified Toggle Function (Exposed to window for HTML onclick)
    window.toggleAccordion = function (header) {
        if (!header) return;

        const e = window.event;
        if (e && e.target.closest('.btn-external')) return;

        const item = header.closest('.accordion-item');
        if (!item) return;

        const isOpen = item.classList.contains('expanded');
        const iframe = item.querySelector('iframe');
        const resultsActive = resultsContainer.classList.contains('active');

        if (!isOpen) {
            item.classList.add('expanded');
            if (resultsActive) {
                wrapper.classList.add('split-view');
            }

            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            if (iframe && iframe.dataset.src && (!iframe.src || iframe.src === 'about:blank')) {
                iframe.src = iframe.dataset.src;
            }
        } else {
            item.classList.remove('expanded');
            const anyOtherOpen = document.querySelector('.accordion-item.expanded');
            if (!anyOtherOpen && !resultsActive) {
                wrapper.classList.remove('split-view');
            }
        }
    };

    // Close Search
    window.closeSearchResults = function () {
        const resultsHeader = document.getElementById('searchResultsHeader');

        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('active');
        resultsContainer.classList.remove('maximized');

        resultsHeader.innerHTML = '';
        resultsHeader.classList.remove('active');
        resultsHeader.classList.remove('maximized');
        resultsHeader.style.display = 'none';

        document.getElementById('searchOverlay').classList.remove('maximized');
        document.body.style.overflow = '';

        if (window.innerWidth > 1024) {
            const wrapper = document.querySelector('.law-container-wrapper');
            wrapper.classList.remove('split-view');
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('expanded');
            });
        }
    };

    // Scroll To Result
    // Scroll To Result (Unified Function)
    window.scrollToResult = function (lawId, subTarget = null, attempts = 5) {
        const tryScroll = (attemptsLeft) => {
            if (attemptsLeft <= 0) return;

            // Target: Either the specific snippet (subTarget) or the Law Header
            const target = subTarget || document.getElementById(`result-item-${lawId}`);
            if (!target) {
                setTimeout(() => tryScroll(attemptsLeft - 1), 100);
                return;
            }

            const overlay = document.querySelector('.search-overlay.maximized');
            // In split-view, we want .results-content. 
            // In maximized overlay, we might want .search-results or .results-content.
            // Using querySelector('.results-content') is usually safer as it's the scrollable part.
            let container = overlay ?
                (overlay.querySelector('.results-content') || overlay.querySelector('.search-results')) :
                document.querySelector('.results-content');

            // If container isn't found or doesn't look scrollable (height 0?), retry
            if (!container) {
                setTimeout(() => tryScroll(attemptsLeft - 1), 100);
                return;
            }

            // Check if styles are applied (e.g. split-view transition)
            // Can check if container has height
            if (container.scrollHeight <= 0) {
                setTimeout(() => tryScroll(attemptsLeft - 1), 100);
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const elementRect = target.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top;

            // Adjust offset: -60 for Header buffering, or less for sticky header
            // The sticky header is inside the results-content? No, it's above it usually?
            // In law.css: .results-sticky-wrapper is IN .search-results bu BEFORE .results-content?
            // Actually .results-sticky-wrapper is inserted into resultsHeader which is BEFORE resultsContainer?
            // Let's assume -60 is a good safe buffer.

            container.scrollTo({
                top: container.scrollTop + relativeTop - 60,
                behavior: 'auto' // Instant for better reliability during transitions
            });

            // If we are retrying, we should check if it actually worked? 
            // Or just enforce it a few times?
            // Enforcing a few times (layout shift) is safer.
            // But we should space them out.
            if (attemptsLeft > 1) {
                setTimeout(() => tryScroll(attemptsLeft - 1), 100);
            }
        };

        tryScroll(attempts);
    };


    // === Data Loading & Dynamic Rendering ===

    // EMERGENCY RESTORE: Do NOT clear HTML. Use existing Hardcoded HTML.
    // Disabling dynamic render to fix "blank screen" issue.

    // Just initialize events on the existing DOM elements
    initFilterEvents();
    updateSelectAllState();

    // 2. Load Content for Search (Async) - Functionality Keep
    fetch('law_data.json')
        .then(r => r.json())
        .catch(e => { console.error('Failed to load content', e); return []; })
        .then(content => {
            lawData = parseLawContent(content);
            console.log(`Content Loaded: ${lawData.length} Search Items`);
        });


    // === Rendering Functions (Kept for future use if needed, but not called) ===

    function renderFilters(list) {
        // ... existing code ...
    }

    function renderLawList(list) {
        // ... existing code ...
    }

    function createAccordionItem(item) {
        // ... existing code ...
    }


    // === Filter Event Logic ===
    function initFilterEvents() {
        const toggleFiltersBtn = document.getElementById('btnToggleFilters');
        const filterOptions = document.getElementById('filterOptions');
        const selectAllCb = document.getElementById('filterSelectAll');

        // Toggle Button
        if (toggleFiltersBtn) {
            toggleFiltersBtn.onclick = () => {
                filterOptions.classList.toggle('hidden');
                toggleFiltersBtn.textContent = filterOptions.classList.contains('hidden') ? '상세 선택 ▼' : '접기 ▲';
            };
        }

        // Select All
        if (selectAllCb) {
            selectAllCb.addEventListener('change', (e) => {
                const checked = e.target.checked;
                document.querySelectorAll('input[name="lawFilter"]').forEach(cb => cb.checked = checked);
                document.querySelectorAll('.group-filter').forEach(cb => cb.checked = checked);
                if (searchInput.value.trim()) performSearch();
            });
        }

        // Group Filters
        document.querySelectorAll('.group-filter').forEach(groupCb => {
            groupCb.addEventListener('change', (e) => {
                const checked = e.target.checked;
                const group = e.target.closest('.filter-group');
                group.querySelectorAll('input[name="lawFilter"]').forEach(cb => cb.checked = checked);
                updateSelectAllState();
                if (searchInput.value.trim()) performSearch();
            });
        });

        // Individual Filters
        document.querySelectorAll('input[name="lawFilter"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const group = cb.closest('.filter-group');
                const groupCb = group.querySelector('.group-filter');
                const groupCbs = group.querySelectorAll('input[name="lawFilter"]');
                groupCb.checked = Array.from(groupCbs).every(c => c.checked);
                updateSelectAllState();
                if (searchInput.value.trim()) performSearch();
            });
        });
    }

    function updateSelectAllState() {
        const allFilters = document.querySelectorAll('input[name="lawFilter"]');
        const selectAllCb = document.getElementById('filterSelectAll');
        if (selectAllCb && allFilters.length > 0) {
            selectAllCb.checked = Array.from(allFilters).every(c => c.checked);
        }
    }


    // === Search & Parse Logic (Preserved) ===

    function parseLawContent(rawData) {
        return rawData.map(law => {
            const content = law.content;
            const articles = [];
            const articleRegex = /(?:^|\n)\s*제(\d+)(조(?:의\d+)?)(?:\(([^)]+)\))?/g;
            let articleMatch;

            while ((articleMatch = articleRegex.exec(content)) !== null) {
                const mainNum = articleMatch[1];
                const suffix = articleMatch[2];
                const title = articleMatch[3] ? articleMatch[3] : '';
                const fullIdentifier = mainNum + suffix;

                articles.push({
                    num: fullIdentifier,
                    title: title,
                    index: articleMatch.index,
                    fullLabel: `제${fullIdentifier}` + (title ? `(${title})` : '')
                });
            }

            for (let i = 0; i < articles.length; i++) {
                const current = articles[i];
                const next = articles[i + 1];
                const endIndex = next ? next.index : content.length;
                current.fullText = content.substring(current.index, endIndex);
            }

            const articleMap = new Map();
            articles.forEach(article => {
                const existing = articleMap.get(article.num);
                if (!existing || article.fullText.length > existing.fullText.length) {
                    articleMap.set(article.num, article);
                }
            });

            return {
                ...law,
                parsedArticles: Array.from(articleMap.values()).sort((a, b) => a.index - b.index)
            };
        });
    }

    let currentSearchTerms = [];

    function performSearch() {
        let query = searchInput.value.trim();
        // Normalize terms
        query = query.replace(/(\d+)\s+조/g, '$1조');
        query = query.replace(/조\s+의/g, '조의');
        query = query.replace(/의\s+(\d+)/g, '의$1');

        if (!query) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('active');
            updateClearButton();
            return;
        }

        if (query.length < 2) {
            alert('검색어는 2글자 이상 입력해주세요.');
            return;
        }

        // Search Modes
        let searchMode = 'simple';
        let searchTerms = [];
        if (query.includes('|')) {
            searchMode = 'or';
            searchTerms = query.split('|').map(t => t.trim()).filter(t => t.length > 0);
        } else if (query.includes(' ')) {
            searchMode = 'and';
            searchTerms = query.split(/\s+/).map(t => t.trim()).filter(t => t.length > 0);
        } else {
            searchTerms = [query];
        }
        currentSearchTerms = searchTerms;

        const checkedFilters = Array.from(document.querySelectorAll('input[name="lawFilter"]:checked')).map(cb => cb.value);
        if (checkedFilters.length === 0) {
            alert('검색할 법령을 하나 이상 선택해주세요.');
            return;
        }

        const results = lawData.flatMap(law => {
            if (!checkedFilters.includes(law.id)) return [];
            if (!law.parsedArticles) return [];

            const matches = [];
            law.parsedArticles.forEach(article => {
                const content = article.fullText;
                let articleMatches = [];
                let matchedTerms = [];

                searchTerms.forEach(term => {
                    let startIndex = 0;
                    let termMatches = [];
                    while ((startIndex = content.indexOf(term, startIndex)) > -1) {
                        const start = Math.max(0, startIndex - 30);
                        const cleanStart = content.lastIndexOf('\n', start);
                        const finalStart = (cleanStart > -1 && (start - cleanStart) < 80) ? cleanStart : start;
                        const end = Math.min(content.length, startIndex + term.length + 50);

                        // Filter Junk
                        const tocPatternCount = (content.substring(finalStart, end).match(/제\d+(?:의\d+)?조\(/g) || []).length;
                        const chapterPatternCount = (content.substring(finalStart, end).match(/제\d+장/g) || []).length;
                        const junkKeywords = ['화면내검색', '새창 선택', '판례', '연혁', '위임행정규칙'];

                        if (tocPatternCount > 1 || chapterPatternCount > 1 || junkKeywords.some(kw => content.substring(finalStart, end).includes(kw))) {
                            startIndex += term.length;
                            continue;
                        }

                        termMatches.push({ term, start: finalStart, end });
                        startIndex += term.length;
                    }

                    if (termMatches.length > 0) {
                        matchedTerms.push(term);
                        articleMatches = articleMatches.concat(termMatches);
                    }
                });

                let shouldInclude = false;
                if (searchMode === 'simple' || searchMode === 'or') shouldInclude = matchedTerms.length > 0;
                else if (searchMode === 'and') shouldInclude = matchedTerms.length === searchTerms.length;

                if (shouldInclude && articleMatches.length > 0) {
                    const uniqueSnippets = [];
                    const seenRanges = [];
                    articleMatches.forEach(m => {
                        const isDuplicate = seenRanges.some(r => (m.start >= r.start && m.start <= r.end) || (m.end >= r.start && m.end <= r.end));
                        if (!isDuplicate) {
                            let snippetText = content.substring(m.start, m.end);
                            searchTerms.forEach(term => snippetText = snippetText.replace(new RegExp(term, 'g'), `<mark>${term}</mark>`));
                            uniqueSnippets.push(snippetText);
                            seenRanges.push({ start: m.start, end: m.end });
                        }
                    });

                    if (uniqueSnippets.length > 0) {
                        matches.push({
                            articleNum: article.num,
                            articleLabel: article.fullLabel + (uniqueSnippets.length > 1 ? ` (${uniqueSnippets.length}곳)` : ''),
                            snippet: uniqueSnippets.slice(0, 3).join(' ... <br><br> ... '),
                            fullText: article.fullText
                        });
                    }
                }
            });

            if (matches.length > 0) {
                return { id: law.id, title: law.title, count: matches.length, matches };
            }
            return [];
        });

        const displayQuery = searchMode === 'or' ? searchTerms.join(' OR ') : searchMode === 'and' ? searchTerms.join(' AND ') : query;
        displayResults(results, displayQuery);
    }

    // Reuse displayResults but update its innerHTML calls to be safe if element missing? 
    // displayResults is defined within scope, same as before.

    function displayResults(results, query) {
        const resultsHeader = document.getElementById('searchResultsHeader');
        if (!resultsHeader) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            resultsContainer.classList.add('active');
            resultsHeader.style.display = 'none';
            updateClearButton();
            return;
        }

        let headerHtml = `
            <div class="results-sticky-wrapper">
                <div class="results-header">
                    <span>'${query}' 검색 결과: 총 ${results.length}개의 법령에서 발견</span>
                    <div class="results-actions">
                        <button class="btn-close-results" onclick="closeSearchResults()">닫기</button>
                    </div>
                </div>
                <div class="results-nav">
                    ${results.map(item => {
            let chipTitle = item.title.replace('개발제한구역의 지정 및 관리에 관한 특별조치법', '개발제한구역법').replace('국토의 계획 및 이용에 관한 법률', '국계법');
            return `<div class="nav-chip" id="nav-chip-${item.id}" onclick="scrollToResult('${item.id}')">
                        ${chipTitle} (${item.count})
                        <span class="chip-remove" onclick="removeFilter(event, '${item.id}')" title="제외">✕</span>
                    </div>`;
        }).join('')}
                </div>
            </div>`;

        let contentHtml = `<div class="results-content">`;
        results.forEach(item => {
            const visible = item.matches.slice(0, 5);
            const hidden = item.matches.slice(5);
            contentHtml += `
                <div class="result-item" id="result-item-${item.id}">
                    <div class="result-title"><h3>${item.title} <span class="badge">${item.count}건</span></h3></div>
                    <div class="result-snippets">
                        ${visible.map(m => createSnippetHtml(item.id, m)).join('')}
                        ${hidden.map(m => createSnippetHtml(item.id, m, true)).join('')}
                        ${hidden.length > 0 ? `<div class="snippet-more" onclick="expandSnippets(this)">+${hidden.length} 더보기 (전체 펼치기)</div>` : ''}
                    </div>
                </div>`;
        });
        contentHtml += '</div>';

        resultsHeader.innerHTML = headerHtml;
        resultsHeader.classList.add('active');
        resultsHeader.style.display = 'block';

        resultsContainer.innerHTML = contentHtml;
        resultsContainer.classList.add('active');

        if (document.querySelector('.accordion-item.expanded')) {
            wrapper.classList.add('split-view');
        }
    }

    function createSnippetHtml(lawId, match, isHidden = false) {
        let fullTextHtml = match.fullText ? match.fullText : '';
        // Apply highlighting to full text
        if (fullTextHtml && currentSearchTerms && currentSearchTerms.length > 0) {
            // Sort terms by length desc to prevent partial replacement
            const sortedTerms = [...currentSearchTerms].sort((a, b) => b.length - a.length);
            sortedTerms.forEach(term => {
                // Simple regex replacement (careful with HTML if present, but here it assumes plain text)
                fullTextHtml = fullTextHtml.replace(new RegExp(term, 'g'), `<mark>${term}</mark>`);
            });
        }

        const viewFullBtn = match.fullText ? `<button class="btn-view-full" onclick="toggleFullText(event, this)">전체보기</button>` : '';
        const fullTextDiv = match.fullText ? `<div class="snippet-full-text">${fullTextHtml}</div>` : '';

        return `
            <div class="snippet clickable ${isHidden ? 'hidden' : ''}" onclick="openLaw('${lawId}', '${match.articleNum}', this)">
                <div class="snippet-header">
                    <div class="snippet-label">${match.articleLabel}</div>
                    ${viewFullBtn}
                </div>
                <div class="snippet-text">${match.snippet}</div>
                ${fullTextDiv}
            </div>
        `;
    }

    // Unified scroll function for both nav chips and snippets
    window.scrollToResult = function (lawId, subTarget = null, attempts = 1) {
        const resultsContent = document.querySelector('.results-content');
        const targetItem = document.getElementById(`result-item-${lawId}`); // Assuming result-item-${lawId} for the main item

        if (!resultsContent || !targetItem) return;

        const performScroll = (currentAttempts) => {
            if (currentAttempts <= 0) return;

            if (subTarget) {
                // Scroll to a specific snippet within the results content
                const containerRect = resultsContent.getBoundingClientRect();
                const elementRect = subTarget.getBoundingClientRect();

                const relativeTop = elementRect.top - containerRect.top;

                resultsContent.scrollTo({
                    top: resultsContent.scrollTop + relativeTop - 60, // 60px buffer for header/context
                    behavior: 'auto'
                });
            } else {
                // Scroll to the main result item (e.g., from nav chip)
                const containerRect = resultsContent.getBoundingClientRect();
                const itemRect = targetItem.getBoundingClientRect();
                const relativeTop = itemRect.top - containerRect.top;

                resultsContent.scrollTo({
                    top: resultsContent.scrollTop + relativeTop - 10, // Small buffer for main item
                    behavior: 'smooth'
                });
            }

            if (currentAttempts > 1) {
                setTimeout(() => performScroll(currentAttempts - 1), 100);
            }
        };

        performScroll(attempts);
    };

    // Window global openLaw (Needs to access wrapper, toggles etc)
    window.openLaw = function (lawId, articleNum, element) {
        // Highlight logic + Scroll clicked snippet into view in sidebar
        if (element) {
            document.querySelectorAll('.snippet.active-result').forEach(el => el.classList.remove('active-result'));
            element.classList.add('active-result');

            // Use the unified scrollToResult to handle the scrolling
            // passing the element as the specific target
            scrollToResult(lawId, element, 5);
        }

        // Highlight the law in the sticky wrapper (nav-chip)
        document.querySelectorAll('.nav-chip.active').forEach(el => el.classList.remove('active'));
        const navChip = document.getElementById(`nav-chip-${lawId}`);
        if (navChip) {
            navChip.classList.add('active');
            // Optional: Ensure the chip itself is visible in the horizontal scroll (if applicable)
            navChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        const targetItem = document.getElementById(lawId);
        if (!targetItem) return;

        // Close others if needed, but 'toggleAccordion' logic usually handles this? 
        // We probably just want to ensure THIS one is open.
        // Let's rely on standard classes.

        const isAlreadyExpanded = targetItem.classList.contains('expanded');

        if (!isAlreadyExpanded) {
            // Close others first if that's the desired behavior (usually is for accordion)
            document.querySelectorAll('.accordion-item.expanded').forEach(other => {
                if (other !== targetItem) other.classList.remove('expanded');
            });
            targetItem.classList.add('expanded');
        }

        wrapper.classList.add('split-view');

        // Scroll main view to the accordion item (optional, but good for context)
        setTimeout(() => {
            // Scroll sidebar/content area? No, scroll the list item into view if it was hidden?
            // Actually, if we are in split view, the list might be on the left.
            // Let's scroll the item into view just in case.
            targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);


        // --- IFRAME LOGIC ---
        const iframe = targetItem.querySelector('iframe');
        if (iframe && iframe.dataset.src) {
            let baseSrc = iframe.dataset.src;
            let targetSrc = baseSrc; // Start with base

            // Append Article Anchor if provided
            if (articleNum) {
                // Parse "제2조" or "제2조의2"
                // Standard format for law.go.kr: #J{articleNum}:0
                // For "2조의2", it is usually J2:2 or comparable.
                // Let's try purely numeric extraction.

                const match = articleNum.match(/(?:제)?(\d+)조(?:의(\d+))?/);
                if (match) {
                    const mainArticle = match[1];
                    const subArticle = match[2] ? match[2] : '0';
                    const anchor = `#J${mainArticle}:${subArticle}`;
                    targetSrc = baseSrc + anchor;
                }
            }

            // Force update:
            // 1. If iframe is empty (about:blank or empty src), load target.
            // 2. If iframe is already at baseSrc but we have a NEW anchor, we must triggers navigation.
            // 3. If iframe is already at targetSrc, we might need to force reload to jump again? 
            //    (Browsers sometimes don't jump if hash is same. But usually clicking same link with hash jumps.)

            if (!iframe.src || iframe.src === 'about:blank' || iframe.src !== targetSrc) {
                iframe.src = targetSrc;
            } else {
                // Src is identical. Force a "refresh" of the hash to trigger scroll.
                // Resetting src to itself usually works for iframes to reload.
                iframe.src = targetSrc;
            }
        }
    };

    // Events
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
    searchInput.addEventListener('input', updateClearButton);
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        updateClearButton();
    });

    function updateClearButton() {
        if (searchInput.value.trim().length > 0) searchClear.classList.remove('hidden');
        else searchClear.classList.add('hidden');
    }

    updateClearButton();

    window.removeFilter = function (e, lawId) {
        e.stopPropagation();
        const checkbox = document.querySelector(`input[name="lawFilter"][value="${lawId}"]`);
        if (checkbox) {
            checkbox.checked = false;

            // Update Group Checkbox
            const group = checkbox.closest('.filter-group');
            if (group) {
                const groupCb = group.querySelector('.group-filter');
                const groupCbs = group.querySelectorAll('input[name="lawFilter"]');
                if (groupCb) groupCb.checked = Array.from(groupCbs).every(c => c.checked);
            }

            updateSelectAllState();
            performSearch();
        }
    };

    // --- Resizer Implementation ---
    const searchLayout = document.getElementById('searchOverlay');
    if (searchLayout) {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        // Insert resizer after the search overlay
        if (searchLayout.nextSibling) {
            searchLayout.parentNode.insertBefore(resizer, searchLayout.nextSibling);
        } else {
            searchLayout.parentNode.appendChild(resizer);
        }

        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = e.clientX - searchLayout.getBoundingClientRect().left;

            // Constraints
            const minW = 280;
            const maxW = window.innerWidth * 0.6;

            if (newWidth >= minW && newWidth <= maxW) {
                searchLayout.style.setProperty('--sidebar-width', `${newWidth}px`);
                // Force width update (redundancy for safety)
                searchLayout.style.width = `${newWidth}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizer.classList.remove('resizing');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
});
