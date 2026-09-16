document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('#products-grid .products');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const clearSearch = document.getElementById('clear-search');
  if (!grid) return;

  let activeCategory = '';

  async function loadProducts() {
    grid.replaceChildren();
    try {
      const params = new URLSearchParams();
      const search = searchInput?.value.trim();
      if (search) params.set('search', search);
      if (activeCategory) params.set('category', activeCategory);
      const response = await apiFetch(`/products?${params.toString()}`);
    const products = Array.isArray(response.products)
      ? response.products
      : Array.isArray(response.data) ? response.data : [];

      products.forEach(product => grid.appendChild(createProductCard(product)));
      if (emptyState) emptyState.hidden = products.length !== 0;
      if (clearSearch) clearSearch.hidden = !search && !activeCategory;
      grid.querySelectorAll('.btn-add-cart').forEach(button => {
      button.addEventListener('click', async event => {
        event.stopPropagation();
        const productId = Number(button.closest('.product-card').dataset.id);
        try {
          await apiFetch('/cart/add', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity: 1 }) });
          button.textContent = 'Added';
          button.disabled = true;
        } catch (error) {
          alert(error.message || 'Could not add this product to your cart.');
        }
      });
      });
    } catch (error) {
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.innerHTML = `<p>${error.message || 'Could not load products.'}</p>`;
      }
    }
  }

  searchInput?.addEventListener('input', loadProducts);
  clearSearch?.addEventListener('click', () => {
    searchInput.value = '';
    activeCategory = '';
    document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
    loadProducts();
    searchInput.focus();
  });
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      activeCategory = activeCategory === card.dataset.category ? '' : card.dataset.category || '';
      document.querySelectorAll('.category-card').forEach(item => item.classList.toggle('active', item === card && Boolean(activeCategory)));
      loadProducts();
    });
  });

  await loadProducts();
});

function createProductCard(product) {
  const card = document.createElement('article');
  const price = Number(product.price || 0);
  const image = assetUrl(product.image_url || product.image || product.imageUrl || product.image_path || product.photo_url);
  card.className = 'product-card';
  card.dataset.id = product.id || product.product_id || '';
  card.dataset.productId = card.dataset.id;
  card.dataset.productName = product.name || '';
  card.dataset.name = product.name || '';
  card.dataset.vendor = product.vendor_name || product.vendor?.name || '';
  card.dataset.price = String(price);
  card.dataset.category = product.category || '';
  card.dataset.rating = product.rating || '';
  card.dataset.reviews = product.review_count || '';
  card.dataset.description = product.description || '';
  card.dataset.productDescription = product.description || '';
  card.innerHTML = `
    <div class="product-photo">${image ? `<img src="${image}" alt="${product.name || 'Product'}">` : ''}</div>
    <div class="product-info">
      <span class="category-pill">${product.category || ''}</span>
      <div class="product-vendor">${card.dataset.vendor}</div>
      <div class="product-name">${product.name || ''}</div>
      <div class="product-price">R${price.toFixed(2)}</div>
      <button class="btn-add-cart" type="button">Add to cart</button>
    </div>`;
  return card;
}
