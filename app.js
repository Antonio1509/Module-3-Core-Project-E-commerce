/* =========================================================
   LocalCart — app.js
   Shared behaviour used across every page: theme toggle and
   a simple in-memory cart counter with a toast confirmation.
   In production, cart state should live in cart.js and persist
   via the back end once a customer is authenticated.
   ========================================================= */

(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("localcart-theme");
  if (saved) root.setAttribute("data-theme", saved);

  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("localcart-theme", next);
    });
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
   current user in data.js, so it only runs once data.js exists.
   ========================================================= */
(function () {
  const toggle = document.getElementById("profile-toggle");
  const dropdown = document.getElementById("profile-dropdown");
  if (!toggle || !dropdown) return; // page doesn't use the header dropdown

  // Fill in the current user's details, if data.js's getCurrentUser() is available
  if (typeof getCurrentUser === "function") {
    const user = getCurrentUser();
    if (user) {
      const nameEl = dropdown.querySelector("[data-profile-name]");
      const emailEl = dropdown.querySelector("[data-profile-email]");
      const avatarEl = toggle.querySelector(".avatar");
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) avatarEl.textContent = user.avatarInitials;
    }
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