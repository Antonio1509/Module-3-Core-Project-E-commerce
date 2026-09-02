/* ===========================================================
   LocalCart — shared front-end script
   Every init function checks for its target elements before
   doing anything, so this one file can be safely included on
   every page (index, about, contact, vendor-dashboard, ...)
   without erroring on pages that don't have those elements.

   Cart + theme are persisted in localStorage since this is a
   real multi-page site now (state needs to survive navigating
   from index.html -> cart.html, etc.), not a single-page demo.
   =========================================================== */

const CART_KEY = 'localcart_cart_v1';
const THEME_KEY = 'localcart_theme';
const SEARCH_HISTORY_KEY = 'localcart_recent_searches';
const VIEWED_KEY = 'localcart_recently_viewed';
const FOLLOWED_KEY = 'localcart_followed_vendors';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initBrowseButton();
  initSearch();
  initCategoryFilter();
  initAddToCart();
  renderCartBadge();
  initVendorDashboard();
  initContactForm();
  initVendorFollowButtons();
  initProductViewTracking();
  initAvatarPanel();
  initProductModal();
  initAddProductButton();
  initAddProductForm();
  initDashboardButtons(); // New: handles add-product.html form
});

/* ---------------------------------------------------------
   Theme toggle — persisted across pages via localStorage,
   falls back to system preference on first visit.
--------------------------------------------------------- */
function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');

  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', stored || (prefersLight ? 'light' : 'dark'));

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  });
}

/* ---------------------------------------------------------
   Add Product Button Navigation
--------------------------------------------------------- */
function initAddProductButton() {
  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'add-product.html';
    });
  }
}

