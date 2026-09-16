document.addEventListener('DOMContentLoaded', async () => {
  if (!getAuthToken()) {
    window.location.href = 'login.html';
    return;
  }

  const welcome = document.getElementById('vendor-welcome');
  const statsBox = document.getElementById('vendor-stats');
  const ordersBody = document.getElementById('vendor-orders');
  const addProductButton = document.getElementById('add-product-btn');
  const overviewButton = document.getElementById('overview-btn');

  addProductButton?.addEventListener('click', () => {
    window.location.href = 'add-product.html';
  });
  overviewButton?.addEventListener('click', () => {
    window.location.href = 'deliverytracker.html';
  });

  try {
    const currentUser = await getCurrentUser();
    const user = currentUser?.user || currentUser;
    if (user?.name && welcome) welcome.textContent = `Welcome back, ${user.name}`;
    if (user?.vendor_id) {
      const vendorResponse = await apiFetch(`/vendors/${encodeURIComponent(user.vendor_id)}`);
      const vendor = vendorResponse.vendor || vendorResponse;
      document.querySelectorAll('.vendor-name').forEach(element => {
        element.textContent = vendor?.name || user.name || 'Vendor';
      });
    }
  } catch (error) {
    console.error('Could not load vendor profile:', error);
  }

  try {
    const [summaryResponse, ordersResponse] = await Promise.all([
      apiFetch('/analytics/vendor/summary'),
      apiFetch('/analytics/vendor/orders')
    ]);
    const summary = summaryResponse.data || summaryResponse;
    const orders = Array.isArray(ordersResponse)
      ? ordersResponse
      : (ordersResponse.data || ordersResponse.orders || []);

    statsBox.innerHTML = `
      <div class="vendor-stat-card">
        <div class="vendor-stat-label">Sales this month</div>
        <div class="vendor-stat-value accent">${money(summary.revenue || summary.sales || summary.total_sales || 0)}</div>
      </div>
      <div class="vendor-stat-card">
        <div class="vendor-stat-label">Orders</div>
        <div class="vendor-stat-value">${summary.orders || summary.order_count || 0}</div>
      </div>
      <div class="vendor-stat-card">
        <div class="vendor-stat-label">Rating</div>
        <div class="vendor-stat-value">${Number(summary.rating || 0).toFixed(1)}<span class="stat-suffix">/ 5</span></div>
      </div>`;

    ordersBody.innerHTML = orders.slice(0, 10).map(order => `
      <tr>
        <td class="order-id">#${order.order_number || order.orderNumber || order.id || ''}</td>
        <td>${order.items || order.item || ''}</td>
        <td><span class="status-pill status-${String(order.status || 'pending').toLowerCase().replace(/\s+/g, '-')}">${order.status || 'Pending'}</span></td>
        <td class="num amount">${money(order.total_amount || order.total || order.amount)}</td>
      </tr>`).join('') || '<tr><td colspan="4">No orders yet.</td></tr>';
  } catch (error) {
    console.error('Could not load vendor dashboard data:', error);
    statsBox.innerHTML = '<p>Could not load dashboard data.</p>';
    ordersBody.innerHTML = '<tr><td colspan="4">Could not load orders.</td></tr>';
  }
});
