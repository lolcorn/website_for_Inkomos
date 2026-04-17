document.addEventListener('DOMContentLoaded', () => {
    const state = {
        products: [],
        filteredProducts: [],
        brands: new Set(),
        categories: new Set(),
        filters: {
            priceFrom: null,
            priceTo: null,
            brands: [],
            categories: [],
            inStock: false,
            search: '',
            sort: 'popular',
            page: 1,
            perPage: 12
        }
    };

    const els = {
        productsGrid: document.getElementById('productsGrid'),
        productsCount: document.getElementById('productsCount'),
        brandsList: document.getElementById('brandsList'),
        categoryList: document.getElementById('categoryList'),
        priceFrom: document.getElementById('priceFrom'),
        priceTo: document.getElementById('priceTo'),
        inStock: document.getElementById('inStock'),
        sortBy: document.getElementById('sortBy'),
        pagination: document.getElementById('pagination'),
        pageTitle: document.getElementById('pageTitle')
    };

    init();

    async function init() {
        try {
            const res = await fetch('data/products.json');
            const data = await res.json();
            state.products = data.products;
            extractFilters();
            parseURLParams();
            renderFilters();
            applyFilters();
            setupEvents();
        } catch (err) {
            console.error('Error loading products:', err);
        }
    }

    function extractFilters() {
        state.products.forEach(p => {
            if (p.brand) state.brands.add(p.brand);
            if (p.category) state.categories.add(p.category);
        });
    }

    function parseURLParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('search')) state.filters.search = params.get('search');
        if (params.has('cat')) state.filters.categories = [params.get('cat')];
        if (params.has('brand')) state.filters.brands = [params.get('brand')];
    }

    function renderFilters() {
        if (els.brandsList) {
            els.brandsList.innerHTML = Array.from(state.brands).map(b => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${b}" ${state.filters.brands.includes(b) ? 'checked' : ''}>
                    <span>${b}</span>
                </label>
            `).join('');
        }

        if (els.categoryList) {
            const catNames = {
                'nku': 'НКУ',
                'avtomaty': 'Автоматические выключатели',
                'uzo': 'УЗО',
                'kontaktory': 'Контакторы'
            };
            els.categoryList.innerHTML = Array.from(state.categories).map(c => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${c}" ${state.filters.categories.includes(c) ? 'checked' : ''}>
                    <span>${catNames[c] || c}</span>
                </label>
            `).join('');
        }
    }

    function applyFilters() {
        let filtered = [...state.products];

        // Search
        if (state.filters.search) {
            const q = state.filters.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q)
            );
        }

        // Price
        if (state.filters.priceFrom) {
            filtered = filtered.filter(p => p.price >= state.filters.priceFrom);
        }
        if (state.filters.priceTo) {
            filtered = filtered.filter(p => p.price <= state.filters.priceTo);
        }

        // Brands
        if (state.filters.brands.length) {
            filtered = filtered.filter(p => state.filters.brands.includes(p.brand));
        }

        // Categories
        if (state.filters.categories.length) {
            filtered = filtered.filter(p => state.filters.categories.includes(p.category));
        }

        // Stock
        if (state.filters.inStock) {
            filtered = filtered.filter(p => p.inStock !== false);
        }

        // Sort
        switch (state.filters.sort) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        state.filteredProducts = filtered;
        updatePagination();
        renderProducts();
    }

    function renderProducts() {
        const start = (state.filters.page - 1) * state.filters.perPage;
        const end = start + state.filters.perPage;
        const pageProducts = state.filteredProducts.slice(start, end);

        if (els.productsGrid) {
            if (pageProducts.length === 0) {
                els.productsGrid.innerHTML = '<div class="no-products"><h3>Товары не найдены</h3><p>Попробуйте изменить параметры поиска</p></div>';
            } else {
                els.productsGrid.innerHTML = pageProducts.map(p => createProductCard(p)).join('');
            }
        }

        if (els.productsCount) {
            els.productsCount.textContent = `Найдено товаров: ${state.filteredProducts.length}`;
        }

        if (els.pageTitle && state.filters.search) {
            els.pageTitle.textContent = `Поиск: "${state.filters.search}"`;
        }
    }

    function createProductCard(p) {
        const oldPrice = p.oldPrice ? `<span class="old">${p.oldPrice} ₽</span>` : '';
        const badge = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
        
        return `
            <div class="product-card">
                ${badge}
                <div class="product-image">
                    <img src="${p.image || 'https://via.placeholder.com/300x220'}" alt="${p.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-brand">${p.brand || ''}</div>
                    <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
                    <div class="product-sku">Арт: ${p.sku || '-'}</div>
                    <div class="product-footer">
                        <div class="product-price">${p.price} ₽ ${oldPrice}</div>
                        <button class="add-to-cart" onclick="addToCart(${p.id})">В корзину</button>
                    </div>
                </div>
            </div>
        `;
    }

    function updatePagination() {
        const totalPages = Math.ceil(state.filteredProducts.length / state.filters.perPage);
        if (totalPages <= 1) {
            if (els.pagination) els.pagination.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= state.filters.page - 2 && i <= state.filters.page + 2)) {
                html += `<button class="${i === state.filters.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            } else if (i === state.filters.page - 3 || i === state.filters.page + 3) {
                html += '<span>...</span>';
            }
        }
        if (els.pagination) els.pagination.innerHTML = html;
    }

    window.goToPage = function(page) {
        state.filters.page = page;
        applyFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.resetFilters = function() {
        state.filters = {
            priceFrom: null,
            priceTo: null,
            brands: [],
            categories: [],
            inStock: false,
            search: '',
            sort: 'popular',
            page: 1,
            perPage: 12
        };
        if (els.priceFrom) els.priceFrom.value = '';
        if (els.priceTo) els.priceTo.value = '';
        if (els.inStock) els.inStock.checked = false;
        if (els.sortBy) els.sortBy.value = 'popular';
        applyFilters();
        renderFilters();
    };

    function setupEvents() {
        // Price filters
        if (els.priceFrom) els.priceFrom.addEventListener('change', (e) => {
            state.filters.priceFrom = e.target.value ? +e.target.value : null;
            state.filters.page = 1;
            applyFilters();
        });

        if (els.priceTo) els.priceTo.addEventListener('change', (e) => {
            state.filters.priceTo = e.target.value ? +e.target.value : null;
            state.filters.page = 1;
            applyFilters();
        });

        // Stock filter
        if (els.inStock) els.inStock.addEventListener('change', (e) => {
            state.filters.inStock = e.target.checked;
            state.filters.page = 1;
            applyFilters();
        });

        // Sort
        if (els.sortBy) els.sortBy.addEventListener('change', (e) => {
            state.filters.sort = e.target.value;
            applyFilters();
        });

        // Brand and category filters (event delegation)
        document.addEventListener('change', (e) => {
            if (e.target.matches('#brandsList input[type="checkbox"]')) {
                const brand = e.target.value;
                if (e.target.checked) {
                    state.filters.brands.push(brand);
                } else {
                    state.filters.brands = state.filters.brands.filter(b => b !== brand);
                }
                state.filters.page = 1;
                applyFilters();
            }

            if (e.target.matches('#categoryList input[type="checkbox"]')) {
                const cat = e.target.value;
                if (e.target.checked) {
                    state.filters.categories.push(cat);
                } else {
                    state.filters.categories = state.filters.categories.filter(c => c !== cat);
                }
                state.filters.page = 1;
                applyFilters();
            }
        });

        // View toggle
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                els.productsGrid.classList.toggle('list-view', btn.dataset.view === 'list');
            });
        });
    }
});