/* ---------------------------------------------------------
   Add Product Form - handles the add-product.html page
--------------------------------------------------------- */
function initAddProductForm() {
  // Check if we're on the add-product page
  const form = document.getElementById('add-product-form');
  if (!form) return;

  // Load vendor info
  function loadVendorInfo() {
    try {
      const vendorData = JSON.parse(localStorage.getItem('localcart_vendor_data') || '{}');
      const currentVendor = localStorage.getItem('localcart_current_vendor') || "Maya's Kitchen";
      
      if (vendorData[currentVendor]) {
        const vendor = vendorData[currentVendor];
        const vendorNameEl = document.getElementById('vendor-name');
        const avatarDisplay = document.getElementById('avatar-display');
        if (vendorNameEl) vendorNameEl.textContent = vendor.name;
        if (avatarDisplay) {
          const initials = vendor.name.split(' ').map(p => p[0]).join('');
          avatarDisplay.textContent = initials;
        }
      }
    } catch (e) {
      console.warn('Could not load vendor info:', e);
    }
  }
  loadVendorInfo();

  // Image Upload
  const uploadArea = document.getElementById('image-upload-area');
  const fileInput = document.getElementById('product-image');
  const previewContainer = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeImageBtn = document.getElementById('remove-image');

  let uploadedImage = null;

  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          if (previewImg) previewImg.src = event.target.result;
          if (previewContainer) previewContainer.style.display = 'inline-block';
          if (uploadArea) uploadArea.classList.add('has-image');
          uploadedImage = file;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--accent)';
      uploadArea.style.background = 'var(--card-hover)';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.background = 'transparent';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.background = 'transparent';
      const file = e.dataTransfer.files[0];
      if (file && fileInput) {
        fileInput.files = e.dataTransfer.files;
        const reader = new FileReader();
        reader.onload = function(event) {
          if (previewImg) previewImg.src = event.target.result;
          if (previewContainer) previewContainer.style.display = 'inline-block';
          if (uploadArea) uploadArea.classList.add('has-image');
          uploadedImage = file;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (fileInput) fileInput.value = '';
      if (previewContainer) previewContainer.style.display = 'none';
      if (uploadArea) uploadArea.classList.remove('has-image');
      uploadedImage = null;
    });
  }

  // Character Counter
  const description = document.getElementById('product-description');
  const charCount = document.getElementById('char-count');

  if (description && charCount) {
    description.addEventListener('input', function() {
      const count = this.value.length;
      charCount.textContent = count;
      charCount.classList.toggle('limit-reached', count >= 450);
    });
  }

  // Form Validation & Submit
  const publishBtn = form.querySelector('button[type="submit"]');
  const draftBtn = document.getElementById('save-draft-btn');

  function getFormData() {
    return {
      name: document.getElementById('product-name') ? document.getElementById('product-name').value.trim() : '',
      category: document.getElementById('product-category') ? document.getElementById('product-category').value : '',
      price: document.getElementById('product-price') ? parseFloat(document.getElementById('product-price').value) : NaN,
      stock: document.getElementById('product-stock') ? parseInt(document.getElementById('product-stock').value) : NaN,
      description: document.getElementById('product-description') ? document.getElementById('product-description').value.trim() : '',
      image: uploadedImage
    };
  }

  function validateForm(data) {
    const errors = [];
    if (!data.name) errors.push('Product name is required');
    if (!data.category) errors.push('Category is required');
    if (isNaN(data.price) || data.price <= 0) errors.push('Valid price is required');
    if (isNaN(data.stock) || data.stock < 0) errors.push('Valid stock quantity is required');
    return errors;
  }

  function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">×</button>
    `;
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  function handleSubmit(isDraft = false) {
    const data = getFormData();
    const errors = validateForm(data);

    if (errors.length > 0) {
      showToast('Validation Error', errors.join('<br>'), 'error');
      return;
    }

    // Disable buttons
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerHTML = '<span class="spinner"></span> Publishing...';
    }
    if (draftBtn) {
      draftBtn.disabled = true;
      draftBtn.innerHTML = '<span class="spinner"></span> Saving...';
    }

    // Simulate API call
    setTimeout(() => {
      try {
        let vendorData = JSON.parse(localStorage.getItem('localcart_vendor_data') || '{}');
        let currentVendor = localStorage.getItem('localcart_current_vendor') || "Maya's Kitchen";

        if (vendorData[currentVendor]) {
          const newProduct = {
            id: `p${Date.now()}`,
            name: data.name,
            price: data.price,
            stock: data.stock,
            category: data.category,
            description: data.description,
            image: data.image ? URL.createObjectURL(data.image) : null,
            status: isDraft ? 'draft' : 'published'
          };

          vendorData[currentVendor].products.push(newProduct);
          localStorage.setItem('localcart_vendor_data', JSON.stringify(vendorData));

          const status = isDraft ? 'saved as draft' : 'published';
          showToast(
            `✅ Product ${status}!`,
            `"${data.name}" has been ${status}.`,
            'success'
          );

          form.reset();
          if (description) description.dispatchEvent(new Event('input'));
          if (previewContainer) previewContainer.style.display = 'none';
          if (uploadArea) uploadArea.classList.remove('has-image');
          uploadedImage = null;
          if (fileInput) fileInput.value = '';

          setTimeout(() => {
            window.location.href = 'vendor-dashboard.html';
          }, 2000);
        } else {
          showToast('Error', 'Vendor not found. Please try again.', 'error');
        }
      } catch (e) {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
      }

      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Publish Product
        `;
      }
      if (draftBtn) {
        draftBtn.disabled = false;
        draftBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save as Draft
        `;
      }
    }, 1200);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(false);
    });
  }

  if (draftBtn) {
    draftBtn.addEventListener('click', () => {
      handleSubmit(true);
    });
  }

  // Keyboard shortcut: Ctrl+S or Cmd+S to save draft
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      const activeElement = document.activeElement;
      if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
        e.preventDefault();
        if (draftBtn) draftBtn.click();
      }
    }
  });
}

/* ---------------------------------------------------------
   "Browse products" hero button — smooth-scrolls to the
   Featured products grid, only present on the shop page.
--------------------------------------------------------- */
function initBrowseButton() {
  const browseBtn = document.getElementById('browse-btn') || document.getElementById('browse-products');
  const productsGrid = document.getElementById('products-grid');
  if (!browseBtn || !productsGrid) return;

  browseBtn.addEventListener('click', () => {
    productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ---------------------------------------------------------
   Search box — two modes:
   - On the shop page (has #products-grid): filters product
     cards live as you type, combined with any active category.
   - On every other page: pressing Enter redirects to
     index.html?q=<term> so search works from anywhere on the site.
   Also reads ?q= on the shop page itself so a search that
   redirected here pre-fills and applies automatically.
--------------------------------------------------------- */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  const productsGrid = document.getElementById('products-grid');

  if (!productsGrid) {
    // Not the shop page — Enter redirects to the shop with the query.
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const term = input.value.trim();
      if (term) recordSearch(term);
      window.location.href = term ? `index.html?q=${encodeURIComponent(term)}` : 'index.html';
    });
    return;
  }

  // Shop page: live filtering.
  const state = { searchTerm: '', activeCategory: null };

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    input.value = q;
    state.searchTerm = q.trim().toLowerCase();
    recordSearch(q.trim());
  }

  input.addEventListener('input', () => {
    state.searchTerm = input.value.trim().toLowerCase();
    applyFilters(state);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const term = input.value.trim();
    if (term) recordSearch(term);
  });

  // Expose so initCategoryFilter (defined separately) can share the same state.
  window.__localcartFilterState = state;
  applyFilters(state);
}

/* ---------------------------------------------------------
   Category filter — click a category card to filter the
   Featured products grid; click again to clear it.
--------------------------------------------------------- */
function initCategoryFilter() {
  const categoryCards = document.querySelectorAll('.category-card');
  const productsGrid = document.getElementById('products-grid');
  if (!categoryCards.length || !productsGrid) return;

  const state = window.__localcartFilterState || { searchTerm: '', activeCategory: null };
  window.__localcartFilterState = state;

  categoryCards.forEach((card) => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    if (!card.hasAttribute('role')) card.setAttribute('role', 'button');

    const activate = () => {
      const category = card.dataset.category;
      if (!category) return; // card not wired for filtering
      const alreadyActive = card.classList.contains('active');

      categoryCards.forEach((c) => c.classList.remove('active'));

      state.activeCategory = alreadyActive ? null : category;
      if (!alreadyActive) card.classList.add('active');

      applyFilters(state);
      productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

function applyFilters(state) {
  const cards = Array.from(document.querySelectorAll('.product-card'));
  const emptyState = document.getElementById('empty-state');
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesCategory = !state.activeCategory || card.dataset.category === state.activeCategory;
    const haystack = `${card.dataset.name || ''} ${card.dataset.vendor || ''}`.toLowerCase();
    const matchesSearch = !state.searchTerm || haystack.includes(state.searchTerm);
    const visible = matchesCategory && matchesSearch;

    card.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });

  if (emptyState) emptyState.hidden = visibleCount !== 0 || cards.length === 0;
}

/* ---------------------------------------------------------
   Cart — persisted in localStorage so it survives navigating
   between pages (index.html -> cart.html, etc).
--------------------------------------------------------- */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(items) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* ignore */ }
}

function addToCart(name, vendor, price) {
  const items = getCart();
  const existing = items.find((i) => i.name === name && i.vendor === vendor);
  if (existing) {
    existing.qty += 1;
  } else {
    items.push({ name, vendor, price, qty: 1 });
  }
  saveCart(items);
  renderCartBadge();
}

function renderCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const totalQty = getCart().reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = String(totalQty);
  if (badge.hasAttribute('hidden') || badge.hidden !== undefined) {
    badge.hidden = totalQty === 0 && badge.dataset.hideWhenEmpty === 'true';
  }
}

function initAddToCart() {
  document.querySelectorAll('.product-card').forEach((card) => {
    const btn = card.querySelector('.btn-add-cart');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = card.dataset.name;
      const vendor = card.dataset.vendor;
      const price = parseFloat(card.dataset.price);
      if (!name || Number.isNaN(price)) return;

      addToCart(name, vendor, price);

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

/* ===========================================================
   Vendor dashboard — client-side vendor switcher.
   No backend yet, so "logging in as a different vendor" is
   simulated: picking a vendor from the dropdown swaps the
   welcome text, avatar, stats and recent-orders table using
   the sample data below.
   =========================================================== */
const VENDORS = {
  maya: {
    name: "Maya's Kitchen",
    initial: 'M',
    sales: 'R4,280',
    orders: 38,
    rating: '4.8',
    recentOrders: [
      { id: '#LC-10482', item: 'Honey oat cookies x2', status: 'packing', amount: 'R170.00' },
      { id: '#LC-10475', item: 'Ginger snap box', status: 'delivered', amount: 'R95.00' },
      { id: '#LC-10461', item: 'Honey oat cookies x1', status: 'delivered', amount: 'R85.00' },
    ],
  },
  naledi: {
    name: 'Naledi Naturals',
    initial: 'N',
    sales: 'R6,150',
    orders: 52,
    rating: '4.9',
    recentOrders: [
      { id: '#LC-10490', item: 'Whipped Shea Body Butter x3', status: 'delivered', amount: 'R360.00' },
      { id: '#LC-10488', item: 'Rooibos & Honey Lip Balm x2', status: 'packing', amount: 'R70.00' },
      { id: '#LC-10479', item: 'Whipped Shea Body Butter x1', status: 'delivered', amount: 'R120.00' },
    ],
  },
  zanele: {
    name: 'Zanele Beadwork',
    initial: 'Z',
    sales: 'R2,940',
    orders: 14,
    rating: '4.6',
    recentOrders: [
      { id: '#LC-10471', item: 'Beaded Woven Tote Bag', status: 'delivered', amount: 'R385.00' },
      { id: '#LC-10466', item: 'Beaded Earrings Set', status: 'packing', amount: 'R140.00' },
      { id: '#LC-10450', item: 'Beaded Woven Tote Bag', status: 'delivered', amount: 'R385.00' },
    ],
  },
};

function initVendorDashboard() {
  const select = document.getElementById('vendor-switch');
  if (!select) return; // not on the vendor dashboard page

  const welcome = document.getElementById('dash-welcome');
  const vendorNameEl = document.getElementById('dash-vendor-name');
  const avatarEl = document.getElementById('dash-avatar');
  const salesEl = document.getElementById('stat-sales');
  const ordersEl = document.getElementById('stat-orders');
  const ratingEl = document.getElementById('stat-rating-value');
  const tbody = document.getElementById('orders-tbody');

  function renderVendor(key) {
    const v = VENDORS[key];
    if (!v) return;

    if (welcome) welcome.textContent = `Welcome back, ${v.name}`;
    if (vendorNameEl) vendorNameEl.textContent = v.name;
    if (avatarEl) avatarEl.textContent = v.initial;
    if (salesEl) salesEl.textContent = v.sales;
    if (ordersEl) ordersEl.textContent = String(v.orders);
    if (ratingEl) ratingEl.textContent = v.rating;

    if (tbody) {
      tbody.innerHTML = '';
      v.recentOrders.forEach((o) => {
        const tr = document.createElement('tr');
        const isDelivered = o.status === 'delivered';
        tr.innerHTML = `
          <td class="order-id">${o.id}</td>
          <td>${o.item}</td>
          <td><span class="status-pill ${isDelivered ? 'status-delivered' : 'status-packing'}">${isDelivered ? 'Delivered' : 'Packing'}</span></td>
          <td class="num amount">${o.amount}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  select.addEventListener('change', () => renderVendor(select.value));
  renderVendor(select.value);
}

