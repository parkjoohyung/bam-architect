// Merged from law_data_list.js
console.log('LAW.JS STARTED V39');
window.LAW_JS_STATUS = 'Running';

// // Helper: build reliable jump URL & hash from articleNum
window.buildArticleJumpInfo = (baseSrc, artNum, lawId = null, forcedTitle = null) => {
    // Keep the exact baseSrc unmodified so we don't trigger a reload if we only change the hash
    let cleanBase = baseSrc.split('#')[0];
    
    if (!artNum) return { src: cleanBase, hash: '', type: 'base' };
    
    const match = artNum.match(/(?:제)?(\d+)조(?:의(\d+))?/);
    if (match) {
        const main = match[1];
        const sub = match[2] ? match[2] : '0';
        
        // law.go.kr lsInfoP.do pages use #J{main}:{sub} anchors for articles.
        // By ONLY changing the hash, the iframe will smoothly scroll without flickering.
        return { src: cleanBase, hash: `#J${main}:${sub}`, type: 'lsInfo_hash_only', main, sub };
    }
    return { src: cleanBase, hash: '' };
};

window.LAW_METADATA_LIST = [
    {
        "id": "planning_act",
        "group": "국계법",
        "type": "법",
        "title": "국토의 계획 및 이용에 관한 법률",
        "url": "https://www.law.go.kr/법령/국토의계획및이용에관한법률"
    },
    {
        "id": "planning_decree",
        "group": "국계법",
        "type": "시행령",
        "title": "국토의 계획 및 이용에 관한 법률 시행령",
        "url": "https://www.law.go.kr/법령/국토의계획및이용에관한법률시행령"
    },
    {
        "id": "planning_rules",
        "group": "국계법",
        "type": "시행규칙",
        "title": "국토의 계획 및 이용에 관한 법률 시행규칙",
        "url": "https://www.law.go.kr/법령/국토의계획및이용에관한법률시행규칙"
    },
    {
        "id": "building_act",
        "group": "건축법",
        "type": "법",
        "title": "건축법",
        "url": "https://www.law.go.kr/법령/건축법"
    },
    {
        "id": "building_decree",
        "group": "건축법",
        "type": "시행령",
        "title": "건축법 시행령",
        "url": "https://www.law.go.kr/법령/건축법시행령"
    },
    {
        "id": "building_rules",
        "group": "건축법",
        "type": "시행규칙",
        "title": "건축법 시행규칙",
        "url": "https://www.law.go.kr/법령/건축법시행규칙"
    },
    {
        "id": "housing_act",
        "group": "주택법",
        "type": "법",
        "title": "주택법",
        "url": "https://www.law.go.kr/법령/주택법"
    },
    {
        "id": "housing_decree",
        "group": "주택법",
        "type": "시행령",
        "title": "주택법 시행령",
        "url": "https://www.law.go.kr/법령/주택법시행령"
    },
    {
        "id": "housing_rules",
        "group": "주택법",
        "type": "시행규칙",
        "title": "주택법 시행규칙",
        "url": "https://www.law.go.kr/법령/주택법시행규칙"
    },
    {
        "id": "disability_act",
        "group": "장애인등편의법",
        "type": "법",
        "title": "장애인ㆍ노인ㆍ임산부 등의 편의증진 보장에 관한 법률",
        "url": "https://www.law.go.kr/법령/장애인ㆍ노인ㆍ임산부등의편의증진보장에관한법률"
    },
    {
        "id": "disability_decree",
        "group": "장애인등편의법",
        "type": "시행령",
        "title": "장애인ㆍ노인ㆍ임산부 등의 편의증진 보장에 관한 법률 시행령",
        "url": "https://www.law.go.kr/법령/장애인ㆍ노인ㆍ임산부등의편의증진보장에관한법률시행령"
    },
    {
        "id": "disability_rules",
        "group": "장애인등편의법",
        "type": "시행규칙",
        "title": "장애인ㆍ노인ㆍ임산부 등의 편의증진 보장에 관한 법률 시행규칙",
        "url": "https://www.law.go.kr/법령/장애인ㆍ노인ㆍ임산부등의편의증진보장에관한법률시행규칙"
    },
    {
        "id": "parking_act",
        "group": "주차장법",
        "type": "법",
        "title": "주차장법",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=280143&urlMode=lsInfoP"
    },
    {
        "id": "parking_decree",
        "group": "주차장법",
        "type": "시행령",
        "title": "주차장법 시행령",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=273373&urlMode=lsInfoP"
    },
    {
        "id": "parking_rules",
        "group": "주차장법",
        "type": "시행규칙",
        "title": "주차장법 시행규칙",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=279253&urlMode=lsInfoP"
    },
    {
        "id": "dev_act",
        "group": "개발제한구역법",
        "type": "법",
        "title": "개발제한구역의 지정 및 관리에 관한 특별조치법",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=254803&urlMode=lsInfoP"
    },
    {
        "id": "dev_decree",
        "group": "개발제한구역법",
        "type": "시행령",
        "title": "개발제한구역의 지정 및 관리에 관한 특별조치법 시행령",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=281641&urlMode=lsInfoP"
    },
    {
        "id": "dev_rules",
        "group": "개발제한구역법",
        "type": "시행규칙",
        "title": "개발제한구역의 지정 및 관리에 관한 특별조치법 시행규칙",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=260441&urlMode=lsInfoP"
    },
    {
        "id": "buld_mng_act",
        "group": "건축물관리법",
        "type": "법",
        "title": "건축물관리법",
        "url": "https://www.law.go.kr/법령/건축물관리법"
    },
    {
        "id": "buld_mng_decree",
        "group": "건축물관리법",
        "type": "시행령",
        "title": "건축물관리법 시행령",
        "url": "https://www.law.go.kr/법령/건축물관리법시행령"
    },
    {
        "id": "buld_mng_rules",
        "group": "건축물관리법",
        "type": "시행규칙",
        "title": "건축물관리법 시행규칙",
        "url": "https://www.law.go.kr/법령/건축물관리법시행규칙"
    },
    {
        "id": "outdoor_ad_act",
        "group": "옥외광고물법",
        "type": "법",
        "title": "옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=270383&urlMode=lsInfoP"
    },
    {
        "id": "outdoor_ad_decree",
        "group": "옥외광고물법",
        "type": "시행령",
        "title": "옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률 시행령",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=281033&urlMode=lsInfoP"
    },
    {
        "id": "balcony_criteria",
        "group": "기준/규칙",
        "type": "발코니",
        "title": "발코니 등의 구조변경절차 및 설치기준",
        "url": "https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000171416"
    },
    {
        "id": "landscape_criteria",
        "group": "기준/규칙",
        "type": "조경",
        "title": "조경기준",
        "url": "https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000208056"
    },
    {
        "id": "fire_safety_rules",
        "group": "기준/규칙",
        "type": "피난/방화",
        "title": "건축물의 피난ㆍ방화구조 등의 기준에 관한 규칙",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=279461&urlMode=lsInfoP"
    },
    {
        "id": "energy_saving_criteria",
        "group": "기준/규칙",
        "type": "에너지",
        "title": "건축물의 에너지절약설계기준",
        "url": "https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000106860"
    },
];

