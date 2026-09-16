/* =========================================================
   LocalCart — vendor.js
   Loads a single vendor storefront from the backend API.
   ========================================================= */

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function normalizeVendorId(value) {
  const normalized = String(value || '').trim();
  return normalized.replace(/^v(?=\d+$)/i, '');
}

function pinIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
}
function starIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color:var(--star)"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L6 21l1.6-7L2.2 9.3l7.1-.7L12 2z"/></svg>`;
}
function boxIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8l-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>`;
}

function formatPrice(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function renderProductCard(product) {
  const outOfStock = Number(product.stock || 0) === 0;
  const lowStock = Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 3;

  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.productId = product.id || product.product_id || '';
  card.dataset.productName = product.name || '';
  card.dataset.productDescription = product.description || '';
  card.innerHTML = `
    <div class="product-thumb" style="background-image:url('${assetUrl(product.image_url || product.image || product.imageUrl || product.image_path || product.photo_url) || 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=60'}')">
      ${outOfStock ? '<span class="stock-badge low">Out of stock</span>' : ""}
      ${lowStock ? `<span class="stock-badge low">Only ${product.stock} left</span>` : ""}
    </div>
    <div class="product-body">
      <h4>${product.name}</h4>
      <div class="product-price">${formatPrice(product.price)} <span class="unit">/ ${product.unit || 'each'}</span></div>
      <button class="add-to-cart" ${outOfStock ? "disabled style='opacity:.5;cursor:not-allowed'" : ""}>
        ${outOfStock ? "Unavailable" : "Add to cart"}
      </button>
    </div>
  `;

  const btn = card.querySelector(".add-to-cart");
  if (!outOfStock && btn) {
    btn.addEventListener("click", () => addToCart(product, btn));
  }
  return card;
}

async function renderVendor() {
  const id = normalizeVendorId(getQueryParam("id"));
  if (!id) {
    document.getElementById("vendor-not-found").style.display = "block";
    return;
  }

  try {
    const [vendorRes, productsRes] = await Promise.all([
      apiFetch(`/vendors/${id}`),
      apiFetch(`/vendors/${id}/products`)
    ]);

    const vendor = vendorRes.vendor;
    if (!vendor) {
      document.getElementById("vendor-not-found").style.display = "block";
      return;
    }

    const products = Array.isArray(productsRes.products) ? productsRes.products : [];

    document.getElementById("vendor-content").style.display = "block";
    document.title = `${vendor.name} — LocalCart`;

    const banner = vendor.cover_image || vendor.cover || 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=60';
    const logoText = vendor.logo_text || (vendor.name || 'LC').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

    document.getElementById("store-banner").style.backgroundImage = `url('${banner}')`;
    document.getElementById("store-logo").textContent = logoText;
    document.getElementById("store-category").textContent = vendor.category || 'Local vendor';
    document.getElementById("store-name").textContent = vendor.name;

    let rating = Number(vendor.rating || 0);
    let reviewCount = Number(vendor.review_count || 0);
    let followingCount = Number(vendor.following_count ?? vendor.following ?? 0);
    const vendorFollowerValue = vendor.follower_count ?? vendor.followers_count ?? vendor.followers;
    const storedFollowerCount = localStorage.getItem(`localcart-vendor-followers-${id}`);
    let followerCount = vendorFollowerValue == null
      ? Number(storedFollowerCount || 0)
      : Number(vendorFollowerValue);

    const renderStats = () => {
      document.getElementById("store-stats").innerHTML = `
        <span>${pinIcon()} ${vendor.location || 'South Africa'}</span>
        <span>${starIcon()} ${rating.toFixed(1)} (${reviewCount} reviews)</span>
        <span>${boxIcon()} ${products.length} products</span>
        <button class="stat-link" type="button"><strong>${followingCount}</strong> Following</button>
        <button class="stat-link" type="button"><strong>${followerCount}</strong> Followers</button>
      `;
    };

    const refreshRatingFromProducts = async () => {
      const reviewResponses = await Promise.all(
        products.map(product => apiFetch(`/products/${encodeURIComponent(product.id || product.product_id)}/reviews`))
      );
      const reviews = reviewResponses.flatMap(response => {
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.reviews)) return response.reviews;
        return [];
      });
      if (!reviews.length) return false;
      reviewCount = reviews.length;
      rating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount;
      renderStats();
      return true;
    };

    try { await refreshRatingFromProducts(); }
    catch (error) { console.error('Could not load vendor reviews:', error); }
    renderStats();

    window.addEventListener('localcart:review-saved', event => {
      const productId = Number(event.detail?.productId);
      if (products.some(product => Number(product.id || product.product_id) === productId)) {
        refreshRatingFromProducts().then(refreshed => {
          if (refreshed) return;
          const submittedRating = Number(event.detail?.rating || 0);
          if (!submittedRating) return;
          const previousTotal = rating * reviewCount;
          reviewCount += 1;
          rating = (previousTotal + submittedRating) / reviewCount;
          renderStats();
        }).catch(error => {
          console.error('Could not refresh vendor rating:', error);
          const submittedRating = Number(event.detail?.rating || 0);
          if (!submittedRating) return;
          const previousTotal = rating * reviewCount;
          reviewCount += 1;
          rating = (previousTotal + submittedRating) / reviewCount;
          renderStats();
        });
      }
    });

    document.getElementById("about-text").textContent = vendor.about || vendor.description || 'This vendor has not added a storefront bio yet.';
    document.getElementById("info-location").textContent = vendor.location || 'South Africa';
    document.getElementById("info-response").textContent = vendor.response_time || 'Usually replies within a day';
    document.getElementById("info-delivery").textContent = vendor.delivery_area || 'Nationwide';
    document.getElementById("info-shipping").textContent = vendor.shipping_info || 'Standard shipping';
    document.getElementById("info-joined").textContent = vendor.joined || 'Recently';

    const grid = document.getElementById("product-grid");
    document.getElementById("product-count").textContent =
      `${products.length} product${products.length === 1 ? "" : "s"}`;

    grid.innerHTML = "";
    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No products yet</h3><p>${vendor.name} hasn't listed anything for sale.</p></div>`;
    } else {
      products.forEach(p => grid.appendChild(renderProductCard(p)));
    }

    const followBtn = document.getElementById("follow-btn");
    if (followBtn) {
      const user = await getCurrentUser();
      let following = false;
      if (user) {
        const followingResponse = await apiFetch('/users/following');
        const followedVendors = followingResponse.data || [];
        following = followedVendors.some(item => Number(item.id) === Number(id));
      }
      followBtn.textContent = following ? 'Following' : '+ Follow';
      followBtn.classList.toggle('active', following);
      followBtn.addEventListener('click', async () => {
        if (!getAuthToken()) {
          window.location.href = 'login.html';
          return;
        }
        try {
          const method = following ? 'DELETE' : 'POST';
          await apiFetch(`/users/following/${encodeURIComponent(id)}`, { method });
          following = !following;
          followerCount = Math.max(0, followerCount + (following ? 1 : -1));
          localStorage.setItem(`localcart-vendor-followers-${id}`, String(followerCount));
          renderStats();
          followBtn.textContent = following ? 'Following' : '+ Follow';
          followBtn.classList.toggle('active', following);
        } catch (error) {
          alert(error.message || 'Could not update followed vendors.');
        }
      });
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const panel = document.getElementById(`panel-${btn.dataset.tab}`);
        if (panel) panel.classList.add("active");
      });
    });

    const shopProductsBtn = document.getElementById("shop-products-btn");
    const tabProductsBtn = document.getElementById("tab-products");
    const productsPanel = document.getElementById("panel-products");

    if (shopProductsBtn && tabProductsBtn && productsPanel) {
      shopProductsBtn.addEventListener("click", () => {
        tabProductsBtn.click();
        productsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

  } catch (error) {
    document.getElementById("vendor-not-found").style.display = "block";
    console.error('Vendor page load error:', error);
  }
}

document.addEventListener('DOMContentLoaded', renderVendor);