/* ---------------------------------------------------------
   Contact form — client-side validation + a simulated submit
   (there's no backend yet). Shows inline field errors and a
   success message, then resets the form.
--------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successBox = document.getElementById('form-success');
  const submitBtn = form.querySelector('button[type="submit"]');

  const fields = {
    name: form.querySelector('#contact-name'),
    email: form.querySelector('#contact-email'),
    topic: form.querySelector('#contact-topic'),
    message: form.querySelector('#contact-message'),
  };

  function setError(fieldKey, show) {
    const field = fields[fieldKey];
    if (!field) return;
    const group = field.closest('.form-group');
    if (group) group.classList.toggle('invalid', show);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    let valid = true;

    if (!fields.name.value.trim()) {
      setError('name', true);
      valid = false;
    } else {
      setError('name', false);
    }

    if (!isValidEmail(fields.email.value.trim())) {
      setError('email', true);
      valid = false;
    } else {
      setError('email', false);
    }

    if (!fields.message.value.trim()) {
      setError('message', true);
      valid = false;
    } else {
      setError('message', false);
    }

    return valid;
  }

  // Clear a field's error state as soon as the person fixes it.
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field) return;
    field.addEventListener('input', () => setError(key, false));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (successBox) successBox.classList.remove('visible');

    if (!validate()) return;

    // No backend yet — simulate a network round-trip, then confirm.
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      form.reset();
      if (successBox) successBox.classList.add('visible');
    }, 600);
  });
}

/* ===========================================================
   Account history — recent searches, recently viewed products,
   and followed vendors. Everything here is genuinely tracked
   from real interactions (not placeholder data) and stored in
   localStorage, since there's no backend/auth yet.
   =========================================================== */

