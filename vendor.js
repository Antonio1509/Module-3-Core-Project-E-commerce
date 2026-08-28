/* =========================================================
   LocalCart — vendor.js
   Loads a single vendor's storefront (vendor.html?id=v1) and
   renders their profile, stats, About tab, and product grid.
   ========================================================= */

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function pinIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
}
function starIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color:var(--star)"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L6 21l1.6-7L2.2 9.3l7.1-.7L12 2z"/></svg>`;
}
function boxIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8l-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>`;
}

function renderProductCard(product) {
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-thumb" style="background-image:url('${product.image}')">
      ${outOfStock ? '<span class="stock-badge low">Out of stock</span>' : ""}
      ${lowStock ? `<span class="stock-badge low">Only ${product.stock} left</span>` : ""}
    </div>
    <div class="product-body">
      <h4>${product.name}</h4>
      <div class="product-price">${formatPrice(product.price)} <span class="unit">/ ${product.unit}</span></div>
      <button class="add-to-cart" ${outOfStock ? "disabled style='opacity:.5;cursor:not-allowed'" : ""}>
        ${outOfStock ? "Unavailable" : "Add to cart"}
      </button>
    </div>
  `;

  const btn = card.querySelector(".add-to-cart");
  if (!outOfStock) {
    btn.addEventListener("click", () => addToCart(product, btn));
  }
  return card;
}

function renderVendor() {
  const id = getQueryParam("id");
  const vendor = id ? getVendorById(id) : null;

  if (!vendor) {
    document.getElementById("vendor-not-found").style.display = "block";
    return;
  }

  document.getElementById("vendor-content").style.display = "block";
  document.title = `${vendor.name} — LocalCart`;

  document.getElementById("store-banner").style.backgroundImage = `url('${vendor.cover}')`;
  document.getElementById("store-logo").textContent = vendor.logoText;
  document.getElementById("store-category").textContent = vendor.category;
  document.getElementById("store-name").textContent = vendor.name;

  document.getElementById("store-stats").innerHTML = `
    <span>${pinIcon()} ${vendor.location}</span>
    <span>${starIcon()} ${vendor.rating.toFixed(1)} (${vendor.reviewCount} reviews)</span>
    <span>${boxIcon()} ${getProductsByVendor(vendor.id).length} products</span>
  `;

  document.getElementById("about-text").textContent = vendor.about;
  document.getElementById("info-location").textContent = vendor.location;
  document.getElementById("info-response").textContent = vendor.responseTime;
  document.getElementById("info-delivery").textContent = vendor.deliveryArea;
  document.getElementById("info-shipping").textContent = vendor.shipping;
  document.getElementById("info-joined").textContent = vendor.joined;

  const products = getProductsByVendor(vendor.id);
  const grid = document.getElementById("product-grid");
  document.getElementById("product-count").textContent =
    `${products.length} product${products.length === 1 ? "" : "s"}`;

  grid.innerHTML = "";
  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state"><h3>No products yet</h3><p>${vendor.name} hasn't listed anything for sale.</p></div>`;
  } else {
    products.forEach(p => grid.appendChild(renderProductCard(p)));
  }

  // Follow toggle
  const followBtn = document.getElementById("follow-btn");
  followBtn.addEventListener("click", () => {
    const following = followBtn.classList.toggle("btn-primary");
    followBtn.classList.toggle("btn-outline", !following);
    followBtn.textContent = following ? "✓ Following" : "+ Follow";
    showToast(following ? `You're now following ${vendor.name}` : `Unfollowed ${vendor.name}`);
  });

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

renderVendor();