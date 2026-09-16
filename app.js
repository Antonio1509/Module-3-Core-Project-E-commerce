/* =========================================================
   LocalCart — app.js
   Shared behaviour used across every page: theme toggle and
   a simple in-memory cart counter with a toast confirmation.
   In production, cart state should live in cart.js and persist
   via the back end once a customer is authenticated.
   ========================================================= */

(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle") || document.getElementById("navbar-theme-toggle");
  const saved = localStorage.getItem("localcart-theme") || localStorage.getItem("theme") || "light";
  const vendorPage = Boolean(document.querySelector('.logo-tag'));
  const subscriptionCheckout = new URLSearchParams(window.location.search).get('subscription') === 'true';
  root.setAttribute("data-theme", saved);
  if (!vendorPage) {
    document.querySelectorAll('a[href="subscription.html"]').forEach(link => { link.hidden = true; });
  }

  if (vendorPage || subscriptionCheckout) {
    document.querySelectorAll('.site-footer').forEach(footer => footer.classList.add('vendor-footer'));
    document.querySelectorAll('body > header nav').forEach(nav => {
      nav.innerHTML = `
        <a href="vendor-dashboard.html">Dashboard</a>
        <a href="add-product.html">Products</a>
        <a href="deliverytracker.html">Orders</a>
        <a href="subscription.html">Subscribe</a>`;
    });

    if (!document.querySelector('.site-footer')) {
      if (!document.getElementById('vendor-shell-styles')) {
        const styles = document.createElement('style');
        styles.id = 'vendor-shell-styles';
        styles.textContent = `.vendor-footer{width:100%;margin-top:auto;padding:32px 24px 24px;border-top:1px solid var(--border,#e5e2dc);text-align:center;background:var(--bg,#fff);color:var(--text,#202124)}.vendor-footer .footer-logo{font-weight:700}.vendor-footer .footer-description{max-width:420px;margin:12px auto;color:var(--text-muted,#737373);font-size:13px}.vendor-footer .footer-links{display:flex;justify-content:center;gap:18px;flex-wrap:wrap}.vendor-footer .footer-links a{color:inherit;font-size:13px;text-decoration:none}.vendor-footer .footer-links a:hover{color:var(--accent,#f0811f)}.vendor-footer .footer-copy{margin:24px 0 0;color:var(--text-faint,#8a8a8a);font-size:12px}`;
        document.head.appendChild(styles);
      }
      const footer = document.createElement('footer');
      footer.className = 'site-footer vendor-footer';
      footer.innerHTML = `
        <div class="footer-logo">LocalCart <span class="logo-tag">for Vendors</span></div>
        <p class="footer-description">Manage your LocalCart storefront, products, orders, and subscriptions in one place.</p>
        <nav class="footer-links">
          <a href="vendor-dashboard.html">Dashboard</a>
          <a href="add-product.html">Products</a>
          <a href="deliverytracker.html">Orders</a>
          <a href="subscription.html">Subscribe</a>
        </nav>
        <p class="footer-copy">© 2026 LocalCart. Vendor workspace.</p>`;
      document.body.appendChild(footer);
    }
  }

  if (toggle) {
    toggle.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("localcart-theme", next);
    }, true);
  }
})();

/* ---------- Toast ---------- */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- Minimal cart counter (placeholder for cart.js) ---------- */
function addToCart(product, btnEl) {
  const cartKey = "localcart-cart";
  const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
  cart.push({ id: product.id, name: product.name, price: product.price, vendorId: product.vendorId });
  localStorage.setItem(cartKey, JSON.stringify(cart));

  if (btnEl) {
    const original = btnEl.textContent;
    btnEl.textContent = "Added ✓";
    btnEl.classList.add("added");
    setTimeout(() => {
      btnEl.textContent = original;
      btnEl.classList.remove("added");
    }, 1200);
  }
  showToast(`${product.name} added to cart`);
}

/* =========================================================
  Profile toggle (header avatar dropdown)
  Present on every page that includes this script and the
  standard header markup: a button#profile-toggle next to a
  hidden panel#profile-dropdown. Populates the panel from the
  current authenticated user returned by the backend API.
   ========================================================= */
(function () {
  const toggle = document.getElementById("profile-toggle");
  const dropdown = document.getElementById("profile-dropdown");
  if (!toggle || !dropdown) return; // page doesn't use the header dropdown

  const links = dropdown.querySelector('.profile-dropdown-links');
  const completedOrder = readCompletedOrder();
  if (links && completedOrder && !links.querySelector('a.track-order-link')) {
    const trackLink = document.createElement('a');
    trackLink.href = `track-order.html?order=${encodeURIComponent(completedOrder.orderNumber)}`;
    trackLink.className = 'track-order-link';
    trackLink.textContent = 'Track order';
    links.insertBefore(trackLink, links.querySelector('.divider'));
  }

  function readCompletedOrder() {
    try { return JSON.parse(localStorage.getItem('completedOrder') || 'null'); } catch { return null; }
  }

  // Fill in the current user's details if the API-backed user loader is available
  if (typeof getCurrentUser === "function") {
    getCurrentUser().then((user) => {
      if (!user) return;
      const isVendor = Boolean(user.vendor_id || user.is_vendor === true || user.is_vendor === 1 || user.role === "vendor" || user.user_type === "vendor");
      if (!vendorPage) {
        document.querySelectorAll('a[href="subscription.html"]').forEach(link => { link.hidden = !isVendor; });
      }
      const nameEl = dropdown.querySelector("[data-profile-name]");
      const emailEl = dropdown.querySelector("[data-profile-email]");
      const avatarEl = toggle.querySelector(".avatar");
      if (nameEl) nameEl.textContent = user.name || "";
      if (emailEl) emailEl.textContent = user.email || "";
      if (avatarEl) avatarEl.textContent = user.avatar_initials || "";
    });
  }

  function openDropdown() {
    dropdown.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }
  function closeDropdown() {
    dropdown.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.contains("open") ? closeDropdown() : openDropdown();
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) closeDropdown();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });
})();

/* =========================================================
   Logout
   Wires up any ".logout-link" button in the header dropdown.
   Clears locally-stored session data and sends the person to
   the existing login page. Update LOGIN_PAGE_URL below if your
   login page lives at a different path/filename.
   ========================================================= */
(function () {
  const LOGIN_PAGE_URL = "login.html";

  document.querySelectorAll(".logout-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Clear anything tied to the logged-in session. Follow state,
      // profile edits, and cart contents are left alone on purpose —
      // remove those too here if logout should also reset local data.
      localStorage.removeItem("localcart-token");
      localStorage.removeItem("localcart-user");

      window.location.href = LOGIN_PAGE_URL;
    });
  });
})();