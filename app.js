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