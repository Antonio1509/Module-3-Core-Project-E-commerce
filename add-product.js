document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('add-product-form');
  const category = document.getElementById('product-category');
  const imageInput = document.getElementById('product-image');
  const uploadArea = document.getElementById('image-upload-area');
  const preview = document.getElementById('image-preview');
  const previewImage = document.getElementById('preview-img');
  const removeImage = document.getElementById('remove-image');
  const description = document.getElementById('product-description');
  const charCount = document.getElementById('char-count');
  const fallbackCategories = ['Food', 'Beverages', 'Handmade', 'Wellness', 'Jewelry', 'Home Decor', 'Clothing', 'Other'];
  const productGrid = document.getElementById('vendor-product-grid');
  const productCount = document.getElementById('vendor-product-count');

  const loadVendorProducts = async () => {
    if (!productGrid) return;
    try {
      const userResponse = await getCurrentUser();
      const user = userResponse?.user || userResponse;
      if (!user?.vendor_id) throw new Error('No vendor profile is linked to this account.');
      const response = await apiFetch(`/vendors/${encodeURIComponent(user.vendor_id)}/products`);
      const products = Array.isArray(response.products) ? response.products : (response.data || []);
      productCount.textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;
      productGrid.innerHTML = products.map(product => {
        const image = assetUrl(product.image_url || product.image || product.imageUrl || product.image_path || product.photo_url);
        return `<article class="product-card">
          <div class="product-photo">${image ? `<img src="${image}" alt="${product.name || 'Product'}" onerror="this.closest('.product-photo').classList.add('image-missing'); this.removeAttribute('src');">` : '<div class="image-missing">No image</div>'}</div>
          <div class="product-info">
            <span class="category-pill">${product.category || ''}</span>
            <div class="product-name">${product.name || ''}</div>
            <div class="product-price">${money(product.price)}</div>
            <div class="product-stock">${product.stock ?? 0} in stock</div>
          </div>
        </article>`;
      }).join('') || '<p class="empty-state">No products published yet.</p>';
    } catch (error) {
      productGrid.innerHTML = `<p class="empty-state">${error.message || 'Could not load your products.'}</p>`;
    }
  };

  await loadVendorProducts();

  const renderCategories = categories => {
    category.innerHTML = '<option value="">Select category...</option>' + categories
      .filter(value => value && value !== 'All')
      .map(value => `<option value="${String(value).replace(/"/g, '&quot;')}">${value}</option>`)
      .join('');
  };

  try {
    const response = await apiFetch('/categories');
    const categories = Array.isArray(response) ? response : (response.categories || response.data || []);
    renderCategories(categories.length ? categories : fallbackCategories);
  } catch {
    renderCategories(fallbackCategories);
  }

  const showImagePreview = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a PNG, JPG, or WEBP image.');
      imageInput.value = '';
      return;
    }
    previewImage.src = URL.createObjectURL(file);
    preview.hidden = false;
    uploadArea.classList.add('has-image');
  };

  imageInput?.addEventListener('change', () => showImagePreview(imageInput.files[0]));
  uploadArea?.addEventListener('click', event => {
    if (event.target !== imageInput && !event.target.closest('.remove-image')) imageInput?.click();
  });
  removeImage?.addEventListener('click', event => {
    event.stopPropagation();
    imageInput.value = '';
    previewImage.removeAttribute('src');
    preview.hidden = true;
    uploadArea.classList.remove('has-image');
  });

  description?.addEventListener('input', () => {
    charCount.textContent = String(description.value.length);
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!getAuthToken()) {
      window.location.href = 'login.html';
      return;
    }

    const formData = new FormData(form);
    try {
      await apiFetch('/products', { method: 'POST', body: formData });
      alert('Product published successfully.');
      window.location.href = 'vendor-dashboard.html';
    } catch (error) {
      alert(error.message || 'Could not publish product.');
    }
  });
});
