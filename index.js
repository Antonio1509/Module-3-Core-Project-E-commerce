/* ===========================================================
   LocalCart — shared front-end script
   =========================================================== */

const CART_KEY = 'localcart_cart_v1';
const THEME_KEY = 'localcart_theme';
const SEARCH_HISTORY_KEY = 'localcart_recent_searches';
const VIEWED_KEY = 'localcart_recently_viewed';
const FOLLOWED_KEY = 'localcart_followed_vendors';
const USER_KEY = 'localcart_user';
const VENDOR_DATA_KEY = 'localcart_vendor_data';
const CURRENT_VENDOR_KEY = 'localcart_current_vendor';

/* ===========================================================
   AUTH / LOGIN — Full user management
   =========================================================== */

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Could not save user:', e);
  }
}

function isLoggedIn() {
  const user = getCurrentUser();
  return user && user.loggedIn === true;
}

function logoutUser() {
  localStorage.removeItem(USER_KEY);
  updateAllUserUI(null);
  window.location.href = 'index.html';
}

function loginUser(userData) {
  const user = {
    name: userData.name || 'Guest User',
    email: userData.email || '',
    initials: userData.initials || getInitials(userData.name || 'Guest User'),
    loggedIn: true,
    loginTime: Date.now()
  };
  setCurrentUser(user);
  updateAllUserUI(user);
  return user;
}

function getInitials(name) {
  if (!name) return 'GU';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ===========================================================
   VENDOR DATA MANAGEMENT
   =========================================================== */

function getVendorData() {
  try {
    const raw = localStorage.getItem(VENDOR_DATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveVendorData(data) {
  try {
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save vendor data:', e);
  }
}

function getCurrentVendorName() {
  return localStorage.getItem(CURRENT_VENDOR_KEY) || "Maya's Kitchen";
}

function setCurrentVendorName(name) {
  localStorage.setItem(CURRENT_VENDOR_KEY, name);
}

function getVendorProducts(vendorName) {
  const data = getVendorData();
  if (data[vendorName]) {
    return data[vendorName].products || [];
  }
  return [];
}

function addProductToVendor(vendorName, product) {
  const data = getVendorData();
  if (!data[vendorName]) {
    data[vendorName] = {
      name: vendorName,
      products: []
    };
  }
  if (!data[vendorName].products) {
    data[vendorName].products = [];
  }
  data[vendorName].products.push(product);
  saveVendorData(data);
  return product;
}

/* ===========================================================
   UI UPDATE FUNCTIONS
   =========================================================== */

function updateAllUserUI(user) {
  updateAvatar(user);
  updateWelcomeMessage(user);
  updateUserName(user);
  updateLogoutButton(user);
  updateProfileDropdown(user);
}

function updateAvatar(user) {
  const initials = user ? user.initials : 'GU';
  
  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) {
    avatarEl.textContent = initials;
  }
  
  document.querySelectorAll('.avatar:not(#user-avatar)').forEach(el => {
    if (!el.closest('.vendor-main') && !el.id === 'dash-avatar') {
      el.textContent = initials;
    }
  });
  
  const dashAvatar = document.getElementById('dash-avatar');
  if (dashAvatar && user) {
    dashAvatar.textContent = initials;
  }
}

function updateWelcomeMessage(user) {
  const welcomeEl = document.querySelector('.hero h1');
  if (welcomeEl && user) {
    const name = user.name || 'there';
    welcomeEl.textContent = `Welcome back, ${name}`;
  } else if (welcomeEl) {
    welcomeEl.textContent = 'Welcome to LocalCart';
  }
}

function updateUserName(user) {
  const nameEls = document.querySelectorAll('.user-name, .avatar-panel-header');
  if (nameEls.length && user) {
    nameEls.forEach(el => {
      if (el.classList.contains('avatar-panel-header')) {
        el.textContent = user.name || 'User';
      } else {
        el.textContent = user.name || 'User';
      }
    });
  }
}

function updateLogoutButton(user) {
  const panel = document.getElementById('avatar-panel');
  if (!panel) return;
  
  let logoutBtn = panel.querySelector('.logout-btn');
  
  if (user && isLoggedIn()) {
    if (!logoutBtn) {
      logoutBtn = document.createElement('button');
      logoutBtn.className = 'logout-btn';
      logoutBtn.textContent = 'Log Out';
      logoutBtn.type = 'button';
      logoutBtn.style.cssText = `
        display: block;
        width: 100%;
        padding: 10px;
        margin-top: 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--bg);
        color: var(--text);
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      `;
      logoutBtn.addEventListener('mouseenter', () => {
        logoutBtn.style.background = 'var(--card-hover)';
      });
      logoutBtn.addEventListener('mouseleave', () => {
        logoutBtn.style.background = 'var(--bg)';
      });
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutUser();
      });
      panel.appendChild(logoutBtn);
    }
  } else if (logoutBtn) {
    logoutBtn.remove();
  }
}

function updateProfileDropdown(user) {
  const profileName = document.querySelector('[data-profile-name]');
  const profileEmail = document.querySelector('[data-profile-email]');
  
  if (user) {
    if (profileName) profileName.textContent = user.name || 'User';
    if (profileEmail) profileEmail.textContent = user.email || 'user@example.com';
  }
}

/* ===========================================================
   DOM CONTENT LOADED
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  updateAllUserUI(user);
  
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
  initDashboardButtons();
  initCartButton();
  initLoginRedirect();
  initProfileDropdown();
  initVendorSearch(); // New function for vendor search
});

/* ---------------------------------------------------------
   Handle login redirect from login page
--------------------------------------------------------- */
function initLoginRedirect() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('login') === 'success') {
    const user = getCurrentUser();
    updateAllUserUI(user);
    const newUrl = window.location.pathname + window.location.search.replace(/[?&]login=success/, '');
    window.history.replaceState({}, document.title, newUrl);
  }
}

