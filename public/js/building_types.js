// Building Types Tool - Table Format with Column Filters
(function () {
    let allData = [];
    let filteredData = [];
    let currentPage = 1;
    const ROWS_PER_PAGE = 25;
    let sortColumn = null;
    let sortAsc = true;

    document.addEventListener('DOMContentLoaded', initBuildingTypesTable);

    async function initBuildingTypesTable() {
        const tbody = document.getElementById('buildingTypesBody');
        const searchInput = document.getElementById('buildingTypeSearch');
        const rowCountSpan = document.getElementById('tableRowCount');

        if (!tbody || !searchInput) return;

        // Load data - try relative paths for both file:// and http:// access
        try {
            // Try multiple possible paths
            const paths = ['building_types.json', 'public/building_types.json', '/building_types.json'];
            let loaded = false;
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        allData = await response.json();
                        filteredData = [...allData];
                        renderTable();
                        loaded = true;
                        break;
                    }
                } catch (e) { /* try next */ }
            }
            if (!loaded) throw new Error('All paths failed');
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">데이터 로드 실패</td></tr>';
            console.error('Failed to load building types:', error);
            return;
        }

        // Global search
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applyFilters, 200);
        });

        // Column filters
        document.querySelectorAll('.filter-row input').forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(applyFilters, 200);
            });
        });

        // Sorting
        document.querySelectorAll('.header-row th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.sort;
                if (sortColumn === col) {
                    sortAsc = !sortAsc;
                } else {
                    sortColumn = col;
                    sortAsc = true;
                }
                // Update sort icons and classes on all header cells
                document.querySelectorAll('.header-row th[data-sort]').forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                    const icon = h.querySelector('.sort-icon');
                    if (icon) icon.textContent = '⇅';
                });
                th.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');
                const activeIcon = th.querySelector('.sort-icon');
                if (activeIcon) activeIcon.textContent = sortAsc ? '↑' : '↓';

                applyFilters();
            });
        });


        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        document.getElementById('nextPage').addEventListener('click', () => {
            const maxPage = Math.ceil(filteredData.length / ROWS_PER_PAGE);
            if (currentPage < maxPage) {
                currentPage++;
                renderTable();
            }
        });
    }

    function applyFilters() {
        const globalSearch = document.getElementById('buildingTypeSearch').value.toLowerCase().trim();
        const columnFilters = {};

        document.querySelectorAll('.filter-row input').forEach(input => {
            const col = input.dataset.column;
            const val = input.value.toLowerCase().trim();
            if (val) columnFilters[col] = val;
        });

        filteredData = allData.filter(row => {
            // Global search
            if (globalSearch) {
                const allText = Object.values(row).join(' ').toLowerCase();
                if (!allText.includes(globalSearch)) return false;
            }

            // Column filters
            for (const [col, val] of Object.entries(columnFilters)) {
                const cellValue = String(row[col] || '').toLowerCase();
                if (!cellValue.includes(val)) return false;
            }

            return true;
        });

        // Apply sorting
        if (sortColumn) {
            filteredData.sort((a, b) => {
                let valA = a[sortColumn];
                let valB = b[sortColumn];

                // Handle numbers
                if (sortColumn === '번호' || sortColumn === '군') {
                    valA = parseInt(valA) || 0;
                    valB = parseInt(valB) || 0;
                    return sortAsc ? valA - valB : valB - valA;
                }

                // Handle strings
                valA = String(valA || '');
                valB = String(valB || '');
                return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        }

        currentPage = 1;
        renderTable();
    }

    function renderTable() {
        const tbody = document.getElementById('buildingTypesBody');
        const rowCountSpan = document.getElementById('tableRowCount');
        const pageInfo = document.getElementById('pageInfo');
        const globalSearch = document.getElementById('buildingTypeSearch').value.toLowerCase().trim();

        // Capture column filter values for highlighting
        const columnFilters = {};
        document.querySelectorAll('.filter-row input').forEach(input => {
            const col = input.dataset.column;
            const val = input.value.toLowerCase().trim();
            if (val) columnFilters[col] = val;
        });

        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">검색 결과가 없습니다</td></tr>';
            rowCountSpan.textContent = '0';
            pageInfo.textContent = '0 / 0';
            return;
        }

        const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        const end = Math.min(start + ROWS_PER_PAGE, filteredData.length);
        const pageData = filteredData.slice(start, end);

        tbody.innerHTML = pageData.map(row => `
            <tr>
                <td>${highlight(row.군 || '', globalSearch, columnFilters['군'])}</td>
                <td>${highlight(row.시설군, globalSearch, columnFilters['시설군'])}</td>
                <td>${highlight(row.번호 + '호', globalSearch, columnFilters['번호'])}</td>
                <td>${highlight(row.유형, globalSearch, columnFilters['유형'])}</td>
                <td class="wrap-cell">${highlight(row.종류, globalSearch, columnFilters['종류'])}</td>
                <td class="wrap-cell">${highlight(row.비고 || '', globalSearch, columnFilters['비고'])}</td>
            </tr>
        `).join('');

        rowCountSpan.textContent = filteredData.length;
        pageInfo.textContent = `${currentPage} / ${totalPages}`;
    }

    function highlight(text, globalSearch, columnFilter) {
        if (!text) return '';
        text = String(text); // Ensure text is a string

        let terms = [];
        if (globalSearch) terms.push(escapeRegex(globalSearch));
        if (columnFilter) terms.push(escapeRegex(columnFilter));

        // Remove duplicates and empty strings
        terms = [...new Set(terms)].filter(t => t);

        if (terms.length === 0) return text;

        const regex = new RegExp(`(${terms.join('|')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
})();
