document.addEventListener('DOMContentLoaded', async () => {
  const storedOrder = readCompletedOrder();
  const requestedOrder = new URLSearchParams(location.search).get('order');
  const orderNumber = storedOrder?.orderNumber;
  clearPlaceholders();
  if (!storedOrder || (requestedOrder && requestedOrder !== storedOrder.orderNumber)) {
    return showError('Order tracking is available after a completed transaction.');
  }

  try {
    const response = await apiFetch(`/orders/track/${encodeURIComponent(orderNumber)}`);
    const tracking = response.data;
    document.querySelector('.order-id').textContent = `#${tracking.orderNumber}`;
    document.querySelector('.track-date').textContent = tracking.status || '';
    renderItems(tracking.items || []);
    renderTimeline(tracking.timeline || []);
  } catch (error) {
    showError(error.message || 'Could not load tracking information.');
  }

  function renderItems(items) {
    const list = document.querySelector('.items-list');
    if (!list) return;
    list.replaceChildren();
    items.forEach(item => {
      const row = document.createElement('li');
      row.innerHTML = `<span class="item-name">${item.name}</span><span class="item-vendor">${item.vendor}</span><span>Qty: ${item.quantity}</span>`;
      list.appendChild(row);
    });
  }

  function renderTimeline(timeline) {
    const progressIndex = timeline.reduce((last, event, index) => event.status === 'done' || event.status === 'active' ? index : last, -1);
    document.querySelector('.timeline')?.style.setProperty('--progress', `${Math.max(0, progressIndex) / Math.max(1, timeline.length - 1) * 100}%`);
    document.querySelectorAll('.timeline-item').forEach((element, index) => {
      const event = timeline[index];
      if (!event) return;
      element.classList.remove('done', 'active', 'pending');
      element.classList.add(event.status || 'pending');
      const label = element.querySelector('.status-label');
      const time = element.querySelector('.status-time');
      if (label) label.textContent = event.label || '';
      if (time) time.textContent = event.time || '';
    });
  }

  function showError(message) {
    const error = document.createElement('p');
    error.className = 'empty-state';
    error.textContent = message;
    document.querySelector('main')?.prepend(error);
  }

  function readCompletedOrder() {
    try { return JSON.parse(localStorage.getItem('completedOrder') || 'null'); } catch { return null; }
  }

  function clearPlaceholders() {
    document.querySelector('.order-id').textContent = '';
    document.querySelector('.track-date').textContent = '';
    document.querySelector('.items-list')?.replaceChildren();
    document.querySelectorAll('.timeline-item').forEach(item => {
      item.classList.remove('done', 'active', 'pending');
      item.querySelector('.status-label')?.replaceChildren();
      item.querySelector('.status-time')?.replaceChildren();
    });
  }
});
