document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.law-container-wrapper');
    const toggles = document.querySelectorAll('.accordion-header');
    const searchInput = document.getElementById('lawSearchInput');
    const searchBtn = document.getElementById('lawSearchBtn');
    const searchClear = document.getElementById('lawSearchClear');
    const resultsContainer = document.getElementById('searchResults');
    let lawData = [];

    // Window global for expand function
    window.expandSnippets = function (btn) {
        const parent = btn.closest('.result-snippets');
        parent.querySelectorAll('.snippet.hidden').forEach(el => {
            el.classList.remove('hidden');
        });
        btn.remove(); // Remove the button itself
    };

    window.toggleFullText = function (e, btn) {
        e.stopPropagation(); // Prevent opening the accordion
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

    // Load Law Data
    fetch('law_data.json')
        .then(res => res.json())
        .then(data => {
            // Pre-process data: Parse articles once on load
            lawData = data.map(law => {
                const content = law.content;
                const articles = [];

                // Regex to find article headers: "제21조(Title)" or "제21조의2(Title)"
                const articleRegex = /(?:^|\n)\s*제(\d+)(조(?:의\d+)?)(?:\(([^)]+)\))?/g;
                let articleMatch;

                while ((articleMatch = articleRegex.exec(content)) !== null) {
                    const mainNum = articleMatch[1];
                    const suffix = articleMatch[2];
                    const title = articleMatch[3] ? articleMatch[3] : '';

                    const fullIdentifier = mainNum + suffix; // e.g. "21조", "21조의2"

                    articles.push({
                        num: fullIdentifier,
                        title: title,
                        index: articleMatch.index,
                        fullLabel: `제${fullIdentifier}` + (title ? `(${title})` : '')
                    });
                }

                // Calculate full text for each article
                for (let i = 0; i < articles.length; i++) {
                    const current = articles[i];
                    const next = articles[i + 1];
                    const endIndex = next ? next.index : content.length;
                    current.fullText = content.substring(current.index, endIndex);
                }

                // Filter duplicates: keep the one with the longest content (avoids TOC stubs)
                const uniqueArticles = [];
                const articleMap = new Map();

                articles.forEach(article => {
                    const existing = articleMap.get(article.num);
                    if (!existing) {
                        articleMap.set(article.num, article);
                    } else {
                        // Compare lengths
                        if (article.fullText.length > existing.fullText.length) {
                            articleMap.set(article.num, article);
                        }
                    }
                });

                // Convert map back to array and sort by index (to keep flow mostly correct, though logical order is by Num)
                // Actually, just sorting by Num might be safer for display, but file order is usually best.
                // Let's sort by index of the kept items.
                const keptArticles = Array.from(articleMap.values()).sort((a, b) => a.index - b.index);

                return {
                    ...law,
                    parsedArticles: keptArticles // Store parsed structure
                };
            });

            console.log('Law data loaded and parsed:', lawData.length, 'items');
        })
        .catch(err => console.error('Failed to load law data:', err));

    // Search Function
    function performSearch() {
        let query = searchInput.value.trim();
        currentSearchQuery = query; // Store for later use in openLaw

        // Normalize query: remove spaces in law article references
        // e.g. "21 조의 2" -> "21조의2", "21 조" -> "21조"
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

        // Parse OR/AND operators
        // OR: | (pipe) separator - any term matches
        // AND: space separator - all terms must match
        let searchMode = 'simple'; // 'simple', 'or', 'and'
        let searchTerms = [];

        if (query.includes('|')) {
            searchMode = 'or';
            searchTerms = query.split('|').map(t => t.trim()).filter(t => t.length > 0);
        } else if (query.includes(' ')) {
            searchMode = 'and';
            searchTerms = query.split(/\s+/).map(t => t.trim()).filter(t => t.length > 0);
        } else {
            searchMode = 'simple';
            searchTerms = [query];
        }

        // Get selected filters
        const checkedFilters = Array.from(document.querySelectorAll('input[name="lawFilter"]:checked')).map(cb => cb.value);

        if (checkedFilters.length === 0) {
            alert('검색할 법령을 하나 이상 선택해주세요.');
            return;
        }

        const results = lawData.flatMap(law => {
            // Filter based on selection
            if (!checkedFilters.includes(law.id)) return [];

            const matches = [];
            // Use pre-parsed articles
            if (!law.parsedArticles) return [];

            law.parsedArticles.forEach(article => {
                const content = article.fullText;
                let articleMatches = [];
                let matchedTerms = [];

                // Check each search term
                searchTerms.forEach(term => {
                    let startIndex = 0;
                    let termMatches = [];

                    while ((startIndex = content.indexOf(term, startIndex)) > -1) {
                        // Extract snippet: 30 chars before and 50 chars after
                        const start = Math.max(0, startIndex - 30);
                        const cleanStart = content.lastIndexOf('\n', start);
                        const finalStart = (cleanStart > -1 && (start - cleanStart) < 80) ? cleanStart : start;
                        const end = Math.min(content.length, startIndex + term.length + 50);

                        // Check if snippet looks like a TOC chunk
                        const tocPatternCount = (content.substring(finalStart, end).match(/제\d+(?:의\d+)?조\(/g) || []).length;
                        const chapterPatternCount = (content.substring(finalStart, end).match(/제\d+장/g) || []).length;
                        const junkKeywords = ['화면내검색', '새창 선택', '판례', '연혁', '위임행정규칙', '규제', '생활법령', '한눈에보기', '국토교통부', '044-', '부칙'];
                        const hasJunk = junkKeywords.some(kw => content.substring(finalStart, end).includes(kw));

                        if (tocPatternCount > 1 || chapterPatternCount > 1 || hasJunk) {
                            startIndex += term.length;
                            continue;
                        }

                        termMatches.push({
                            term: term,
                            start: finalStart,
                            end: end
                        });
                        startIndex += term.length;
                    }

                    if (termMatches.length > 0) {
                        matchedTerms.push(term);
                        articleMatches = articleMatches.concat(termMatches);
                    }
                });

                // Apply search mode logic
                let shouldInclude = false;
                if (searchMode === 'simple') {
                    shouldInclude = matchedTerms.length > 0;
                } else if (searchMode === 'or') {
                    shouldInclude = matchedTerms.length > 0; // At least one term matches
                } else if (searchMode === 'and') {
                    shouldInclude = matchedTerms.length === searchTerms.length; // All terms must match
                }

                if (shouldInclude && articleMatches.length > 0) {
                    // Build snippets with all matched terms highlighted
                    const uniqueSnippets = [];
                    const seenRanges = [];

                    articleMatches.forEach(m => {
                        // Avoid duplicate ranges
                        const isDuplicate = seenRanges.some(r =>
                            (m.start >= r.start && m.start <= r.end) ||
                            (m.end >= r.start && m.end <= r.end)
                        );
                        if (!isDuplicate) {
                            let snippetText = content.substring(m.start, m.end);
                            // Highlight all search terms
                            searchTerms.forEach(term => {
                                snippetText = snippetText.replace(new RegExp(term, 'g'), `<mark>${term}</mark>`);
                            });
                            uniqueSnippets.push(snippetText);
                            seenRanges.push({ start: m.start, end: m.end });
                        }
                    });

                    if (uniqueSnippets.length > 0) {
                        const combinedSnippet = uniqueSnippets.slice(0, 3).join(' ... <br><br> ... ');
                        const countLabel = uniqueSnippets.length > 1 ? ` <span class="match-count">(${uniqueSnippets.length}곳)</span>` : '';

                        matches.push({
                            articleNum: article.num,
                            articleLabel: article.fullLabel + countLabel,
                            snippet: combinedSnippet,
                            fullText: article.fullText
                        });
                    }
                }
            });

            if (matches.length > 0) {
                return {
                    id: law.id,
                    title: law.title,
                    count: matches.length,
                    matches: matches
                };
            }
            return [];
        });

        // Build display query for header
        const displayQuery = searchMode === 'or' ? searchTerms.join(' OR ') :
            searchMode === 'and' ? searchTerms.join(' AND ') : query;

        displayResults(results, displayQuery);
    }

    // Expose openLaw to window so onclick works
    window.openLaw = function (lawId, articleNum, element) {
        // If search results are maximized, minimize them to sidebar view
        const searchOverlay = document.getElementById('searchOverlay');
        const resultsContainer = document.getElementById('searchResults');

        if (searchOverlay && searchOverlay.classList.contains('maximized')) {
            const btn = document.querySelector('.btn-maximize-results');
            if (window.toggleMaximizeResults && btn) {
                window.toggleMaximizeResults(btn);
            } else {
                searchOverlay.classList.remove('maximized');
                document.body.style.overflow = '';
            }
        }

        // Highlight clicked result snippet
        if (element) {
            document.querySelectorAll('.snippet.active-result').forEach(el => el.classList.remove('active-result'));
            element.classList.add('active-result');

            // Scroll result container to this element
            // Scroll result container to this element securely
            // Use explicit scrollTop calculation to allow scrolling within the sidebar
            // WITHOUT triggering any window-level scrolling or layout shifts.
            const resultsContent = document.querySelector('.results-content');
            if (resultsContent) {
                setTimeout(() => {
                    const containerRect = resultsContent.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    const relativeTop = elementRect.top - containerRect.top;
                    const currentScroll = resultsContent.scrollTop;
                    const targetScroll = currentScroll + relativeTop - (containerRect.height / 2) + (elementRect.height / 2);

                    resultsContent.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }

        const targetItem = document.querySelector(`.accordion-item[data-law-id="${lawId}"]`);
        if (!targetItem) return;

        const wrapper = document.querySelector('.law-container-wrapper');
        const isAlreadySplit = wrapper.classList.contains('split-view');

        // Close previously opened laws when switching to a different one via search
        // This ensures only the relevant law for the clicked search result is shown
        document.querySelectorAll('.accordion-item.expanded').forEach(other => {
            if (other !== targetItem) {
                other.classList.remove('expanded');
            }
        });

        try {
            // Ensure target is open
            const wasExpanded = targetItem.classList.contains('expanded');
            if (!wasExpanded) {
                targetItem.classList.add('expanded');
            }
            wrapper.classList.add('split-view');

            // Scroll Logic
            // Use manual calculation with explicit offset to match CSS scroll-margin
            // and ensure precise positioning under the fixed header.
            const performScroll = () => {
                const headerOffset = 150; // Increased to match CSS scroll-margin-top
                const elementPosition = targetItem.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Only scroll if we are not already close (within 5px) to prevent jitter
                // This correction happens after layout stabilization
                if (Math.abs(window.pageYOffset - offsetPosition) > 5) {
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            };

            const scrollDelay = wasExpanded ? 0 : 150; // Zero delay if already open, else wait for anim

            setTimeout(performScroll, scrollDelay);

            // Sync Logic: If an articleNum is provided, navigate ALL expanded laws to that article
            const expandedItems = document.querySelectorAll('.accordion-item.expanded');

            expandedItems.forEach(item => {
                const iframe = item.querySelector('iframe');
                if (!iframe || !iframe.dataset.src) return;

                let baseSrc = iframe.dataset.src;
                let finalUrl = baseSrc;

                if (articleNum) {
                    const lsiSeqMatch = baseSrc.match(/lsiSeq=(\d+)/);
                    const ordinSeqMatch = baseSrc.match(/ordinSeq=(\d+)/);
                    const admRulSeqMatch = baseSrc.match(/admRulSeq=(\d+)/);

                    // Refined Regex to extract '제X조' and optional '의Y' strictly
                    // This creates a robust parser that ignores other numbers in the title (like dates, measurements)
                    // Example: "제3조의2(대수선의 범위)" -> Main: 3, Sub: 2
                    // Example: "제2조(정의)" -> Main: 2, Sub: 0

                    let mainArt = '0';
                    let subArt = '0';

                    const match = articleNum.match(/(?:제)?(\d+)조(?:의(\d+))?/);
                    if (match) {
                        mainArt = match[1];
                        subArt = match[2] || '0';
                    }

                    // INVESTIGATION RESULT:
                    // Both National Acts and Ordinances use LITERAL branch numbering in hashes.
                    // Example: "Article 2-2" -> #J2:2, ID: Y000202
                    // The previous logic that subtracted 1 for ordinances was incorrect based on latest checks.

                    const navSubArt = subArt;

                    // Correct joNo format: [4-digit jo][2-digit ui] + 000 (Total 9 digits)
                    const joNo = mainArt.padStart(4, '0') + navSubArt.padStart(2, '0') + '000';

                    // Correct Anchor Hash: #J{main}:{sub} using integers to match DOM
                    const hash = `#J${parseInt(mainArt, 10)}:${parseInt(navSubArt, 10)}`;

                    // Cross-origin iframes block contentWindow access
                    // Solution: For same law, change only the hash in iframe.src
                    // Browser should scroll without full reload when only hash changes

                    const getSeq = (url) => {
                        const m = url.match(/(lsiSeq|ordinSeq|admRulSeq)=(\d+)/);
                        return m ? m[0] : null;
                    };

                    const targetSeq = getSeq(baseSrc);
                    const currentSeq = iframe.src ? getSeq(iframe.src) : null;
                    const isSameLaw = targetSeq && currentSeq && (targetSeq === currentSeq);

                    if (isSameLaw && iframe.src && iframe.src !== 'about:blank') {
                        // Same law - change only the hash to avoid reload
                        const currentBase = iframe.src.split('#')[0];
                        const newSrc = currentBase + hash;

                        // Only update if hash actually changed
                        if (iframe.src !== newSrc) {
                            iframe.src = newSrc;
                        }
                    } else {
                        // Different law or first load - need full URL with joNo
                        let url = baseSrc.split('#')[0];

                        const updateParam = (uri, key, value) => {
                            const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
                            const separator = uri.indexOf('?') !== -1 ? "&" : "?";
                            if (uri.match(re)) {
                                return uri.replace(re, '$1' + key + "=" + value + '$2');
                            }
                            return uri + separator + key + "=" + value;
                        };

                        let finalUrl = updateParam(url, 'joNo', joNo);
                        finalUrl = updateParam(finalUrl, 'ancYnChk', '0');
                        finalUrl = finalUrl + hash;

                        iframe.src = finalUrl;
                    }
                } else if (!iframe.src || iframe.src === 'about:blank') {
                    // Just lazy load if no article specified
                    iframe.src = baseSrc;
                }
            });
        } catch (e) {
            console.error('Error opening/syncing law:', e);
        }
    };

    window.scrollToResult = function (lawId) {
        const element = document.getElementById(`result-item-${lawId}`);
        if (!element) return;

        // Check for maximized mode
        const overlay = document.querySelector('.search-overlay.maximized');

        if (overlay) {
            // In maximized mode, the scrollable container is the .search-results INSIDE the overlay
            const container = overlay.querySelector('.search-results');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const currentScroll = container.scrollTop;
                const relativeTop = elementRect.top - containerRect.top;

                // Scroll container
                container.scrollTo({
                    top: currentScroll + relativeTop - 20,
                    behavior: 'smooth'
                });
                return;
            }
        }

        // Normal mode / Sidebar mode
        // Use explicit scrollTop within .results-content to avoid window scrolling
        const normalContainer = document.querySelector('.results-content');
        if (normalContainer) {
            const containerRect = normalContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top;
            const currentScroll = normalContainer.scrollTop;

            normalContainer.scrollTo({
                top: currentScroll + relativeTop - 20,
                behavior: 'smooth'
            });
        }
    };

    function displayResults(results, query) {
        const resultsHeader = document.getElementById('searchResultsHeader');

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            resultsContainer.classList.add('active');
            resultsHeader.style.display = 'none'; // Hide header if no results
            updateClearButton();
            return;
        }

        // Header HTML
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
            // Shorten title for chips
            let chipTitle = item.title.replace('개발제한구역의 지정 및 관리에 관한 특별조치법', '개발제한구역법');

            return `
                        <div class="nav-chip" onclick="scrollToResult('${item.id}')">
                            ${chipTitle} (${item.count})
                        </div>
                    `}).join('')}
                </div>
            </div>`;

        // Content HTML
        let contentHtml = `<div class="results-content">`; // Start scrollable area wrapper

        results.forEach(item => {
            // Show first 5, hide rest
            const visible = item.matches.slice(0, 5);
            const hidden = item.matches.slice(5);

            contentHtml += `
                <div class="result-item" id="result-item-${item.id}">
                    <div class="result-title">
                        <h3>${item.title} <span class="badge">${item.count}건</span></h3>
                    </div>
                    <div class="result-snippets">
                        ${visible.map(m => {
                const fullTextHtml = m.fullText ? m.fullText.replace(new RegExp(query, 'g'), `<mark>${query}</mark>`) : '';
                const viewFullBtn = m.fullText ? `<button class="btn-view-full" onclick="toggleFullText(event, this)">전체보기</button>` : '';
                const fullTextDiv = m.fullText ? `<div class="snippet-full-text">${fullTextHtml}</div>` : '';

                return `
                            <div class="snippet clickable" onclick="openLaw('${item.id}', '${m.articleNum}', this)">
                                <div class="snippet-header">
                                    <div class="snippet-label">${m.articleLabel}</div>
                                    ${viewFullBtn}
                                </div>
                                <div class="snippet-text">${m.snippet}</div>
                                ${fullTextDiv}
                            </div>
                        `}).join('')}
                        ${hidden.map(m => {
                    const fullTextHtml = m.fullText ? m.fullText.replace(new RegExp(query, 'g'), `<mark>${query}</mark>`) : '';
                    const viewFullBtn = m.fullText ? `<button class="btn-view-full" onclick="toggleFullText(event, this)">전체보기</button>` : '';
                    const fullTextDiv = m.fullText ? `<div class="snippet-full-text">${fullTextHtml}</div>` : '';

                    return `
                            <div class="snippet clickable hidden" onclick="openLaw('${item.id}', '${m.articleNum}', this)">
                                    <div class="snippet-header">
                                    <div class="snippet-label">${m.articleLabel}</div>
                                    ${viewFullBtn}
                                </div>
                                <div class="snippet-text">${m.snippet}</div>
                                ${fullTextDiv}
                            </div>
                        `}).join('')}
                        ${hidden.length > 0 ? `<div class="snippet-more" onclick="expandSnippets(this)">+${hidden.length} 더보기 (전체 펼치기)</div>` : ''}
                    </div>
                </div>
            `;
        });

        contentHtml += '</div>'; // Close results-content wrapper

        // Render Header
        resultsHeader.innerHTML = headerHtml;
        resultsHeader.classList.add('active');
        resultsHeader.style.display = 'block';

        // Render Content
        resultsContainer.innerHTML = contentHtml;
        resultsContainer.classList.add('active');

        // If an item is expanded, force split view since we now have results
        if (document.querySelector('.accordion-item.expanded')) {
            const wrapper = document.querySelector('.law-container-wrapper');
            wrapper.classList.add('split-view');
        }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Toggle clear button visibility and handle click
    searchInput.addEventListener('input', updateClearButton);

    function updateClearButton() {
        if (searchInput.value.trim().length > 0) {
            searchClear.classList.remove('hidden');
        } else {
            searchClear.classList.add('hidden');
        }
    }

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        updateClearButton();
        // closeSearchResults(); // Removed per user request: only clear text
    });

    // Global close function
    // Global close function
    window.closeSearchResults = function () {
        const resultsHeader = document.getElementById('searchResultsHeader');

        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('active');
        resultsContainer.classList.remove('maximized');

        // Clear and hide header
        resultsHeader.innerHTML = '';
        resultsHeader.classList.remove('active');
        resultsHeader.classList.remove('maximized');
        resultsHeader.style.display = 'none';

        document.getElementById('searchOverlay').classList.remove('maximized');

        document.body.style.overflow = ''; // Reset scroll

        // Reset to initial state
        if (window.innerWidth > 1024) {
            // Maybe don't collapse sidebar if user wants to keep it?
            // But default behavior was requested to reset.
            const wrapper = document.querySelector('.law-container-wrapper');
            wrapper.classList.remove('split-view');
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('expanded');
            });
        }
    };


    // Initial check
    updateClearButton();

    // Filter UI Logic
    const selectAllCb = document.getElementById('filterSelectAll');
    const filterCbs = document.querySelectorAll('input[name="lawFilter"]');
    const toggleFiltersBtn = document.getElementById('btnToggleFilters');
    const filterOptions = document.getElementById('filterOptions');

    toggleFiltersBtn.addEventListener('click', () => {
        filterOptions.classList.toggle('hidden');
        toggleFiltersBtn.textContent = filterOptions.classList.contains('hidden') ? '상세 선택 ▼' : '접기 ▲';
    });

    selectAllCb.addEventListener('change', (e) => {
        const checked = e.target.checked;
        filterCbs.forEach(cb => cb.checked = checked);
        document.querySelectorAll('.group-filter').forEach(cb => cb.checked = checked);

        // Real-time update if searching
        const query = document.getElementById('lawSearchInput').value.trim();
        if (query) {
            performSearch();
        }
    });

    // Group Filter Logic
    document.querySelectorAll('.group-filter').forEach(groupCb => {
        groupCb.addEventListener('change', (e) => {
            const checked = e.target.checked;
            const group = e.target.closest('.filter-group');
            group.querySelectorAll('input[name="lawFilter"]').forEach(cb => cb.checked = checked);
            updateSelectAllState();

            // Real-time update if searching
            const query = document.getElementById('lawSearchInput').value.trim();
            if (query) {
                performSearch();
            }
        });
    });

    filterCbs.forEach(cb => {
        cb.addEventListener('change', () => {
            // Update parent group checkbox
            const group = cb.closest('.filter-group');
            const groupCb = group.querySelector('.group-filter');
            const groupCbs = group.querySelectorAll('input[name="lawFilter"]');
            const allGroupChecked = Array.from(groupCbs).every(c => c.checked);
            groupCb.checked = allGroupChecked;

            updateSelectAllState();

            // Real-time update if searching
            const query = document.getElementById('lawSearchInput').value.trim();
            if (query) {
                performSearch();
            }
        });
    });

    function updateSelectAllState() {
        const allChecked = Array.from(filterCbs).every(c => c.checked);
        selectAllCb.checked = allChecked;
    }


    // Unified Toggle Function (Exposed to window for HTML onclick)
    window.toggleAccordion = function (header) {
        if (!header) return;

        // Prevent toggling when clicking the external link (↗)
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

            // Scroll into view
            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            // Lazy load immediately
            if (iframe && iframe.dataset.src && (!iframe.src || iframe.src === 'about:blank')) {
                iframe.src = iframe.dataset.src;
            }
        } else {
            item.classList.remove('expanded');

            // Check if any other items are expanded. 
            // If not, and search is not active, we can remove split-view.
            const anyOtherOpen = document.querySelector('.accordion-item.expanded');
            if (!anyOtherOpen && !resultsActive) {
                wrapper.classList.remove('split-view');
            }
        }
    };

    // Remove the individual toggle listeners as we now use the global toggleAccordion via onclick
    // (Existing toggles.forEach block removed)
    // Maximize Toggle Function
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
});
