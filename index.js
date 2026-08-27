/* ===========================================================
   LocalCart — front-end interactivity
   Covers: theme toggle, product search, category filtering,
   shopping cart (add/remove/clear/subtotal), smooth scroll
   for the "Browse products" button, and basic nav active state.
   No backend — cart state lives in memory for this session only.
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSmoothNav();
  const getProductCards = () => Array.from(document.querySelectorAll('.product-card'));
  const state = {
    searchTerm: '',
    activeCategory: null, // null = show all categories
  };

  initCategoryFilter(state, getProductCards, applyFilters);
  initSearch(state, applyFilters);
  const cart = initCart();
  initAddToCart(cart);
  applyFilters(state, getProductCards);
});

/* ---------------------------------------------------------
   Theme toggle (light / dark)
--------------------------------------------------------- */
function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
  });
}

/* ---------------------------------------------------------
   Smooth scroll for the hero "Browse products" button
   and simple active-link swapping in the main nav.
--------------------------------------------------------- */
function initSmoothNav() {
  const browseBtn = document.getElementById('browse-btn');
  const productsSection = document.getElementById('products-grid');
  if (browseBtn && productsSection) {
    browseBtn.addEventListener('click', () => {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const navLinks = document.querySelectorAll('header nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ---------------------------------------------------------
   Category filter — click a category card to filter the
   Featured products grid; click again to clear the filter.
--------------------------------------------------------- */
function initCategoryFilter(state, getProductCards, applyFilters) {
  const categoryCards = document.querySelectorAll('.category-card');

  categoryCards.forEach((card) => {
    const activate = () => {
      const category = card.dataset.category;
      const alreadyActive = card.classList.contains('active');

      categoryCards.forEach((c) => c.classList.remove('active'));

      if (alreadyActive) {
        state.activeCategory = null;
      } else {
        card.classList.add('active');
        state.activeCategory = category;
      }
      applyFilters(state, getProductCards);

      // Bring the products into view so the filter result is obvious
      const productsSection = document.getElementById('products-grid');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

/* ---------------------------------------------------------
   Live search — filters Featured products by name or vendor
   as the user types. Works together with the category filter.
--------------------------------------------------------- */
function initSearch(state, applyFilters) {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    state.searchTerm = input.value.trim().toLowerCase();
    applyFilters(state, () => Array.from(document.querySelectorAll('.product-card')));
  });
}

/* ---------------------------------------------------------
   Shared filter logic: shows/hides product cards based on
   the current search term and active category, and toggles
   the "no products match" empty state message.
--------------------------------------------------------- */
function applyFilters(state, getProductCards) {
  const cards = getProductCards();
  const emptyState = document.getElementById('empty-state');
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesCategory = !state.activeCategory || card.dataset.category === state.activeCategory;
    const haystack = `${card.dataset.name} ${card.dataset.vendor}`.toLowerCase();
    const matchesSearch = !state.searchTerm || haystack.includes(state.searchTerm);
    const visible = matchesCategory && matchesSearch;

    card.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });

  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
}

/* ---------------------------------------------------------
   Shopping cart — in-memory only (resets on page reload).
   Handles opening/closing the panel, rendering line items,
   updating the subtotal, removing items and clearing the cart.
--------------------------------------------------------- */
function initCart() {
  const cartButton = document.getElementById('cart-button');
  const cartPanel = document.getElementById('cart-panel');
  const cartCount = document.getElementById('cart-count');
  const cartItemsList = document.getElementById('cart-items');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartClearBtn = document.getElementById('cart-clear');
  const cartCheckoutBtn = document.getElementById('cart-checkout');

  let items = []; // { name, vendor, price, qty }

  function formatRand(amount) {
    return `R${amount.toFixed(2)}`;
  }

  function render() {
    // Count badge
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) {
      cartCount.textContent = String(totalQty);
      cartCount.hidden = totalQty === 0;
    }

    // Line items
    if (cartItemsList) {
      cartItemsList.innerHTML = '';
      if (items.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'cart-empty';
        empty.textContent = 'Your cart is empty.';
        cartItemsList.appendChild(empty);
      } else {
        items.forEach((item, index) => {
          const li = document.createElement('li');
          li.className = 'cart-item';
          li.innerHTML = `
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-meta">${item.vendor} · Qty ${item.qty}</div>
            </div>
            <div class="cart-item-right">
              <span class="cart-item-price">${formatRand(item.price * item.qty)}</span>
              <button class="cart-item-remove" aria-label="Remove ${item.name}" data-index="${index}">&times;</button>
            </div>
          `;
          cartItemsList.appendChild(li);
        });
      }
    }

    // Subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (cartSubtotal) cartSubtotal.textContent = formatRand(subtotal);
    if (cartCheckoutBtn) cartCheckoutBtn.disabled = items.length === 0;
  }

  function addItem(name, vendor, price) {
    const existing = items.find((item) => item.name === name && item.vendor === vendor);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ name, vendor, price, qty: 1 });
    }
    render();
  }

  function removeItem(index) {
    items.splice(index, 1);
    render();
  }

  function clearCart() {
    items = [];
    render();
  }

  // Toggle panel open/closed
  if (cartButton && cartPanel) {
    cartButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = cartPanel.hidden;
      cartPanel.hidden = !isHidden;
      cartButton.setAttribute('aria-expanded', String(isHidden));
    });

    // Close when clicking outside the panel
    document.addEventListener('click', (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const clickedInside = path.includes(cartPanel) || path.includes(cartButton);
      if (!cartPanel.hidden && !clickedInside) {
        cartPanel.hidden = true;
        cartButton.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !cartPanel.hidden) {
        cartPanel.hidden = true;
        cartButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Remove-item clicks (event delegation, since items re-render)
  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart-item-remove');
      if (!btn) return;
      removeItem(Number(btn.dataset.index));
    });
  }

  if (cartClearBtn) {
    cartClearBtn.addEventListener('click', clearCart);
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      if (items.length === 0) return;
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      alert(`Checkout is a demo in this build.\n\nItems: ${items.reduce((s, i) => s + i.qty, 0)}\nSubtotal: ${formatRand(subtotal)}`);
    });
  }

  render();

  return { addItem };
}

/* ---------------------------------------------------------
   Wires each product card's "Add to cart" button to the cart.
--------------------------------------------------------- */
function initAddToCart(cart) {
  document.querySelectorAll('.product-card').forEach((card) => {
    const btn = card.querySelector('.btn-add-cart');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const name = card.dataset.name;
      const vendor = card.dataset.vendor;
      const price = parseFloat(card.dataset.price);

      cart.addItem(name, vendor, price);

      // Brief visual confirmation on the button itself
      const originalText = btn.textContent;
      btn.textContent = 'Added ✓';
      btn.classList.add('added');
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('added');
        btn.disabled = false;
      }, 900);
    });
  });
}