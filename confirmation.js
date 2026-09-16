document.addEventListener('DOMContentLoaded', async () => {
  const orderNumber = new URLSearchParams(location.search).get('order') || localStorage.getItem('pendingOrderNumber');
  clearPlaceholders();
  if (!orderNumber) return showError('No order was supplied.');

  try {
    const response = await apiFetch(`/orders/number/${encodeURIComponent(orderNumber)}`);
    const order = response.data;
    localStorage.setItem('completedOrder', JSON.stringify(order));
    localStorage.removeItem('pendingOrderNumber');
    document.getElementById('orderNumber').textContent = order.orderNumber;
    document.getElementById('totalPaid').textContent = money(order.total);
    document.getElementById('itemCount').textContent = `${order.itemCount} from ${order.vendorCount} vendors`;
    document.getElementById('deliveryEstimate').textContent = order.estimatedDelivery || '';
    const trackButton = document.getElementById('track-order-button');
    if (trackButton) {
      trackButton.href = `track-order.html?order=${encodeURIComponent(order.orderNumber)}`;
      trackButton.hidden = false;
    }

    const list = document.querySelector('.order-items .items-list');
    list.replaceChildren();
    order.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'order-item';
      row.innerHTML = `<div class="item-info"><span class="item-name">${item.name}</span><span class="item-vendor">${item.vendor}</span></div><span>Qty: ${item.quantity}</span>`;
      list.appendChild(row);
    });
  } catch (error) {
    showError(error.message || 'Could not load the order.');
  }

  function showError(message) {
    const target = document.querySelector('.order-items') || document.body;
    const error = document.createElement('p');
    error.className = 'empty-state';
    error.textContent = message;
    target.prepend(error);
  }

  function clearPlaceholders() {
    ['orderNumber', 'totalPaid', 'itemCount', 'deliveryEstimate'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = '';
    });
    document.querySelector('.order-items .items-list')?.replaceChildren();
  }
});
