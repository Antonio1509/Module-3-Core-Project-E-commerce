document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.cart-items');
  if (!container) return;

  try {
    const response = await apiFetch('/cart');
    renderCart(response.data || {});
  } catch (error) {
    container.innerHTML = `<p class="empty-cart">${error.message || 'Could not load your cart.'}</p>`;
  }

  async function refresh() {
    const response = await apiFetch('/cart');
    renderCart(response.data || {});
  }

  function renderCart(cart) {
    const items = cart.items || [];
    container.replaceChildren();
    if (!items.length) {
      container.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="index.html">Start shopping</a></p>';
      const completedOrder = readCompletedOrder();
      if (completedOrder?.orderNumber) {
        const trackButton = document.createElement('a');
        trackButton.className = 'btn-track';
        trackButton.href = `track-order.html?order=${encodeURIComponent(completedOrder.orderNumber)}`;
        trackButton.textContent = 'Track your order';
        container.appendChild(trackButton);
      }
    } else {
      items.forEach(item => {
        const row = document.createElement('div');
        const productId = item.product_id || item.id;
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        row.className = 'cart-item';
        row.dataset.id = productId;
        row.innerHTML = `<div class="item-details"><h3 class="item-name">${item.name || item.product_name || ''}</h3><p class="item-vendor">${item.vendor_name || item.vendor || ''}</p><p class="item-price">R${price.toFixed(2)}</p></div><div class="item-actions"><div class="quantity-control"><button class="qty-btn minus" data-product-id="${productId}" type="button">-</button><span class="qty-value">${quantity}</span><button class="qty-btn plus" data-product-id="${productId}" type="button">+</button></div><button class="remove-item" data-product-id="${productId}" type="button">Remove</button></div>`;
        container.appendChild(row);
      });
    }

    const totals = cart.totals || cart;
    const subtotal = Number(totals.subtotal || 0);
    const delivery = Number(totals.delivery_fee || totals.delivery || 0);
    const total = Number(totals.total || subtotal + delivery);
    document.querySelector('.item-count').textContent = `(${Number(totals.total_items || items.reduce((sum, item) => sum + Number(item.quantity || 0), 0))} items)`;
    document.querySelector('.subtotal').textContent = `R${subtotal.toFixed(2)}`;
    document.querySelector('.delivery').textContent = `R${delivery.toFixed(2)}`;
    document.querySelector('.total-amount').textContent = `R${total.toFixed(2)}`;
  }

  function readCompletedOrder() {
    try { return JSON.parse(localStorage.getItem('completedOrder') || 'null'); } catch { return null; }
  }

  container.addEventListener('click', async event => {
    const button = event.target.closest('button[data-product-id]');
    if (!button) return;
    const productId = Number(button.dataset.productId);
    try {
      if (button.classList.contains('remove-item')) {
        await apiFetch(`/cart/remove/${productId}`, { method: 'DELETE' });
      } else {
        const row = button.closest('.cart-item');
        const current = Number(row.querySelector('.qty-value').textContent);
        const quantity = button.classList.contains('plus') ? current + 1 : Math.max(0, current - 1);
        await apiFetch('/cart/update', { method: 'PUT', body: JSON.stringify({ product_id: productId, quantity }) });
      }
      await refresh();
    } catch (error) {
      alert(error.message || 'Could not update your cart.');
    }
  });
});
