document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (!id) {
        window.location.href = 'catalog.html';
        return;
    }

    try {
        const res = await fetch('data/products.json');
        const data = await res.json();
        const product = data.products.find(p => p.id === id);

        if (!product) {
            document.body.innerHTML = '<h2 style="text-align:center;margin-top:50px;">Товар не найден</h2>';
            return;
        }

        renderProduct(product);
    } catch (e) {
        console.error('Error loading product', e);
    }
});

function renderProduct(p) {
    document.getElementById('product-loading').classList.add('hidden');
    document.getElementById('product-detail').classList.remove('hidden');
    document.getElementById('breadcrumb-current').textContent = p.name;

    document.getElementById('product-img').src = p.image || 'https://via.placeholder.com/600';
    document.getElementById('product-brand').textContent = p.brand;
    document.getElementById('product-title').textContent = p.name;
    document.getElementById('product-sku').textContent = p.sku;
    document.getElementById('product-price').textContent = p.price + ' ₽';
    
    const oldPriceEl = document.getElementById('product-old-price');
    if (p.oldPrice) {
        oldPriceEl.textContent = p.oldPrice + ' ₽';
    } else {
        oldPriceEl.style.display = 'none';
    }

    document.getElementById('spec-brand').textContent = p.brand;
    document.getElementById('spec-category').textContent = p.category;
}

function changeQty(val) {
    const input = document.getElementById('product-qty');
    let current = parseInt(input.value);
    current += val;
    if (current < 1) current = 1;
    input.value = current;
}

function addToCartFromProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const qty = parseInt(document.getElementById('product-qty').value);
    
    // Вызываем глобальную функцию из main.js, но нужно передать qty
    // Так как addToCart в main.js принимает только id, модифицируем логику здесь для простоты
    const product = window.state ? window.state.products.find(p => p.id === id) : null;
    
    if (product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(c => c.id === id);
        
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ ...product, qty: qty });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.reload(); // Обновляем счетчик в хедере
        alert('Добавлено в корзину!');
    }
}
