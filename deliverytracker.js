document.addEventListener('DOMContentLoaded', async () => {
  if (!getAuthToken()) {
    window.location.href = 'login.html';
    return;
  }

  const rows = document.getElementById('shipmentRows');
  const search = document.getElementById('search');
  const resultCount = document.getElementById('resultCount');
  let shipments = [];
  let activeStatus = 'All';

  const statusClass = status => String(status || '').toLowerCase().replace(/\s+/g, '-');
  const orderText = order => [
    order.id,
    order.order_number,
    order.orderNumber,
    order.customer_name,
    order.customer,
    order.email,
    order.items,
    order.status
  ].filter(Boolean).join(' ').toLowerCase();

  const render = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = shipments.filter(order => {
      const status = String(order.status || '').replace('_', ' ');
      return (activeStatus === 'All' || status.toLowerCase() === activeStatus.toLowerCase()) && orderText(order).includes(query);
    });

    rows.innerHTML = filtered.map(order => `
      <tr>
        <td class="parcel">#${order.order_number || order.orderNumber || order.id || ''}</td>
        <td class="pickup">${order.customer_name || order.customer || order.email || 'Customer'}</td>
        <td>${order.items || order.item || ''}</td>
        <td><span class="status ${statusClass(order.status)}">${order.status || 'Pending'}</span></td>
        <td>${money(order.total_amount || order.total || order.amount)}</td>
        <td>${order.date || order.created_at || ''}</td>
      </tr>`).join('') || '<tr><td class="empty" colspan="6">No customer orders yet.</td></tr>';

    resultCount.textContent = `Showing ${filtered.length} of ${shipments.length} shipments`;
    document.getElementById('pagination').replaceChildren();
  };

  try {
    const response = await apiFetch('/analytics/vendor/orders');
    shipments = Array.isArray(response) ? response : (response.data || response.orders || []);
    render();
  } catch (error) {
    rows.innerHTML = `<tr><td class="empty" colspan="6">${error.message || 'Could not load shipments.'}</td></tr>`;
    resultCount.textContent = '0 orders';
  }

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelector('.tab.active')?.classList.remove('active');
    tab.classList.add('active');
    activeStatus = tab.dataset.status || 'All';
    render();
  }));
  search.addEventListener('input', render);
  document.querySelector('.back')?.addEventListener('click', () => {
    window.location.href = 'vendor-dashboard.html';
  });
  document.getElementById('create')?.addEventListener('click', () => {
    window.location.href = 'createshipment.html';
  });
});
