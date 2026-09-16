/* =========================================================
   LocalCart — vendors.js
   Loads vendor directory data from the backend API rather than
   the old hardcoded mock data file.
   ========================================================= */

const VENDOR_CATEGORIES = ["All", "Bakery", "Crafts", "Skincare", "Clothing", "Home & Decor", "Food Truck"];
let activeCategory = "All";
let searchTerm = "";

function renderChips() {
  const bar = document.getElementById("filter-bar");
  const countEl = document.getElementById("result-count");

  if (!bar || !countEl) return;
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
  const cover = vendor.cover_image || vendor.cover || 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=60';
  const logoText = vendor.logo_text || (vendor.name || 'LC').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const rating = Number(vendor.rating || 0);
  const reviewCount = Number(vendor.review_count || 0);
  const joined = vendor.joined || 'Recently';
  const description = vendor.description || 'Local vendor listing';
  const location = vendor.location || 'South Africa';

  const el = document.createElement("a");
  el.href = `vendor.html?id=${encodeURIComponent(vendor.id)}`;
  el.className = "vendor-card";
  el.innerHTML = `
    <div class="vendor-cover" style="background-image:url('${cover}')">
      <span class="vendor-badge">${vendor.category || 'Local'}</span>
    </div>
    <div class="vendor-body">
      <div class="vendor-logo">${logoText}</div>
      <h3>${vendor.name}</h3>
      <div class="vendor-category">${location}</div>
      <p class="vendor-desc">${description}</p>
      <div class="vendor-meta">
        <span class="vendor-rating">${starIcon()} ${rating.toFixed(1)} <span style="color:var(--text-faint);font-weight:400">(${reviewCount})</span></span>
        <span>Since ${joined}</span>
      </div>
    </div>
  `;
  return el;
}

async function renderVendors() {
  const grid = document.getElementById("vendor-grid");
  const countEl = document.getElementById("result-count");
  const search = searchTerm.trim();

  if (!grid || !countEl) return;

  try {
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (search) params.set('search', search);

    const res = await apiFetch(`/vendors?${params.toString()}`);
    const results = Array.isArray(res.vendors) ? res.vendors : [];

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
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>Could not load vendors</h3>
        <p>${error.message || 'The backend is unavailable.'}</p>
      </div>`;
    countEl.textContent = '0 vendors';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const vendorSearch = document.getElementById("vendor-search");
  if (vendorSearch) {
    vendorSearch.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderVendors();
    });
  }

  renderChips();
  renderVendors();
});