function getList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

function recordSearch(term) {
  if (!term) return;
  let list = getList(SEARCH_HISTORY_KEY).filter((t) => t.toLowerCase() !== term.toLowerCase());
  list.unshift(term);
  saveList(SEARCH_HISTORY_KEY, list.slice(0, 8));
}

function recordViewed(name, vendor) {
  if (!name) return;
  let list = getList(VIEWED_KEY).filter((p) => !(p.name === name && p.vendor === vendor));
  list.unshift({ name, vendor });
  saveList(VIEWED_KEY, list.slice(0, 8));
}

function isFollowing(vendor) {
  return getList(FOLLOWED_KEY).includes(vendor);
}

function toggleFollow(vendor) {
  const list = getList(FOLLOWED_KEY);
  const idx = list.indexOf(vendor);
  if (idx === -1) {
    list.unshift(vendor);
  } else {
    list.splice(idx, 1);
  }
  saveList(FOLLOWED_KEY, list);
  return list.includes(vendor);
}

/* ---------------------------------------------------------
   Tracks "recently viewed" whenever a product card is clicked
   (anywhere other than its Add to cart button, which already
   stops propagation on its own click handler).
--------------------------------------------------------- */
function initProductViewTracking() {
  document.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.dataset.name) recordViewed(card.dataset.name, card.dataset.vendor || '');
    });
  });
}

