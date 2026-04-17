const products = [
  {id:1, name:"Беспроводные наушники", price:4990, img:"https://placehold.co/300x200?text=Headphones"},
  {id:2, name:"Смарт-часы", price:8990, img:"https://placehold.co/300x200?text=Watch"},
  {id:3, name:"Портативная колонка", price:3490, img:"https://placehold.co/300x200?text=Speaker"},
  {id:4, name:"Power Bank 20000", price:2490, img:"https://placehold.co/300x200?text=PowerBank"}
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const grid = document.getElementById("products");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalPrice = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout-btn");

function renderProducts() {
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="price">${p.price.toLocaleString()} ₽</div>
      <button class="btn primary" data-id="${p.id}">В корзину</button>
    </div>`).join("");
}

function updateCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  cartCount.textContent = cart.length;
  cartItems.innerHTML = cart.map((item, i) => `
    <li>${item.name} — ${item.price.toLocaleString()} ₽ <button class="remove" data-index="${i}">✕</button></li>
  `).join("");
  totalPrice.textContent = cart.reduce((s, i) => s + i.price, 0).toLocaleString();
}

grid.addEventListener("click", e => {
  if (e.target.dataset.id) {
    cart.push(products.find(x => x.id == e.target.dataset.id));
    updateCart();
  }
});

cartItems.addEventListener("click", e => {
  if (e.target.classList.contains("remove")) {
    cart.splice(e.target.dataset.index, 1);
    updateCart();
  }
});

cartBtn.onclick = () => cartModal.classList.remove("hidden");
closeCart.onclick = () => cartModal.classList.add("hidden");
checkoutBtn.onclick = () => alert("Подключите платежный шлюз (ЮKassa, CloudPayments и т.д.)");

renderProducts();
updateCart();
