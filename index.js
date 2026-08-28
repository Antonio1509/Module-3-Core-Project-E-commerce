/* ==========================================================
   LOCALCART - COMPLETE FUNCTIONALITY
   Includes: index.html, about.html, vendor-dashboard.html
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // Load data from localStorage
  loadVendorData();

  // Initialize all features
  initThemeToggle();
  initBrowseButton();
  initNavigation();
  initSearch();
  initCategoryFilter();
  initCart();
  initVendorDashboard();
  initAboutPage();
  initVendorSwitcher();

});

// ==========================================================
// VENDOR DATA STORE
// ==========================================================

const VENDOR_STORE_KEY = 'localcart_vendor_data';
const CURRENT_VENDOR_KEY = 'localcart_current_vendor';

// Default vendor data
const defaultVendors = {
  'Maya\'s Kitchen': {
    id: 'vendor_001',
    name: 'Maya\'s Kitchen',
    sales: 4280,
    orders: 38,
    rating: 4.8,
    products: [
      { id: 'p1', name: 'Honey oat cookies', price: 85, stock: 24 },
      { id: 'p2', name: 'Ginger snap box', price: 95, stock: 12 },
      { id: 'p3', name: 'Chocolate chip cookies', price: 90, stock: 18 },
      { id: 'p4', name: 'Almond biscotti', price: 110, stock: 8 }
    ],
    recentOrders: [
      { id: '#LC-10482', item: 'Honey oat cookies x2', status: 'Packing', amount: 170.00 },
      { id: '#LC-10475', item: 'Ginger snap box', status: 'Delivered', amount: 95.00 },
      { id: '#LC-10461', item: 'Honey oat cookies x1', status: 'Delivered', amount: 85.00 }
    ]
  },
  'The Spice Route': {
    id: 'vendor_002',
    name: 'The Spice Route',
    sales: 3120,
    orders: 27,
    rating: 4.6,
    products: [
      { id: 'p5', name: 'Masala chai blend', price: 120, stock: 15 },
      { id: 'p6', name: 'Turmeric powder', price: 80, stock: 30 },
      { id: 'p7', name: 'Cinnamon sticks', price: 65, stock: 22 }
    ],
    recentOrders: [
      { id: '#LC-10490', item: 'Masala chai blend x1', status: 'Packing', amount: 120.00 },
      { id: '#LC-10485', item: 'Turmeric powder x2', status: 'Delivered', amount: 160.00 }
    ]
  },
  'Craft & Co': {
    id: 'vendor_003',
    name: 'Craft & Co',
    sales: 2560,
    orders: 19,
    rating: 4.9,
    products: [
      { id: 'p8', name: 'Handmade candles', price: 150, stock: 10 },
      { id: 'p9', name: 'Leather journals', price: 200, stock: 6 },
      { id: 'p10', name: 'Macrame plant hangers', price: 130, stock: 8 }
    ],
    recentOrders: [
      { id: '#LC-10495', item: 'Handmade candles x1', status: 'Packing', amount: 150.00 },
      { id: '#LC-10488', item: 'Leather journals x1', status: 'Delivered', amount: 200.00 }
    ]
  },
  'Fresh Harvest': {
    id: 'vendor_004',
    name: 'Fresh Harvest',
    sales: 1840,
    orders: 14,
    rating: 4.4,
    products: [
      { id: 'p11', name: 'Organic honey', price: 95, stock: 20 },
      { id: 'p12', name: 'Artisanal jam set', price: 120, stock: 12 }
    ],
    recentOrders: [
      { id: '#LC-10498', item: 'Organic honey x2', status: 'Packing', amount: 190.00 },
      { id: '#LC-10492', item: 'Artisanal jam set x1', status: 'Delivered', amount: 120.00 }
    ]
  }
};

let vendorData = {};
let currentVendor = 'Maya\'s Kitchen';

function loadVendorData() {
  try {
    const stored = localStorage.getItem(VENDOR_STORE_KEY);
    if (stored) {
      vendorData = JSON.parse(stored);
    } else {
      vendorData = JSON.parse(JSON.stringify(defaultVendors));
      localStorage.setItem(VENDOR_STORE_KEY, JSON.stringify(vendorData));
    }

    const current = localStorage.getItem(CURRENT_VENDOR_KEY);
    if (current && vendorData[current]) {
      currentVendor = current;
    }
  } catch (e) {
    console.warn('Failed to load vendor data:', e);
    vendorData = JSON.parse(JSON.stringify(defaultVendors));
  }
}

function saveVendorData() {
  try {
    localStorage.setItem(VENDOR_STORE_KEY, JSON.stringify(vendorData));
    localStorage.setItem(CURRENT_VENDOR_KEY, currentVendor);
  } catch (e) {
    console.warn('Failed to save vendor data:', e);
  }
}

function getVendorList() {
  return Object.keys(vendorData);
}

function switchVendor(vendorName) {
  if (vendorData[vendorName]) {
    currentVendor = vendorName;
    saveVendorData();
    window.location.reload();
  }
}

// ==========================================================
// THEME TOGGLE
// ==========================================================

function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) return;

  // Check if user already selected a theme
  const savedTheme = localStorage.getItem("localcart-theme");

  if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
  } else {
    // Otherwise use system preference
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    root.setAttribute("data-theme", prefersLight ? "light" : "dark");
  }

  // Change theme when clicked
  toggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", nextTheme);
    localStorage.setItem("localcart-theme", nextTheme);
  });
}

// ==========================================================
// BROWSE PRODUCTS BUTTON
// ==========================================================

function initBrowseButton() {
  const browseButton = document.getElementById("browse-products");
  const productsSection = document.getElementById("products-grid");

  if (!browseButton || !productsSection) return;

  browseButton.addEventListener("click", () => {
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

// ==========================================================
// NAVIGATION
// ==========================================================

function initNavigation() {
  const navLinks = document.querySelectorAll("header nav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Remove active class from all links
      navLinks.forEach((item) => {
        item.classList.remove("active");
      });

      // Add active class to clicked link
      link.classList.add("active");
    });
  });
}

// ==========================================================
// SEARCH
// ==========================================================

function initSearch() {
  const searchInput = document.getElementById("search-input");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    applyFilters();
  });
}

// ==========================================================
// CATEGORY FILTER
// ==========================================================

function initCategoryFilter() {
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach((card) => {
    // Click
    card.addEventListener("click", () => {
      toggleCategory(card);
    });

    // Keyboard accessibility
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCategory(card);
      }
    });
  });
}

// ==========================================================
// TOGGLE CATEGORY
// ==========================================================

function toggleCategory(card) {
  const category = card.dataset.category;
  const alreadyActive = card.classList.contains("active");

  // Remove active from every category
  document.querySelectorAll(".category-card").forEach((item) => {
    item.classList.remove("active");
  });

  // If it wasn't active, activate it
  if (!alreadyActive) {
    card.classList.add("active");
  }

  // Apply category filter
  applyFilters();

  // Scroll to products
  const productsSection = document.getElementById("products-grid");

  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// ==========================================================
// FILTER PRODUCTS
// ==========================================================

function applyFilters() {
  const searchInput = document.getElementById("search-input");

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // Find active category
  const activeCategoryCard = document.querySelector(".category-card.active");
  const activeCategory = activeCategoryCard ? activeCategoryCard.dataset.category : null;

  // Find products
  const productCards = document.querySelectorAll(".product-card");

  let visibleProducts = 0;

  productCards.forEach((card) => {
    const name = card.dataset.name ? card.dataset.name.toLowerCase() : "";
    const vendor = card.dataset.vendor ? card.dataset.vendor.toLowerCase() : "";
    const category = card.dataset.category ? card.dataset.category : "";

    // Search matching
    const matchesSearch = searchTerm === "" || name.includes(searchTerm) || vendor.includes(searchTerm);

    // Category matching
    const matchesCategory = !activeCategory || category === activeCategory;

    // Final result
    const shouldShow = matchesSearch && matchesCategory;

    card.style.display = shouldShow ? "" : "none";

    if (shouldShow) {
      visibleProducts++;
    }
  });

  // Empty state
  const emptyState = document.getElementById("empty-state");

  if (emptyState) {
    emptyState.hidden = visibleProducts !== 0;
  }
}

// ==========================================================
// SHOPPING CART
// ==========================================================

function initCart() {
  const cartCount = document.getElementById("cart-count");
  const addButtons = document.querySelectorAll(".btn-add-cart");

  // Get existing cart from LocalStorage
  let cart = JSON.parse(localStorage.getItem("localcart-cart")) || [];

  /* --------------------------------------------------------
     Save cart
  -------------------------------------------------------- */
  function saveCart() {
    localStorage.setItem("localcart-cart", JSON.stringify(cart));
  }

  /* --------------------------------------------------------
     Update cart number
  -------------------------------------------------------- */
  function updateCartCount() {
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

    if (cartCount) {
      cartCount.textContent = totalQuantity;
      cartCount.hidden = totalQuantity === 0;
    }
  }

  /* --------------------------------------------------------
     Add product
  -------------------------------------------------------- */
  function addToCart(product) {
    const existingProduct = cart.find(
      (item) => item.name === product.name && item.vendor === product.vendor
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        name: product.name,
        vendor: product.vendor,
        price: product.price,
        quantity: 1
      });
    }

    saveCart();
    updateCartCount();
  }

  /* --------------------------------------------------------
     Add button events
  -------------------------------------------------------- */
  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productCard = button.closest(".product-card");

      if (!productCard) return;

      const product = {
        name: productCard.dataset.name,
        vendor: productCard.dataset.vendor,
        price: Number(productCard.dataset.price)
      };

      addToCart(product);

      // Visual feedback
      const originalText = button.textContent;
      button.textContent = "Added ✓";
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 900);
    });
  });

  // Initial cart count
  updateCartCount();
}