/* ---------------------------------------------------------
   Injects a small follow-toggle star into every product card's
   vendor label, so "vendors you follow" reflects real clicks
   without requiring any HTML changes on existing pages.
--------------------------------------------------------- */
const FOLLOW_ICON_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';

function initVendorFollowButtons() {
  document.querySelectorAll('.product-vendor').forEach((el) => {
    if (el.querySelector('.follow-toggle')) return; // already injected
    const vendorName = el.textContent.trim();
    if (!vendorName) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'follow-toggle';
    btn.dataset.vendor = vendorName;
    btn.setAttribute('aria-label', `Follow ${vendorName}`);
    btn.innerHTML = FOLLOW_ICON_SVG;
    if (isFollowing(vendorName)) btn.classList.add('following');

    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't also record this as a "product viewed" click
      const nowFollowing = toggleFollow(vendorName);
      btn.classList.toggle('following', nowFollowing);
      if (typeof window.__localcartRenderAvatarPanel === 'function') {
        window.__localcartRenderAvatarPanel();
      }
    });

    el.appendChild(btn);
  });
}

function syncFollowButtons() {
  document.querySelectorAll('.follow-toggle').forEach((btn) => {
    btn.classList.toggle('following', isFollowing(btn.dataset.vendor));
  });
}

/* ---------------------------------------------------------
   Avatar account panel — click the avatar (id="user-avatar")
   to see recent searches, recently viewed products, and
   followed vendors. Deliberately scoped to #user-avatar only,
   so it never attaches to the vendor dashboard's own avatar
   (#dash-avatar), which represents a different persona.
--------------------------------------------------------- */
function initAvatarPanel() {
  const avatar = document.getElementById('user-avatar');
  const panel = document.getElementById('avatar-panel');
  if (!avatar || !panel) return;

  function renderRow(listId, items, emptyText, mapFn) {
    const ul = document.getElementById(listId);
    if (!ul) return;
    ul.innerHTML = '';

    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'avatar-panel-empty';
      li.textContent = emptyText;
      ul.appendChild(li);
      return;
    }

    items.forEach((raw) => {
      const { label, onClick, onRemove } = mapFn(raw);
      const li = document.createElement('li');
      li.className = 'avatar-panel-item';

      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'item-link';
      link.textContent = label;
      if (onClick) {
        link.addEventListener('click', onClick);
      } else {
        link.style.cursor = 'default';
      }
      li.appendChild(link);

      if (onRemove) {
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'item-remove';
        rm.setAttribute('aria-label', `Remove ${label}`);
        rm.textContent = '\u00d7';
        rm.addEventListener('click', onRemove);
        li.appendChild(rm);
      }

      ul.appendChild(li);
    });
  }

  function renderPanel() {
    renderRow('recent-searches-list', getList(SEARCH_HISTORY_KEY), 'No recent searches.', (term) => ({
      label: term,
      onClick: () => { window.location.href = `index.html?q=${encodeURIComponent(term)}`; },
    }));

    renderRow('recently-viewed-list', getList(VIEWED_KEY), 'No products viewed yet.', (p) => ({
      label: p.vendor ? `${p.name} · ${p.vendor}` : p.name,
    }));

    renderRow('followed-vendors-list', getList(FOLLOWED_KEY), "You're not following any vendors yet.", (vendor) => ({
      label: vendor,
      onRemove: () => {
        toggleFollow(vendor);
        syncFollowButtons();
        renderPanel();
      },
    }));
  }

  window.__localcartRenderAvatarPanel = renderPanel;

  function openPanel() {
    panel.hidden = false;
    avatar.setAttribute('aria-expanded', 'true');
    renderPanel();
  }
  function closePanel() {
    panel.hidden = true;
    avatar.setAttribute('aria-expanded', 'false');
  }

  avatar.addEventListener('click', () => {
    if (panel.hidden) openPanel(); else closePanel();
  });
  avatar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      avatar.click();
    }
  });

  document.addEventListener('click', (e) => {
    const path = e.composedPath ? e.composedPath() : [];
    const clickedInside = path.includes(panel) || path.includes(avatar);
    if (!panel.hidden && !clickedInside) closePanel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });

  panel.addEventListener('click', (e) => {
    const clearBtn = e.target.closest('.panel-clear');
    if (!clearBtn) return;
    const which = clearBtn.dataset.clear;
    if (which === 'searches') saveList(SEARCH_HISTORY_KEY, []);
    if (which === 'viewed') saveList(VIEWED_KEY, []);
    if (which === 'follows') {
      saveList(FOLLOWED_KEY, []);
      syncFollowButtons();
    }
    renderPanel();
  });
}