// Fetch National Law Data (law_data.json)
console.log('Fetching National Law Data...');
fetch('/law_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        window.lawData = data;
        console.log('National Law Data Loaded:', data.length, 'items');
    })
    .catch(error => {
        console.error('Failed to load law_data.json:', error);
        window.LAW_ERROR = 'National Law Data Fetch Failed';
    });

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Search Filters
    initFilterEvents();
    updateSelectAllState();
    // Force National Law filters to be checked by default if not set
    document.querySelectorAll('input[name="lawFilter"]').forEach(cb => {
        cb.checked = true;
    });
    document.querySelectorAll('.group-filter').forEach(cb => {
        cb.checked = true;
    });


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

    // Fix for Nested Children - Collapse all nested ordinance items
    window.fixNestedChildren = function (header) {
        // Safe Version: Only remove 'expanded' class, do NOT force inline styles
        const forceCollapse = () => {
            let context = document;
            if (header) {
                const parentItem = header.closest('.accordion-item');
                if (parentItem) context = parentItem;
            }

            // Target ONLY nested grids (city level), deeper items
            const nestedItems = context.querySelectorAll('.nested-ordinance-grid .accordion-item');
            nestedItems.forEach(item => {
                // Just remove the class - let CSS handle the rest
                if (item.classList.contains('expanded')) {
                    item.classList.remove('expanded');
                }

                // Clear any inline styles that might interfere
                const content = item.querySelector('.accordion-content');
                if (content) {
                    // Ensure we don't accidentally leave a display:flex block open
                    // But do NOT force display:none if it's not needed (removal of class is enough)
                    // Actually, safely removing display property returns control to CSS
                    content.style.removeProperty('display');
                    content.style.removeProperty('height');
                }
            });
        };
        // Run immediately
        forceCollapse();
        setTimeout(forceCollapse, 0);
        setTimeout(forceCollapse, 50);
    };

    // Initialize on load to ensure clean state
    document.addEventListener('DOMContentLoaded', () => {
        if (window.fixNestedChildren) window.fixNestedChildren();
        // Dynamic listeners are added during render
    });


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

        // Lazy Rendering for Nested Cities
        if (!isOpen && item._ordinanceData && item.querySelector('.nested-ordinance-grid') && item.querySelector('.nested-ordinance-grid').children.length === 0) {
            console.log('Lazy rendering ordinances for:', item.id);
            const grid = item.querySelector('.nested-ordinance-grid');
            const uniquePrefix = item.id;
            item._ordinanceData.forEach((ord, idx) => {
                // If item has _ordinanceData but not rendered yet:
                grid.appendChild(renderOrdinanceItem(ord, uniquePrefix + '_ord_' + idx));
            });
            item._ordinanceData = null; // Free memory? Or keep for reference?
        }

        // Removed broad iframe selector
        const resultsActive = resultsContainer.classList.contains('active');

        if (!isOpen) {
            item.classList.add('expanded');
            if (resultsActive) {
                wrapper.classList.add('split-view');
            }

            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            // Force visibility to override any inline styles or CSS rules with !important
            const content = item.querySelector('.accordion-content');
            if (content) {
                // Match CSS spec: flex column ensures full height and proper child behavior
                content.style.setProperty('display', 'flex', 'important');
                content.style.setProperty('flex-direction', 'column', 'important');
                content.style.setProperty('height', '100%', 'important');
            }
            let iframe = null;
            if (content) {
                // In ordinance items, .iframe-wrapper is a direct child of .accordion-content
                const wrapper = content.querySelector('.iframe-wrapper');
                // Ensure wrapper exists and is a direct child (not nested deep in a grid)
                if (wrapper && wrapper.parentNode === content) {
                    iframe = wrapper.querySelector('iframe');
                }
            }

            if (iframe && iframe.dataset.src && (!iframe.src || iframe.src === 'about:blank')) {
                iframe.src = iframe.dataset.src;
            }
        } else {
            item.classList.remove('expanded');

            // CLEANUP: Remove forced inline styles so CSS can hide it again
            const content = item.querySelector('.accordion-content');
            if (content) {
                content.style.removeProperty('display');
                content.style.removeProperty('flex-direction');
                content.style.removeProperty('height');
            }

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


    // === Data Loading & Dynamic Rendering ===

    // EMERGENCY RESTORE: Do NOT clear HTML. Use existing Hardcoded HTML.
    // Disabling dynamic render to fix "blank screen" issue.

    // Just initialize events on the existing DOM elements
    // Move initOrdinanceFilters to robust loader below
    // initOrdinanceFilters();
    // updateSelectAllState(); // CRASH FIX: undefined function

    // ROBUSTNESS: Retry initialization if ordinanceList isn't ready immediately
    // ordinanceList is loaded from js/ordinance_list.js
    const tryInitOrdinance = (attempts = 50) => {
        window.LAW_TRY_INIT_CALLED = true;
        try {
            if (window.ordinanceList) {
                console.log('OrdinanceList loaded, initializing filters...');
                if (typeof initOrdinanceFilters === 'function') {
                    initOrdinanceFilters();
                } else if (window.initOrdinanceFilters) {
                    window.initOrdinanceFilters();
                } else {
                    window.LAW_ERROR = 'No init function found';
                    console.error('No init function found');
                }
            } else if (attempts > 0) {
                console.warn('ordinanceList not ready yet, retrying...', 50 - attempts);
                setTimeout(() => tryInitOrdinance(attempts - 1), 100);
            } else {
                console.error('Failed to load ordinanceList after retries.');
                if (typeof initOrdinanceFiltersInternal === 'function') {
                    initOrdinanceFiltersInternal();
                }
            }
        } catch (e) {
            window.LAW_ERROR = e.toString();
            console.error('tryInitOrdinance Error:', e);
        }
    };
    tryInitOrdinance();

    // 2. Load Content for Search (Async) - Functionality Keep
    // 2. Load Content for Search (Async)
    console.log('Starting data fetch...');
    Promise.all([
        fetch('law_data.json').then(response => {
            console.log('law_data.json response status:', response.status);
            return response.json();
        }).then(data => {
            console.log('law_data.json loaded, items:', data ? data.length : 0);
            return data;
        }).catch(e => { console.error('Failed to load law content', e); return []; }),

        fetch('data/ordinance_content.json').then(response => {
            console.log('ordinance_content.json response status:', response.status);
            return response.json();
        }).then(data => {
            console.log('ordinance_content.json loaded, items:', data ? data.length : 0);
            return data;
        }).catch(e => { console.error('Failed to load ordinance content', e); return []; })
    ]).then(([lawContent, ordinanceContent]) => {
        console.log('Data fetch completed. Assigning to global scope.');
        lawData = parseLawContent(lawContent);
        window.ordinanceSearchData = ordinanceContent;

        // Build URL -> ID Map from ordinanceList for linking search results to UI
        // IMPORTANT: This must use the SAME isMetro logic as renderOrdinances()
        // so that the generated IDs match the actual DOM element IDs.
        const idMap = new Map();
        if (window.ordinanceList) {
            window.ordinanceList.forEach((group, groupIndex) => {
                const regionId = `region_${groupIndex}`;

                // Mirror exactly the same isMetro check as renderOrdinances()
                let isMetro = group.type === 'metro';
                if (!group.type && group.rows && !Array.isArray(group.rows)) isMetro = true;
                if (group.ordinances && Array.isArray(group.ordinances) && !group.rows) isMetro = true;

                if (isMetro) {
                    // Metro: flat list rendered as region_N_ord_M
                    let ordinances = [];
                    if (group.rows && Array.isArray(group.rows)) ordinances = group.rows.flatMap(r => r.ordinances || []);
                    else if (group.ordinances) ordinances = group.ordinances;

                    ordinances.forEach((ord, ordIndex) => {
                        if (ord && ord.url) idMap.set(ord.url, `${regionId}_ord_${ordIndex}`);
                    });
                } else {
                    // Non-metro: nested city structure rendered as region_N_city_M_ord_K
                    if (group.rows && Array.isArray(group.rows)) {
                        group.rows.forEach((row, rowIndex) => {
                            if (row.ordinances) {
                                row.ordinances.forEach((ord, ordIndex) => {
                                    if (ord && ord.url) idMap.set(ord.url, `${regionId}_city_${rowIndex}_ord_${ordIndex}`);
                                });
                            }
                        });
                    }
                }
            });
        }
        window.ordinanceIdMap = idMap;
        console.log('[DEBUG] ordinanceIdMap built with', idMap.size, 'entries.');
        window.ordinanceSearchData = ordinanceContent;
        console.log(`Content Loaded: ${lawData.length} Law Items, ${ordinanceContent.length} Ordinance Items`);
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

    // Parse ordinance fullText into individual articles (reuses same regex as law parsing)
    function parseOrdinanceArticles(fullText) {
        if (!fullText) return [];
        const articles = [];
        // Adjusted regex for single-line text:
        // 1. Allow space start (?:^|\s) instead of just newline
        // 2. Enforce title in parens \(([^)]+)\) to avoid matching references like "제3조에"
        const articleRegex = /(?:^|\s)제(\d+)(조(?:의\d+)?)\(([^)]+)\)/g;
        let match;
        while ((match = articleRegex.exec(fullText)) !== null) {
            const mainNum = match[1];
            const suffix = match[2];
            const title = match[3] || '';
            const fullIdentifier = mainNum + suffix;
            articles.push({
                num: fullIdentifier,
                title: title,
                index: match.index,
                fullLabel: `제${fullIdentifier}` + (title ? `(${title})` : '')
            });
        }
        // Assign fullText slice to each article
        for (let i = 0; i < articles.length; i++) {
            const next = articles[i + 1];
            articles[i].fullText = fullText.substring(articles[i].index, next ? next.index : fullText.length);
        }
        // Deduplicate: keep longest version per article number
        const articleMap = new Map();
        articles.forEach(a => {
            const existing = articleMap.get(a.num);
            if (!existing || a.fullText.length > existing.fullText.length) {
                articleMap.set(a.num, a);
            }
        });
        return Array.from(articleMap.values()).sort((a, b) => a.index - b.index);
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

        console.log('Performing Search:', query);
        console.log('requestOrdinanceEnabled:', typeof requestOrdinanceEnabled !== 'undefined' ? requestOrdinanceEnabled : 'undefined');
        console.log('window.ordinanceData:', window.ordinanceData ? 'Present' : 'Missing');

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
        // Note: For ordinances, we might not have 'lawFilter' inputs unless we add them
        // But the user request implies global search or based on 'requestOrdinanceEnabled'

        // 1. Search Law Data
        let lawResults = [];
        if (window.lawData) {
            lawResults = lawData.flatMap(law => {
                // If filters exist and none are checked, maybe search none?
                // But if filters are missing or user just wants to search, we should probably default to ALL.
                // User complaint: "Architectural law not searched".
                // Fix: If checkedFilters is empty, ASSUME ALL.
                if (checkedFilters.length > 0 && !checkedFilters.includes(law.id)) return [];
                if (!law.parsedArticles) return [];

                const matches = [];
                // Check Title
                if (law.title.includes(query)) {
                    // Add title match logic if needed, but current logic relies on articles
                }

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
                    return { id: law.id, title: law.title, count: matches.length, matches, type: 'law' };
                }
                return [];
            });
        }

        // 2. Search Ordinance Data
        let ordinanceResults = [];
        if (window.ordinanceSearchData && window.ordinanceIdMap && (typeof requestOrdinanceEnabled === 'undefined' || requestOrdinanceEnabled)) {

            // Determine strict filtering scope
            // Determine strict filtering scope
            let activeOrdinanceTitles = null;

            // ROBUSTNESS: Read directly from DOM to obtain current interactive state
            const provinceSel = document.getElementById('ordinanceProvinceSelect');
            const currentProvince = provinceSel ? provinceSel.value : '';

            if (currentProvince) {
                const checkboxes = document.querySelectorAll('.ordinance-detail-checkbox input[type="checkbox"]:checked');
                if (checkboxes.length > 0) {
                    activeOrdinanceTitles = new Set(Array.from(checkboxes).map(cb => cb.dataset.title));
                } else {
                    // Province selected but NO checkboxes checked = Search NOTHING from ordinances
                    // This is the intended behavior: strict filtering relies on active checkboxes.
                    // If updateDetailFilter hasn't run or container is empty, this is empty.
                    activeOrdinanceTitles = new Set();
                }
            }

            console.log(`[Search Debug] Province: '${currentProvince}', ActiveTitles: ${activeOrdinanceTitles ? activeOrdinanceTitles.size : 'null (All)'}`);
            if (activeOrdinanceTitles && activeOrdinanceTitles.size === 0) {
                console.warn('[Search Debug] Strict mode active but NO titles allowed. This will result in 0 ordinance matches.');
            }

            console.log('Searching Ordinances... Strict Mode:', !!currentProvince, activeOrdinanceTitles ? `(${activeOrdinanceTitles.size} active)` : '(All)');
            if (activeOrdinanceTitles) {
                console.log('Active Titles Sample:', Array.from(activeOrdinanceTitles).slice(0, 3));
            }

            // Helper to get region label from ID
            const getRegionLabel = (id) => {
                if (!id || !window.ordinanceList) return '조례';
                try {
                    const parts = id.split('_');
                    const regionIdx = parseInt(parts[1]); // region_X
                    const group = window.ordinanceList[regionIdx];
                    let label = group.parent || group.region;

                    if (id.includes('city_')) {
                        const cityIdx = parseInt(parts[3]); // region_X_city_Y
                        if (group.rows && group.rows[cityIdx]) {
                            label += ' ' + group.rows[cityIdx].region;
                        }
                    }
                    return label;
                } catch (e) { return '조례'; }
            };

            if (window.ordinanceSearchData) {
                window.ordinanceSearchData.forEach(ordContent => {
                    // Strict Filter Check
                    if (activeOrdinanceTitles !== null && !activeOrdinanceTitles.has(ordContent.title)) {
                        return;
                    }

                    // Get linked UI ID
                    const uiId = window.ordinanceIdMap.get(ordContent.url);
                    if (!uiId) return; // Skip if not found in UI list

                    const regionLabel = getRegionLabel(uiId);
                    const queryTitleMatch = ordContent.title.includes(query); // Basic title check

                    let matches = [];

                    // 1. Title Match
                    if (queryTitleMatch) {
                        matches.push({
                            articleNum: '',
                            articleLabel: regionLabel, // Use region as label for title match
                            snippet: ordContent.title.replace(new RegExp(query, 'g'), `<mark>${query}</mark>`),
                            fullText: ''
                        });
                    }

                    // 2. Content Search
                    if (ordContent.fullText) {
                        const parsedArticles = parseOrdinanceArticles(ordContent.fullText);

                        if (parsedArticles.length > 0) {
                            parsedArticles.forEach(article => {
                                const content = article.fullText;
                                let matchedTerms = [];
                                let articleMatches = [];

                                // Check all terms
                                searchTerms.forEach(term => {
                                    let startIndex = 0;
                                    let count = 0;
                                    while ((startIndex = content.indexOf(term, startIndex)) > -1 && count < 3) {
                                        const start = Math.max(0, startIndex - 30);
                                        const end = Math.min(content.length, startIndex + term.length + 50);
                                        articleMatches.push({ term, start, end, snippetText: content.substring(start, end).replace(new RegExp(term, 'g'), `<mark>${term}</mark>`) });
                                        matchedTerms.push(term);
                                        startIndex += term.length;
                                        count++;
                                    }
                                });

                                let shouldInclude = false;
                                if (searchMode === 'simple' || searchMode === 'or') shouldInclude = matchedTerms.length > 0;
                                else if (searchMode === 'and') {
                                    const uniqueMatched = new Set(matchedTerms);
                                    shouldInclude = uniqueMatched.size === searchTerms.length;
                                }

                                if (shouldInclude && articleMatches.length > 0) {
                                    matches.push({
                                        articleNum: article.num,
                                        articleLabel: `${regionLabel} · ${article.fullLabel}`,
                                        snippet: articleMatches.map(m => m.snippetText).join(' ... '),
                                        fullText: article.fullText
                                    });
                                }
                            });
                        }
                    }

                    if (matches.length > 0) {
                        ordinanceResults.push({
                            id: uiId, // Link to UI ID
                            title: ordContent.title,
                            count: matches.length,
                            matches: matches,
                            type: 'ordinance'
                        });
                    }
                });
            }

            /* window.ordinanceData.forEach((group, gIndex) => {
                const regionId = `region_${gIndex}`;

                // Determine if metro or city structure
                let isMetro = group.type === 'metro';
                if (!group.type && group.rows && !Array.isArray(group.rows)) isMetro = true;
                if (group.ordinances && Array.isArray(group.ordinances) && !group.rows) isMetro = true;

                const processOrdinance = (ord, oIndex, prefixId, regionLabel) => {
                    // Strict Filter Check
                    if (activeOrdinanceTitles !== null && !activeOrdinanceTitles.has(ord.title)) {
                        return;
                    }

                    let matches = [];
                    const titleMatch = ord.title.includes(query);

                    // Title Match Snippet
                    if (titleMatch) {
                        matches.push({
                            articleNum: '',
                            articleLabel: regionLabel || '조례',
                            snippet: ord.title.replace(new RegExp(query, 'g'), `<mark>${query}</mark>`),
                            fullText: ''
                        });
                    }

                    // Article-level search (same logic as law articles)
                    if (ord.fullText) {
                        const parsedArticles = parseOrdinanceArticles(ord.fullText);

                        if (parsedArticles.length > 0) {
                            // Per-article search (matches law search behavior)
                            parsedArticles.forEach(article => {
                                const content = article.fullText;
                                let articleMatches = [];
                                let matchedTerms = [];

                                searchTerms.forEach(term => {
                                    let startIndex = 0;
                                    let termMatches = [];
                                    let count = 0;
                                    while ((startIndex = content.indexOf(term, startIndex)) > -1 && count < 5) {
                                        const start = Math.max(0, startIndex - 30);
                                        const end = Math.min(content.length, startIndex + term.length + 50);
                                        termMatches.push({ term, start, end });
                                        startIndex += term.length;
                                        count++;
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
                        } else {
                            // Fallback: blob search for ordinances without parseable articles
                            let textMatches = [];
                            searchTerms.forEach(term => {
                                let startIndex = 0;
                                let count = 0;
                                while ((startIndex = ord.fullText.indexOf(term, startIndex)) > -1 && count < 5) {
                                    const start = Math.max(0, startIndex - 30);
                                    const end = Math.min(ord.fullText.length, startIndex + term.length + 50);
                                    textMatches.push({ term, start, end, snippet: ord.fullText.substring(start, end) });
                                    startIndex += term.length;
                                    count++;
                                }
                            });
                            textMatches.forEach(m => {
                                let snippet = m.snippet;
                                searchTerms.forEach(term => {
                                    snippet = snippet.replace(new RegExp(term, 'g'), `<mark>${term}</mark>`);
                                });
                                matches.push({
                                    articleNum: '',
                                    articleLabel: (regionLabel || '조례') + ' (본문)',
                                    snippet: '... ' + snippet + ' ...',
                                    fullText: ''
                                });
                            });
                        }
                    }

                    if (matches.length > 0) {
                        ordinanceResults.push({
                            id: `${prefixId}_ord_${oIndex}`,
                            title: ord.title,
                            count: matches.length,
                            matches: matches,
                            type: 'ordinance'
                        });
                    }
                };

                if (isMetro) {
                    let ordinances = [];
                    if (group.rows && Array.isArray(group.rows)) ordinances = group.rows.flatMap(r => r.ordinances || []);
                    else if (group.ordinances) ordinances = group.ordinances;

                    ordinances.forEach((ord, oIndex) => processOrdinance(ord, oIndex, regionId, group.region));

                } else if (group.rows) {
                    group.rows.forEach((row, rIndex) => {
                        if (row.ordinances) {
                            row.ordinances.forEach((ord, oIndex) => {
                                processOrdinance(ord, oIndex, `${regionId}_city_${rIndex}`, row.region);
                            });
                        }
                    });
                }
            }); */
        }

        const combinedResults = [...lawResults, ...ordinanceResults];

        const displayQuery = searchMode === 'or' ? searchTerms.join(' OR ') : searchMode === 'and' ? searchTerms.join(' AND ') : query;
        displayResults(combinedResults, displayQuery);
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
        // Note: split-view is only activated when user clicks a specific article (openLaw)

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
    window.scrollToResult = function (lawId, subTarget = null, attempts = 5) {
        const resultsContent = document.querySelector('.results-content');
        const targetItem = document.getElementById(`result-item-${lawId}`);

        if (!resultsContent || !targetItem) return;

        const performScroll = (currentAttempts) => {
            if (currentAttempts <= 0) return;

            if (subTarget) {
                const containerRect = resultsContent.getBoundingClientRect();
                const elementRect = subTarget.getBoundingClientRect();
                const relativeTop = elementRect.top - containerRect.top;

                resultsContent.scrollTo({
                    top: resultsContent.scrollTop + relativeTop - 60,
                    behavior: 'auto'
                });
            } else {
                const containerRect = resultsContent.getBoundingClientRect();
                const itemRect = targetItem.getBoundingClientRect();
                const relativeTop = itemRect.top - containerRect.top;

                resultsContent.scrollTo({
                    top: resultsContent.scrollTop + relativeTop - 10,
                    behavior: 'smooth'
                });
            }

            if (currentAttempts > 1) {
                setTimeout(() => performScroll(currentAttempts - 1), 100);
            }
        };

        performScroll(attempts);
    };

    // Global Toast Notification System
    window.showToast = function (message) {
        // Remove existing toast if any
        const existingToast = document.getElementById('law-toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'law-toast-message';
        toast.textContent = message;

        // Styling the toast for a premium dark-mode feel
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(30, 30, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '14px 28px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            fontSize: '15px',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
        });

        document.body.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;

        // Custom animation
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, -15px)';

        // Fade out
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 5px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 400);
        }, 3500);
    };


    window.openLaw = function (lawId, articleNum, element) {
    if (element) {
        document.querySelectorAll('.snippet.active-result').forEach(el => el.classList.remove('active-result'));
        element.classList.add('active-result');
        scrollToResult(lawId, element, 5);
    }

    document.querySelectorAll('.nav-chip.active').forEach(el => el.classList.remove('active'));
    const navChip = document.getElementById(`nav-chip-${lawId}`);
    if (navChip) {
        navChip.classList.add('active');
        navChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    const targetItem = document.getElementById(lawId);
    const wrapper = document.querySelector('.law-container-wrapper');

    const setIframeSrcSafe = (iframe, jump) => {
        const targetUrl = `${jump.src}${jump.hash}`;
        const currentSrc = iframe.src ? decodeURIComponent(iframe.src) : '';
        
        console.log(`[ANTIGRAVITY] Navigating to: ${targetUrl} (Type: ${jump.type})`);
        
        // If the base URL is the same and we're just changing the hash, 
        // do not force a reload. This allows smooth, flicker-free scrolling.
        const currentBase = currentSrc.split('#')[0];
        const targetBase = targetUrl.split('#')[0];
        
        if (currentBase === targetBase && currentSrc !== '') {
            iframe.src = targetUrl; // Hash change only: smooth scroll
        } else {
            // Different law or first load: use about:blank to ensure clean load
            iframe.src = 'about:blank';
            setTimeout(() => {
                iframe.src = targetUrl;
            }, 30);
        }
    };

    if (!targetItem) {
        wrapper.classList.add('split-view');
        const openTargetCard = (attempt) => {
            const el = document.getElementById(lawId);
            if (el) {
                let curr = el;
                while(curr && curr.classList) {
                    if(curr.classList.contains('accordion-item')) curr.classList.add('expanded');
                    curr = curr.parentElement;
                }
                const iframe = el.querySelector('iframe');
                if (iframe && iframe.dataset.src) {
                    const titleEl = el.querySelector('.accordion-title');
                    const forcedTitle = titleEl ? titleEl.textContent.trim() : null;
                    const jump = window.buildArticleJumpInfo(iframe.dataset.src, articleNum, lawId, forcedTitle);
                    setIframeSrcSafe(iframe, jump);
                }
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            } else if (attempt > 0) {
                setTimeout(() => openTargetCard(attempt - 1), 150);
            }
        };
        openTargetCard(5);
        return;
    }

    // Expand Parents
    let current = targetItem;
    while (current && current.classList) {
        if (current.classList.contains('accordion-item')) {
            current.classList.add('expanded');
            const c = current.querySelector(':scope > .accordion-content');
            if (c) {
                c.style.setProperty('display', 'flex', 'important');
                c.style.setProperty('height', '100%', 'important');
            }
        }
        current = current.parentElement;
    }

    wrapper.classList.add('split-view');
    setTimeout(() => targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const iframe = targetItem.querySelector('iframe');
    if (iframe && iframe.dataset.src) {
        // Extract title from DOM to be sure
        const titleEl = targetItem.querySelector('.accordion-title');
        const forcedTitle = titleEl ? titleEl.textContent.trim() : null;
        
        const jump = window.buildArticleJumpInfo(iframe.dataset.src, articleNum, lawId, forcedTitle);
        setIframeSrcSafe(iframe, jump);
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
        const checkbox = document.querySelector(`input[name = "lawFilter"][value = "${lawId}"]`);
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
                searchLayout.style.setProperty('--sidebar-width', `${newWidth} px`);
                // Force width update (redundancy for safety)
                searchLayout.style.width = `${newWidth} px`;
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

    // === Ordinance Filtering & Rendering ===

    var requestOrdinanceEnabled = true; // Toggle state
    var selectedProvince = ''; // Default: show all provinces
    var selectedCity = '';



    function updateCityDropdown(citySel, provinceName) {
        citySel.innerHTML = '<option value="">시/군/구 전체</option>';
        citySel.disabled = !provinceName;

        if (!provinceName || !window.ordinanceList) return;

        const group = window.ordinanceList.find(g => (g.parent || g.region) === provinceName);
        if (group && group.rows) {
            group.rows.forEach(row => {
                const opt = document.createElement('option');
                opt.value = row.region;
                opt.textContent = row.region;
                citySel.appendChild(opt);
            });
        }
    }

    function updateDetailFilter(provinceName, cityName) {
        const container = document.getElementById('ordinanceDetailFilter');
        if (!container) return;
        container.innerHTML = ''; // Clear

        if (!provinceName || !window.ordinanceList) return;

        const group = window.ordinanceList.find(g => (g.parent || g.region) === provinceName);
        if (!group) return;

        let targetOrdinances = [];

        if (cityName) {
            const row = group.rows ? group.rows.find(r => r.region === cityName) : null;
            if (row && row.ordinances) targetOrdinances = row.ordinances;
        } else {
            // For Metro types: Show all ordinances
            if (group.type === 'metro' || (group.rows && group.rows.length === 1)) {
                if (group.rows && group.rows.length > 0) {
                    targetOrdinances = group.rows.flatMap(r => r.ordinances || []);
                } else if (group.ordinances) {
                    targetOrdinances = group.ordinances;
                }
            }
        }

        // Generate Checkboxes
        if (targetOrdinances.length > 0) {
            // Remove duplicates if any
            const uniqueOrds = [];
            const titles = new Set();
            targetOrdinances.forEach(o => {
                if (o.title && !titles.has(o.title)) {
                    titles.add(o.title);
                    uniqueOrds.push(o);
                }
            });

            console.log('Generating checkboxes for:', uniqueOrds.length, 'ordinances');
            uniqueOrds.forEach((ord, index) => {
                const label = document.createElement('label');
                label.className = 'ordinance-detail-checkbox';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true; // Default checked
                checkbox.dataset.title = ord.title;

                checkbox.addEventListener('change', () => {
                    renderOrdinances();
                });

                label.appendChild(checkbox);

                const span = document.createElement('span');
                // Optional: Truncate very long titles?
                span.textContent = ord.title;
                label.appendChild(span);

                container.appendChild(label);
            });
        }
    }

    function renderOrdinances() {
        const container = document.getElementById('ordinance_grid_container');
        if (!container) return;
        if (!window.ordinanceList) return;

        container.innerHTML = ''; // Clear existing

        if (!requestOrdinanceEnabled) return;

        // Show ALL regions always
        let filteredData = window.ordinanceList;

        // Iterate and render all
        filteredData.forEach((group) => {
            const originalIndex = window.ordinanceList.indexOf(group);
            const regionId = `region_${originalIndex}`;
            let rowsToRender = group.rows; // Show all cities

            // Create Parent Accordion Item (Region)
            const item = document.createElement('div');
            item.className = 'accordion-item';
            item.id = regionId;

            // Header
            const headerHtml = `
                        <div class="accordion-header" onclick="toggleAccordion(this)">
                    <div class="header-info">
                        <h2>${group.parent || group.region}</h2>
                    </div>
                    <div class="header-actions">
                        <button class="btn-toggle" aria-label="Toggle"><span class="icon-toggle"></span></button>
                    </div>
                </div>
                        `;

            // Content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'accordion-content';

            const paddingDiv = document.createElement('div');
            paddingDiv.style.padding = '1rem';

            const gridDiv = document.createElement('div');
            gridDiv.className = 'law-grid nested-ordinance-grid';

            // Determine rendering strategy
            let isMetro = group.type === 'metro';
            if (!group.type && group.rows && !Array.isArray(group.rows)) isMetro = true;
            if (group.ordinances && Array.isArray(group.ordinances) && !group.rows) isMetro = true;

            if (isMetro) {
                // Flat list
                let ordinances = [];
                if (group.rows && Array.isArray(group.rows)) ordinances = group.rows.flatMap(r => r.ordinances);
                else if (group.ordinances) ordinances = group.ordinances;

                ordinances.forEach((ord, ordIndex) => {
                    gridDiv.appendChild(renderOrdinanceItem(ord, regionId + '_ord_' + ordIndex));
                });
            } else {
                // Nested Cities
                if (rowsToRender && rowsToRender.length > 0) {
                    rowsToRender.forEach((row, rowIndex) => {
                        const cityItem = document.createElement('div');
                        cityItem.className = 'accordion-item';
                        if (selectedCity && selectedCity === row.region) cityItem.classList.add('expanded'); // Auto expand city if selected
                        cityItem.id = `${regionId}_city_${rowIndex}`;

                        // City Header
                        cityItem.innerHTML = `
                        <div class="accordion-header" onclick="toggleAccordion(this)">
                                <span class="accordion-title">${row.region}</span>
                                <div class="header-actions">
                                    <button class="btn-toggle"><span class="icon-toggle"></span></button>
                                </div>
                            </div>
                        <div class="accordion-content">
                            <div style="padding: 0.5rem;">
                                <div class="law-grid nested-ordinance-grid"></div>
                            </div>
                        </div>
                    `;

                        // Store data for lazy rendering
                        if (row.ordinances) {
                            cityItem._ordinanceData = row.ordinances;
                        }
                        gridDiv.appendChild(cityItem);
                    });
                }
            }

            paddingDiv.appendChild(gridDiv);
            contentDiv.appendChild(paddingDiv);

            item.innerHTML = headerHtml;
            item.appendChild(contentDiv);
            container.appendChild(item);
        });
    }

    // === Ordinance Filter Logic (Re-injected) ===
    function initOrdinanceFilters() {
        console.log('initOrdinanceFilters called');
        window._debugLogs = window._debugLogs || [];
        window._debugLogs.push('initOrdinanceFilters called');

        const provinceSelect = document.getElementById('ordinanceProvinceSelect');
        const citySelect = document.getElementById('ordinanceCitySelect');
        const toggle = document.getElementById('ordinanceToggle');

        // Detailed Selection Toggle Logic (Added)
        const btnToggleFilters = document.getElementById('btnToggleFilters');
        const filterOptions = document.getElementById('filterOptions');

        if (btnToggleFilters && filterOptions) {
            // Remove existing listener to prevent duplicates if init is called multiple times
            const newBtn = btnToggleFilters.cloneNode(true);
            btnToggleFilters.parentNode.replaceChild(newBtn, btnToggleFilters);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isHidden = filterOptions.classList.contains('hidden');
                if (isHidden) {
                    filterOptions.classList.remove('hidden');
                    newBtn.textContent = '상세 선택 ▲';
                } else {
                    filterOptions.classList.add('hidden');
                    newBtn.textContent = '상세 선택 ▼';
                }
            });
        }

        if (!toggle || !provinceSelect || !citySelect) {
            console.error('Ordinance Filter Elements Missing', { toggle, provinceSelect, citySelect });
            window._debugLogs.push('Ordinance filter elements not found');
            return;
        }

        // Sync initial state from DOM
        requestOrdinanceEnabled = toggle.checked;
        provinceSelect.disabled = !requestOrdinanceEnabled;
        citySelect.disabled = !requestOrdinanceEnabled || !selectedProvince;

        // Check if ordinanceList is defined
        const regions = window.ordinanceList || [];
        console.log('initOrdinanceFilters active, regions count:', regions.length);
        window._debugLogs.push(`regions count: ${regions.length} `);

        if (regions.length === 0) {
            console.warn('window.ordinanceList is empty!');
            window._debugLogs.push('window.ordinanceList is empty');
            if (provinceSelect && provinceSelect.options.length <= 1) {
                const option = document.createElement('option');
                option.text = "데이터 불러오기 실패";
                provinceSelect.add(option);
            }
            return;
        }

        // Populate Province Dropdown
        if (provinceSelect.options.length <= 1) { // Only populate if empty
            provinceSelect.innerHTML = '<option value="">시/도 선택</option>';
            const provinceMap = new Map();
            regions.forEach(group => {
                const provinceName = group.parent || group.region;
                if (provinceName && !provinceMap.has(provinceName)) {
                    provinceMap.set(provinceName, true);
                }
            });

            const sortedProvinces = Array.from(provinceMap.keys()).sort();
            console.log('Populating provinces:', sortedProvinces); // Debug Log

            sortedProvinces.forEach(prov => {
                const option = document.createElement('option');
                option.value = prov;
                option.text = prov;
                provinceSelect.add(option);
            });

            // Default: 서울특별시 선택
            const defaultProvince = '서울특별시';
            const hasSeoul = sortedProvinces.includes(defaultProvince);
            if (hasSeoul) {
                provinceSelect.value = defaultProvince;
                selectedProvince = defaultProvince;
                selectedCity = '';
                updateCityDropdown(citySelect, selectedProvince);
                updateDetailFilter(selectedProvince, '');
            } else {
                provinceSelect.value = '';
                selectedProvince = '';
                selectedCity = '';
            }

        }

        // --- Event Listeners ---
        if (provinceSelect) {
            provinceSelect.addEventListener('change', (e) => {
                selectedProvince = e.target.value;
                selectedCity = ''; // Reset city
                updateCityDropdown(citySelect, selectedProvince);
                updateDetailFilter(selectedProvince, '');
                renderOrdinances();
            });
        }

        if (citySelect) {
            citySelect.addEventListener('change', (e) => {
                selectedCity = e.target.value;
                updateDetailFilter(selectedProvince, selectedCity);
                renderOrdinances();
            });
        }

        if (toggle) {
            toggle.addEventListener('change', (e) => {
                requestOrdinanceEnabled = e.target.checked;
                provinceSelect.disabled = !requestOrdinanceEnabled;
                citySelect.disabled = !requestOrdinanceEnabled || !selectedProvince;

                // 체크 해제 시: 하위 상세 체크박스 전체 해제 + 드롭다운 초기화
                if (!requestOrdinanceEnabled) {
                    const detailContainer = document.getElementById('ordinanceDetailFilter');
                    if (detailContainer) {
                        detailContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                            cb.checked = false;
                        });
                    }
                    // 드롭다운도 초기화
                    provinceSelect.value = '';
                    citySelect.value = '';
                    citySelect.innerHTML = '<option value="">시/군/구 전체</option>';
                    selectedProvince = '';
                    selectedCity = '';
                } else {
                    // 재활성화 시: 하위 상세 체크박스 전체 재체크
                    const detailContainer = document.getElementById('ordinanceDetailFilter');
                    if (detailContainer) {
                        detailContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                            cb.checked = true;
                        });
                    }
                }

                renderOrdinances();
                // Re-run search to exclude/include ordinances based on toggle state
                const searchInput = document.getElementById('lawSearchInput');
                if (searchInput && searchInput.value.trim()) {
                    setTimeout(() => {
                        if (typeof performSearch === 'function') performSearch();
                    }, 50);
                }
            });
        }
    }
    window.initOrdinanceFilters = initOrdinanceFilters;

    // Call init
    initOrdinanceFilters();
    renderOrdinances();

    function renderOrdinanceItem(ord, uniqueId) {
        let normalizedUrl = ord.url || '';
        // Normalize double slashes and missing gubun parameter at the source
        normalizedUrl = normalizedUrl.replace(/\/\//g, '/').replace(':/', '://');
        if (normalizedUrl.includes('ordinSeq') && normalizedUrl.includes('gubun=') && !normalizedUrl.includes('gubun=ELIS')) {
            normalizedUrl = normalizedUrl.replace('gubun=&', 'gubun=ELIS&').replace(/gubun=$/, 'gubun=ELIS');
        }

        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.id = uniqueId;
        item.dataset.lawId = uniqueId;

        item.innerHTML = `
                        <div class="accordion-header" onclick="toggleAccordion(this)">
                <span class="accordion-title">${ord.title}</span>
                <div class="header-actions">
                    <a href="${normalizedUrl}" target="_blank" class="btn-external">↗</a>
                    <button class="btn-toggle"><span class="icon-toggle"></span></button>
                </div>
            </div>
                        <div class="accordion-content">
                            <div class="iframe-wrapper">
                                <iframe data-src="${normalizedUrl}" title="${ord.title}" referrerpolicy="no-referrer"></iframe>
                            </div>
                        </div>
                    `;
        return item;
    }

});
