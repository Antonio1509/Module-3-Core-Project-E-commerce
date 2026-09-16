document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('plans-grid');

  if (grid) {
    try {
      const response = await apiFetch('/subscriptions/plans');
      const plans = Array.isArray(response) ? response : (response.plans || response.data || []);
      if (plans.length) {
        grid.innerHTML = plans.map(plan => `
          <div class="plan-card ${plan.is_popular ? 'featured' : ''}">
            ${plan.is_popular ? '<div class="popular-badge">Most popular</div>' : ''}
            <div class="plan-name">${plan.name}</div>
            <div class="plan-tagline">${plan.tagline || plan.description || ''}</div>
            <div class="plan-price"><span class="amount">${money(plan.price)}</span><span class="period">/${plan.billing_period === 'yearly' ? 'year' : 'month'}</span></div>
            <div class="section-label">Features</div>
            <ul class="feature-list">${(plan.features || []).map(feature => `<li>${feature}</li>`).join('')}</ul>
            <button type="button" class="choose-btn" data-plan="${plan.slug || plan.name}" data-price="${plan.price}" data-period="${plan.billing_period || 'monthly'}">Choose ${plan.name}</button>
          </div>`).join('');
      }
    } catch (error) {
      console.error('Could not load subscription plans:', error);
    }
  }

  document.querySelectorAll('.choose-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
      }
      const params = new URLSearchParams({
        subscription: 'true',
        plan: button.dataset.plan || button.closest('.plan-card')?.querySelector('.plan-name')?.textContent.trim() || 'Subscription',
        price: String(button.dataset.price || button.closest('.plan-card')?.querySelector('.amount')?.textContent || '0').replace(/[^0-9.]/g, ''),
        period: button.dataset.period || 'monthly'
      });
      window.location.href = `checkout.html?${params.toString()}`;
    });
  });
});