/* ===========================================================
   Product detail modal — clicking a product card (anywhere
   except its Add to cart button or the vendor follow star,
   both of which already stop propagation) opens a modal with
   the image, rating, description and price, pulled straight
   from that card's data-* attributes. No HTML changes needed
   on existing pages — the modal markup is injected once here.
   =========================================================== */

function buildStarRating(rating) {
  const rounded = Math.round(rating * 2) / 2; // nearest 0.5
  let starsHtml = '';
  for (let i = 1; i <= 5; i += 1) {
    if (rounded >= i) {
      starsHtml += '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    } else if (rounded >= i - 0.5) {
      starsHtml += '<svg width="15" height="15" viewBox="0 0 24 24"><defs><clipPath id="half-star-clip"><rect x="0" y="0" width="12" height="24"></rect></clipPath></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="1.6"></polygon><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" clip-path="url(#half-star-clip)"></polygon></svg>';
    } else {
      starsHtml += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    }
  }
  return starsHtml;
}

function ensureProductModal() {
  let modal = document.getElementById('product-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'product-modal';
  modal.className = 'product-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="product-modal-backdrop" data-modal-close="true"></div>
    <div class="product-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <button type="button" class="product-modal-close" data-modal-close="true" aria-label="Close">&times;</button>
      <div class="product-modal-media" id="product-modal-media"></div>
      <div class="product-modal-body">
        <span class="category-pill" id="product-modal-category"></span>
        <div class="product-modal-vendor" id="product-modal-vendor"></div>
        <h2 class="product-modal-title" id="product-modal-title"></h2>
        <div class="product-modal-rating" id="product-modal-rating"></div>
        <div class="product-modal-price" id="product-modal-price"></div>
        <p class="product-modal-description" id="product-modal-description"></p>
        <button class="btn-primary product-modal-add" id="product-modal-add" type="button">Add to cart</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function initProductModal() {
  const cards = document.querySelectorAll('.product-card');
  if (!cards.length) return;

  const modal = ensureProductModal();
  const media = modal.querySelector('#product-modal-media');
  const categoryEl = modal.querySelector('#product-modal-category');
  const vendorEl = modal.querySelector('#product-modal-vendor');
  const titleEl = modal.querySelector('#product-modal-title');
  const ratingEl = modal.querySelector('#product-modal-rating');
  const priceEl = modal.querySelector('#product-modal-price');
  const descEl = modal.querySelector('#product-modal-description');
  const addBtn = modal.querySelector('#product-modal-add');

  let activeCard = null;

  function openModal(card) {
    activeCard = card;

    const name = card.dataset.name || '';
    const vendor = card.dataset.vendor || '';
    const category = card.dataset.category || '';
    const price = parseFloat(card.dataset.price);
    const rating = parseFloat(card.dataset.rating);
    const reviews = card.dataset.reviews;
    const description = card.dataset.description || 'No description provided for this product yet.';

    const img = card.querySelector('.product-photo img');
    media.innerHTML = img
      ? `<img src="${img.src}" alt="${name}">`
      : `<div class="product-modal-media-fallback"></div>`;

    categoryEl.textContent = category;
    categoryEl.hidden = !category;
    vendorEl.textContent = vendor;
    titleEl.textContent = name;
    priceEl.textContent = Number.isNaN(price) ? '' : `R${price.toFixed(2)}`;
    descEl.textContent = description;

    if (!Number.isNaN(rating)) {
      ratingEl.innerHTML = `<span class="star-row">${buildStarRating(rating)}</span><span class="rating-number">${rating.toFixed(1)}</span>${reviews ? `<span class="rating-count">(${reviews} reviews)</span>` : ''}`;
      ratingEl.hidden = false;
    } else {
      ratingEl.hidden = true;
    }

    addBtn.textContent = 'Add to cart';
    addBtn.classList.remove('added');
    addBtn.disabled = false;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    activeCard = null;
  }

  cards.forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openModal(card));
  });

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  addBtn.addEventListener('click', () => {
    if (!activeCard) return;
    const name = activeCard.dataset.name;
    const vendor = activeCard.dataset.vendor;
    const price = parseFloat(activeCard.dataset.price);
    if (!name || Number.isNaN(price)) return;

    addToCart(name, vendor, price);
    addBtn.textContent = 'Added ✓';
    addBtn.classList.add('added');
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.textContent = 'Add to cart';
      addBtn.classList.remove('added');
      addBtn.disabled = false;
    }, 900);
  });
}

