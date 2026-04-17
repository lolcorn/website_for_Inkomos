document.addEventListener('DOMContentLoaded', () => {
    const state = {
        cart: JSON.parse(localStorage.getItem('cart')) || [],
        products: [],
        categories: []
    };

    const els = {
        cartCount: document.getElementById('cartCount'),
        searchInput: document.getElementById('searchInput'),
        categoriesList: document.getElementById('categoriesList'),
        featuredProducts: document.getElementById('featuredProducts'),
        popularCategories: document.getElementById('popularCategories')
    };

    init();

    async function init() {
        try {
            const res = await fetch('data/products.json');
            const data = await res.json();
            state.products = data.products;
            state.categories = data.categories;
        } catch {
            loadFallback();
        }
        render();
        setupEvents();
        updateCartUI();
    }

    function loadFallback() {
        state.categories = [
            {id:'nku',name:'НКУ',icon:''},{id:'avtomaty',name:'Автоматы',icon:''},
            {id:'uzo',name:'УЗО',icon:'🛡️'},{id:'kontaktory',name:'Контакторы',icon:'🔋'}
        ];
        state.products = [
            {id:1,name:'ABB SH203 C16',brand:'ABB',sku:'2CDS253001R0164',price:850,oldPrice:990,category:'avtomaty',image:'https://via.placeholder.com/300x220?text=ABB',badge:'Хит'},
            {id:2,name:'Legrand TX3 40A',brand:'Legrand',sku:'411624',price:2450,oldPrice:null,category:'uzo',image:'https://via.placeholder.com/300x220?text=Legrand',badge:'new'}
        ];
    }

    function render() {
        if (els.categoriesList) els.categoriesList.innerHTML = state.categories.map(c => `<li><a href="catalog.html?cat=${c.id}"><span class="icon">${c.icon}</span> ${c.name}</a></li>`).join('');
        if (els.featuredProducts) els.featuredProducts.innerHTML = state.products.filter(p=>p.badge==='Хит').slice(0,4).map(createCard).join('');
        if (els.popularCategories) els.popularCategories.innerHTML = state.categories.slice(0,4).map(c => `<div class="category-card" onclick="location.href='catalog.html?cat=${c.id}'"><div class="icon">${c.icon}</div><h3>${c.name}</h3><p>В наличии</p></div>`).join('');
    }

    function createCard(p) {
        const old = p.oldPrice ? `<span class="old">${p.oldPrice} ₽</span>` : '';
        const badge = p.badge ? `<span class="product-badge ${p.badge==='new'?'new':''}">${p.badge==='new'?'Новинка':p.badge}</span>` : '';
        return `<div class="product-card"><div class="product-image">${badge}<img src="${p.image}" alt="${p.name}" loading="lazy"></div><div class="product-info"><div class="product-brand">${p.brand}</div><h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="product-sku">Арт: ${p.sku}</div><div class="product-footer"><div class="product-price">${p.price} ₽ ${old}</div><button class="add-to-cart" onclick="addToCart(${p.id})">В корзину</button></div></div></div>`;
    }

    window.addToCart = function(id) {
        const p = state.products.find(x=>x.id===id);
        if(!p) return;
        const ex = state.cart.find(x=>x.id===id);
        ex ? ex.qty++ : state.cart.push({...p, qty:1});
        localStorage.setItem('cart', JSON.stringify(state.cart));
        updateCartUI();
        notify('Добавлено в корзину');
    };

    function updateCartUI() {
        if(!els.cartCount) return;
        const t = state.cart.reduce((s,i)=>s+i.qty,0);
        els.cartCount.textContent = t;
        els.cartCount.style.display = t ? 'flex' : 'none';
    }

    function notify(msg) {
        const n = document.createElement('div');
        n.textContent = msg;
        Object.assign(n.style, {position:'fixed',bottom:'20px',right:'20px',background:'#4CAF50',color:'#fff',padding:'12px 20px',borderRadius:'8px',zIndex:'9999',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'});
        document.body.appendChild(n);
        setTimeout(()=>n.remove(),2500);
    }

    function setupEvents() {
        const q = (e) => e.target.value.trim() && (location.href = `catalog.html?search=${encodeURIComponent(e.target.value)}`);
        if(els.searchInput) els.searchInput.addEventListener('keypress', q);
        if(els.sidebarSearch) els.sidebarSearch.addEventListener('keypress', q);
    }
});
