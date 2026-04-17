document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('cart-empty');
    const fullMsg = document.getElementById('cart-full');

    if (cart.length === 0) {
        emptyMsg.classList.remove('hidden');
        fullMsg.classList.add('hidden');
        return;
    }

    emptyMsg.classList.add('hidden');
    fullMsg.classList.remove('hidden');

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
            <div class="item-info">
                <h3><a href="product.html?id=${item.id}">${item.name}</a></h3>
                <div style="color:#999; font-size:12px;">${item.sku}</div>
            </div>
            <div class="item-price">${item.price} ₽</div>
            <div class="qty-selector" style="width:fit-content;">
                <button onclick="updateQty(${item.id}, -1)">-</button>
                <input type="number" value="${item.qty}" readonly style="width:30px;">
                <button onclick="updateQty(${item.id}, 1)">+</button>
            </div>
            <div class="item-total">${item.price * item.qty} ₽</div>
            <button class="remove-btn" onclick="removeItem(${item.id})">×</button>
        </div>
    `).join('');

    updateSummary(cart);
}

window.updateQty = function(id, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(c => c.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    if(window.updateCartUI) window.updateCartUI();
};

window.removeItem = function(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(c => c.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    if(window.updateCartUI) window.updateCartUI();
};

function updateSummary(cart) {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    
    document.getElementById('total-qty').textContent = totalQty + ' шт.';
    document.getElementById('total-price').textContent = totalPrice.toLocaleString() + ' ₽';
}