// ==========================================================
// INITIAL PRODUCT FILTER
// ==========================================================

// Run filter after page loads
setTimeout(() => {
  applyFilters(window.__localcartFilterState || { searchTerm: '', activeCategory: null });
}, 100);

// ==========================================================
// CART PAGE FUNCTIONALITY (if on cart.html)
// ==========================================================

// This runs if cart.html exists
document.addEventListener('DOMContentLoaded', function() {
  const cartContainer = document.querySelector('.cart-items');
  const totalEl = document.querySelector('.cart-total');

  if (!cartContainer) return;

  function renderCart() {
    let cart = JSON.parse(localStorage.getItem("localcart-cart")) || [];

    if (cart.length === 0) {
      cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty. <a href="index.html">Start shopping</a></p>`;
      if (totalEl) totalEl.textContent = 'R0.00';
      return;
    }

    cartContainer.innerHTML = cart.map((item, index) => `
      <div class="cart-item" data-index="${index}">
        <span>${item.name}</span>
        <span>R${item.price.toFixed(2)}</span>
        <div class="qty-controls">
          <button class="qty-btn minus" data-index="${index}">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}">+</button>
        </div>
        <span>R${(item.price * item.quantity).toFixed(2)}</span>
        <button class="remove-item" data-index="${index}">✕</button>
      </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalEl) {
      totalEl.textContent = `R${total.toFixed(2)}`;
    }

    // Bind cart controls
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        let cart = JSON.parse(localStorage.getItem("localcart-cart")) || [];
        if (cart[index]) {
          cart[index].quantity -= 1;
          if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
          }
          localStorage.setItem("localcart-cart", JSON.stringify(cart));
          renderCart();
          // Update cart count in header
          const cartCount = document.getElementById("cart-count");
          if (cartCount) {
            const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalQty;
            cartCount.hidden = totalQty === 0;
          }
        }
      });
    });

    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        let cart = JSON.parse(localStorage.getItem("localcart-cart")) || [];
        if (cart[index]) {
          cart[index].quantity += 1;
          localStorage.setItem("localcart-cart", JSON.stringify(cart));
          renderCart();
          // Update cart count in header
          const cartCount = document.getElementById("cart-count");
          if (cartCount) {
            const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalQty;
            cartCount.hidden = totalQty === 0;
          }
        }
      });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        let cart = JSON.parse(localStorage.getItem("localcart-cart")) || [];
        cart.splice(index, 1);
        localStorage.setItem("localcart-cart", JSON.stringify(cart));
        renderCart();
        // Update cart count in header
        const cartCount = document.getElementById("cart-count");
        if (cartCount) {
          const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
          cartCount.textContent = totalQty;
          cartCount.hidden = totalQty === 0;
        }
      });
    });

    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        let cart = JSON.parse(localStorage.getItem("localcart-cart")) || [];
        if (cart.length === 0) {
          alert('Your cart is empty!');
          return;
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (confirm(`Confirm checkout for R${total.toFixed(2)}?`)) {
          localStorage.setItem("localcart-cart", JSON.stringify([]));
          renderCart();
          const cartCount = document.getElementById("cart-count");
          if (cartCount) {
            cartCount.textContent = '0';
            cartCount.hidden = true;
          }
          alert('✅ Order placed successfully!');
        }
      });
    }
  }

  /* ---------------------------------------------------------
   Dashboard Button Navigation - Overview & Monitor
--------------------------------------------------------- */
function initDashboardButtons() {
  // Overview button - navigate to rankoverview.html
  const overviewBtn = document.getElementById('overview-btn');
  if (overviewBtn) {
    overviewBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'rankoverview.html';
    });
  }

  // Monitor button - navigate to deliverytracker.html
  const monitorBtn = document.getElementById('monitor-btn');
  if (monitorBtn) {
    monitorBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'deliverytracker.html';
    });
  }
}

  renderCart();
});