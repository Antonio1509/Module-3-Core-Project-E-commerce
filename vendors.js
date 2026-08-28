/* =========================================================
   LocalCart — vendors.js
   Renders category chips + vendor cards on vendors.html,
   filtered by category and live search.
   ========================================================= */

let activeCategory = "All";
let searchTerm = "";

function renderChips() {
  const bar = document.getElementById("filter-bar");
  const countEl = document.getElementById("result-count");

  bar.querySelectorAll(".chip").forEach(el => el.remove());

  VENDOR_CATEGORIES.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = "chip" + (cat === activeCategory ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeCategory = cat;
      renderChips();
      renderVendors();
    });
    bar.insertBefore(chip, countEl);
  });
}

function starIcon() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L6 21l1.6-7L2.2 9.3l7.1-.7L12 2z"/></svg>`;
}

function vendorCard(vendor) {
  const el = document.createElement("a");
  el.href = `vendor.html?id=${vendor.id}`;
  el.className = "vendor-card";
  el.innerHTML = `
    <div class="vendor-cover" style="background-image:url('${vendor.cover}')">
      <span class="vendor-badge">${vendor.category}</span>
    </div>
    <div class="vendor-body">
      <div class="vendor-logo">${vendor.logoText}</div>
      <h3>${vendor.name}</h3>
      <div class="vendor-category">${vendor.location}</div>
      <p class="vendor-desc">${vendor.description}</p>
      <div class="vendor-meta">
        <span class="vendor-rating">${starIcon()} ${vendor.rating.toFixed(1)} <span style="color:var(--text-faint);font-weight:400">(${vendor.reviewCount})</span></span>
        <span>Since ${vendor.joined}</span>
      </div>
    </div>
  `;
  return el;
}

function renderVendors() {
  const grid = document.getElementById("vendor-grid");
  const countEl = document.getElementById("result-count");
  const results = getVendors({ category: activeCategory, search: searchTerm });

  grid.innerHTML = "";
  countEl.textContent = `${results.length} vendor${results.length === 1 ? "" : "s"}`;

  if (results.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No vendors match your search</h3>
        <p>Try a different category or search term.</p>
      </div>`;
    return;
  }

  results.forEach(v => grid.appendChild(vendorCard(v)));
}

document.getElementById("vendor-search").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderVendors();
});

renderChips();
renderVendors();