/* ---------------------------------------------------------
   Theme toggle
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
   Profile Dropdown
--------------------------------------------------------- */
function initProfileDropdown() {
  const toggle = document.getElementById('profile-toggle');
  const dropdown = document.getElementById('profile-dropdown');
  
  if (!toggle || !dropdown) return;
  
  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    dropdown.classList.toggle('open');
    this.setAttribute('aria-expanded', !isOpen);
  });
  
  document.addEventListener('click', function(e) {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Logout handler
  const logoutBtn = dropdown.querySelector('.logout-link');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logoutUser();
    });
  }
}

/* ---------------------------------------------------------
   Cart button — check login before navigating
--------------------------------------------------------- */
function initCartButton() {
  const cartButton = document.getElementById('cart-button');
  if (!cartButton) return;

  cartButton.addEventListener('click', function(e) {
    if (!isLoggedIn()) {
      e.preventDefault();
      sessionStorage.setItem('login_redirect', 'cart.html');
      window.location.href = 'login.html';
      return;
    }
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
   Add Product Form - Now saves to vendor data
--------------------------------------------------------- */
function initAddProductForm() {
  const form = document.getElementById('add-product-form');
  if (!form) return;

  // Load vendor info
  function loadVendorInfo() {
    const vendorName = getCurrentVendorName();
    const data = getVendorData();
    
    if (data[vendorName]) {
      const vendor = data[vendorName];
      const vendorNameEl = document.getElementById('vendor-name');
      const avatarDisplay = document.getElementById('avatar-display');
      if (vendorNameEl) vendorNameEl.textContent = vendor.name || vendorName;
      if (avatarDisplay) {
        const initials = (vendor.name || vendorName).split(' ').map(p => p[0]).join('');
        avatarDisplay.textContent = initials;
      }
    }
  }
  loadVendorInfo();

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

  const description = document.getElementById('product-description');
  const charCount = document.getElementById('char-count');

  if (description && charCount) {
    description.addEventListener('input', function() {
      const count = this.value.length;
      charCount.textContent = count;
      charCount.classList.toggle('limit-reached', count >= 450);
    });
  }

  const publishBtn = form.querySelector('button[type="submit"]');
  const draftBtn = document.getElementById('save-draft-btn');

  function getFormData() {
    return {
      id: `p${Date.now()}`,
      name: document.getElementById('product-name') ? document.getElementById('product-name').value.trim() : '',
      category: document.getElementById('product-category') ? document.getElementById('product-category').value : '',
      price: document.getElementById('product-price') ? parseFloat(document.getElementById('product-price').value) : NaN,
      stock: document.getElementById('product-stock') ? parseInt(document.getElementById('product-stock').value) : NaN,
      description: document.getElementById('product-description') ? document.getElementById('product-description').value.trim() : '',
      image: uploadedImage ? URL.createObjectURL(uploadedImage) : null,
      status: 'published',
      dateAdded: new Date().toISOString()
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
    if (!container) {
      // Create toast container if it doesn't exist
      const newContainer = document.createElement('div');
      newContainer.className = 'toast-container';
      newContainer.id = 'toast-container';
      document.body.appendChild(newContainer);
    }
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
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
    toastContainer.appendChild(toast);

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

    if (isDraft) {
      data.status = 'draft';
    }

    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerHTML = '<span class="spinner"></span> Publishing...';
    }
    if (draftBtn) {
      draftBtn.disabled = true;
      draftBtn.innerHTML = '<span class="spinner"></span> Saving...';
    }

    setTimeout(() => {
      try {
        const vendorName = getCurrentVendorName();
        addProductToVendor(vendorName, data);

        const status = isDraft ? 'saved as draft' : 'published';
        showToast(
          `✅ Product ${status}!`,
          `"${data.name}" has been ${status} and added to your shop.`,
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
      } catch (e) {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
        console.error('Error saving product:', e);
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
   "Browse products" hero button
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
   Search box — Main search
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

  window.__localcartFilterState = state;
  applyFilters(state);
}

/* ---------------------------------------------------------
   Vendor Search — For vendors.html page
--------------------------------------------------------- */
function initVendorSearch() {
  const vendorSearch = document.getElementById('vendor-search');
  if (!vendorSearch) return;

  vendorSearch.addEventListener('input', function() {
    const term = this.value.trim().toLowerCase();
    filterVendors(term);
  });

  vendorSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = vendorSearch.value.trim();
      if (term) recordSearch(term);
    }
  });
}

function filterVendors(searchTerm) {
  const vendorCards = document.querySelectorAll('.vendor-card');
  const noResults = document.getElementById('no-vendors');
  let visibleCount = 0;

  vendorCards.forEach((card) => {
    const name = (card.dataset.vendorName || '').toLowerCase();
    const category = (card.dataset.vendorCategory || '').toLowerCase();
    const description = (card.dataset.vendorDescription || '').toLowerCase();
    const searchable = `${name} ${category} ${description}`;
    const matches = !searchTerm || searchable.includes(searchTerm);
    
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  if (noResults) {
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

/* ---------------------------------------------------------
   Category filter
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
      if (!category) return;
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
   Cart
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
  badge.hidden = totalQty === 0;
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
   Vendor dashboard - Now shows real products from localStorage
   =========================================================== */

function initVendorDashboard() {
  // Check if we're on the vendor dashboard page
  const mainEl = document.querySelector('.vendor-main');
  if (!mainEl) return;

  // Initialize vendor data if it doesn't exist
  const vendorName = getCurrentVendorName();
  let data = getVendorData();
  
  // If no vendor data exists, create default
  if (!data[vendorName]) {
    data[vendorName] = {
      name: vendorName,
      products: []
    };
    saveVendorData(data);
  }

  // Update vendor stats
  updateVendorStats(vendorName);
  
  // Load and display vendor products
  renderVendorProducts(vendorName);
  
  // Set up vendor switch if it exists
  const select = document.getElementById('vendor-switch');
  if (select) {
    select.addEventListener('change', () => {
      const newVendor = select.value;
      setCurrentVendorName(newVendor);
      updateVendorStats(newVendor);
      renderVendorProducts(newVendor);
    });
  }
}

function updateVendorStats(vendorName) {
  const data = getVendorData();
  const vendor = data[vendorName];
  
  if (!vendor) return;
  
  const products = vendor.products || [];
  const publishedProducts = products.filter(p => p.status !== 'draft');
  
  // Update stats
  const productCountEl = document.getElementById('stat-products') || 
                         document.querySelector('.vendor-stat-card:nth-child(1) .vendor-stat-value');
  const salesEl = document.getElementById('stat-sales');
  const ordersEl = document.getElementById('stat-orders');
  
  if (productCountEl && !productCountEl.closest('.vendor-stat-card')?.querySelector('.vendor-stat-label')?.textContent.includes('Sales')) {
    // This is the products stat
    const card = productCountEl.closest('.vendor-stat-card');
    if (card) {
      const label = card.querySelector('.vendor-stat-label');
      if (label) label.textContent = 'Products';
      productCountEl.textContent = publishedProducts.length;
    }
  }
  
  // Update other stats if they exist
  if (salesEl) {
    // Calculate total sales from products (simulated)
    const totalSales = publishedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    salesEl.textContent = `R${totalSales.toFixed(0)}`;
  }
  
  if (ordersEl) {
    ordersEl.textContent = publishedProducts.length * 2; // Simulated orders
  }
  
  // Update welcome message with vendor name
  const welcomeEl = document.getElementById('dash-welcome');
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome back, ${vendor.name || vendorName}`;
  }
  
  // Update vendor name in header
  const vendorNameEl = document.getElementById('dash-vendor-name');
  if (vendorNameEl) {
    vendorNameEl.textContent = vendor.name || vendorName;
  }
  
  // Update avatar
  const avatarEl = document.getElementById('dash-avatar');
  if (avatarEl) {
    const initials = (vendor.name || vendorName).split(' ').map(p => p[0]).join('');
    avatarEl.textContent = initials;
  }
}

function renderVendorProducts(vendorName) {
  const data = getVendorData();
  const vendor = data[vendorName];
  
  if (!vendor) return;
  
  const products = vendor.products || [];
  const publishedProducts = products.filter(p => p.status !== 'draft');
  
  // Find or create products table
  let productsSection = document.getElementById('vendor-products-section');
  
  if (!productsSection) {
    // Create products section if it doesn't exist
    const mainEl = document.querySelector('.vendor-main');
    if (!mainEl) return;
    
    productsSection = document.createElement('div');
    productsSection.id = 'vendor-products-section';
    productsSection.style.marginTop = '32px';
    productsSection.innerHTML = `
      <h2 class="section-title">Your Products (${publishedProducts.length})</h2>
      <div class="orders-card" id="products-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="products-tbody"></tbody>
        </table>
      </div>
    `;
    mainEl.appendChild(productsSection);
  }
  
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  
  // Update section title
  const title = productsSection.querySelector('.section-title');
  if (title) {
    title.textContent = `Your Products (${publishedProducts.length})`;
  }
  
  if (publishedProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-faint);">
          <p style="font-size: 16px; margin-bottom: 8px;">No products yet</p>
          <p style="font-size: 13px;">Click "Add product" to list your first item.</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = publishedProducts.map(product => `
    <tr>
      <td><strong>${product.name}</strong></td>
      <td>${product.category || 'Uncategorized'}</td>
      <td class="num amount">R${(product.price || 0).toFixed(2)}</td>
      <td>${product.stock || 0}</td>
      <td><span class="status-pill ${product.status === 'published' ? 'status-delivered' : 'status-packing'}">${product.status || 'Published'}</span></td>
    </tr>
  `).join('');
}

/* ---------------------------------------------------------
   Contact form
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

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field) return;
    field.addEventListener('input', () => setError(key, false));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (successBox) successBox.classList.remove('visible');

    if (!validate()) return;

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
   Account history
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
   Product view tracking
--------------------------------------------------------- */
function initProductViewTracking() {
  document.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.dataset.name) recordViewed(card.dataset.name, card.dataset.vendor || '');
    });
  });
}

/* ---------------------------------------------------------
   Vendor follow buttons
--------------------------------------------------------- */
const FOLLOW_ICON_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';

function initVendorFollowButtons() {
  document.querySelectorAll('.product-vendor').forEach((el) => {
    if (el.querySelector('.follow-toggle')) return;
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
      e.stopPropagation();
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
   Avatar account panel
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
    const user = getCurrentUser();
    const header = panel.querySelector('.avatar-panel-header');
    if (header && user) {
      header.textContent = user.name || 'User';
    }

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

/* ---------------------------------------------------------
   Product detail modal
--------------------------------------------------------- */
function buildStarRating(rating) {
  const rounded = Math.round(rating * 2) / 2;
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

/* ---------------------------------------------------------
   Dashboard navigation buttons
--------------------------------------------------------- */
function initDashboardButtons() {
  const overviewBtn = document.getElementById('overview-btn');
  if (overviewBtn) {
    overviewBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'rankoverview.html';
    });
  }

  const monitorBtn = document.getElementById('monitor-btn');
  if (monitorBtn) {
    monitorBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'deliverytracker.html';
    });
  }
}

// Initial filter
setTimeout(() => {
  applyFilters(window.__localcartFilterState || { searchTerm: '', activeCategory: null });
}, 100);

// Cart page functionality
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

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalEl) {
      totalEl.textContent = `R${total.toFixed(2)}`;
    }

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
        const cartCount = document.getElementById("cart-count");
        if (cartCount) {
          const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
          cartCount.textContent = totalQty;
          cartCount.hidden = totalQty === 0;
        }
      });
    });

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

  renderCart();
});