// ==========================================================
// VENDOR DASHBOARD
// ==========================================================

function initVendorDashboard() {
  // Check if we're on vendor-dashboard.html
  const isDashboard = document.querySelector('.orders-card') || document.querySelector('.page-head h1');
  if (!isDashboard) return;

  const vendor = vendorData[currentVendor];
  if (!vendor) return;

  // Update greeting
  const greetEl = document.querySelector('.page-head h1');
  if (greetEl) {
    greetEl.textContent = `Welcome back, ${vendor.name}`;
  }

  // Update stats
  const statValues = document.querySelectorAll('.stat-value');
  if (statValues.length >= 3) {
    statValues[0].textContent = `R${vendor.sales.toLocaleString()}`;
    statValues[1].textContent = vendor.orders;
    statValues[2].textContent = vendor.rating;
  }

  // Update orders table
  const tbody = document.querySelector('.orders-card tbody');
  if (tbody && vendor.recentOrders) {
    tbody.innerHTML = vendor.recentOrders.map(order => `
      <tr>
        <td class="order-id">${order.id}</td>
        <td>${order.item}</td>
        <td><span class="status-pill ${order.status === 'Packing' ? 'status-packing' : 'status-delivered'}">${order.status}</span></td>
        <td class="num amount">R${order.amount.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  // Update avatar
  const avatar = document.querySelector('.avatar');
  if (avatar) {
    const nameParts = vendor.name.split(' ');
    const initials = nameParts.map(p => p[0]).join('');
    avatar.textContent = initials;
  }

  // Update vendor name in header
  const vendorNameEl = document.querySelector('.vendor-name');
  if (vendorNameEl) {
    vendorNameEl.textContent = vendor.name;
  }

  // Add product button
  const addBtn = document.getElementById('add-product-btn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      const name = prompt('Enter product name:');
      if (!name) return;

      const price = parseFloat(prompt('Enter price (R):'));
      if (isNaN(price) || price <= 0) return;

      const stock = parseInt(prompt('Enter stock quantity:'));
      if (isNaN(stock) || stock < 0) return;

      const newProduct = {
        id: `p${Date.now()}`,
        name: name,
        price: price,
        stock: stock
      };

      vendor.products.push(newProduct);
      saveVendorData();

      alert(`✅ Added "${name}" to your products!`);
      window.location.reload();
    });
  }
}

// ==========================================================
// ABOUT PAGE
// ==========================================================

function initAboutPage() {
  // Check if we're on about.html
  const isAbout = document.querySelector('.about-hero');
  if (!isAbout) return;

  // Update stats on about page
  const statValues = document.querySelectorAll('.stats .stat-value');
  if (statValues.length >= 3) {
    const totalVendors = Object.keys(vendorData).length;
    const totalProducts = Object.values(vendorData).reduce((sum, v) => sum + v.products.length, 0);
    const totalOrders = Object.values(vendorData).reduce((sum, v) => sum + v.orders, 0);

    statValues[0].textContent = `${totalVendors}+`;
    statValues[1].textContent = `${totalProducts}+`;
    statValues[2].textContent = `${totalOrders}+`;
  }

  // Add vendor switcher to about page
  const statsContainer = document.querySelector('.stats');
  if (statsContainer) {
    // Check if switcher already exists
    if (!document.querySelector('.about-vendor-switcher')) {
      const switchCard = document.createElement('div');
      switchCard.className = 'stat-card about-vendor-switcher';
      switchCard.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
      `;

      switchCard.innerHTML = `
        <div class="stat-label">Switch Vendor</div>
        <select id="about-vendor-select" style="
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
          cursor: pointer;
          outline: none;
        ">
          ${getVendorList().map(name => `
            <option value="${name}" ${name === currentVendor ? 'selected' : ''}>${name}</option>
          `).join('')}
        </select>
        <button id="about-switch-btn" style="
          background: var(--accent);
          color: var(--accent-ink);
          border: none;
          padding: 6px 16px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        ">Switch</button>
      `;

      statsContainer.appendChild(switchCard);

      document.getElementById('about-switch-btn')?.addEventListener('click', function() {
        const select = document.getElementById('about-vendor-select');
        if (select) {
          switchVendor(select.value);
        }
      });
    }
  }
}

// ==========================================================
// VENDOR SWITCHER (for dashboard header)
// ==========================================================

function initVendorSwitcher() {
  const headerRight = document.querySelector('.header-right');
  if (!headerRight) return;

  // Check if switcher already exists
  if (document.querySelector('.vendor-switcher')) return;

  // Only add switcher if we're on dashboard or about page
  const isDashboard = document.querySelector('.orders-card');
  const isAbout = document.querySelector('.about-hero');
  
  if (!isDashboard && !isAbout) return;

  const switcher = document.createElement('select');
  switcher.className = 'vendor-switcher';
  switcher.style.cssText = `
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    outline: none;
  `;

  const vendors = getVendorList();
  vendors.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    if (name === currentVendor) {
      option.selected = true;
    }
    switcher.appendChild(option);
  });

  switcher.addEventListener('change', function() {
    switchVendor(this.value);
  });

  // Insert before the avatar
  const avatar = headerRight.querySelector('.avatar');
  if (avatar) {
    headerRight.insertBefore(switcher, avatar);
  } else {
    headerRight.appendChild(switcher);
  }
}

// ==========================================================
// INITIAL PRODUCT FILTER
// ==========================================================

// Run filter after page loads
setTimeout(() => {
  applyFilters();
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

  renderCart();
});