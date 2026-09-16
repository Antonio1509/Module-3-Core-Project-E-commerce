document.addEventListener('DOMContentLoaded', async () => {
  const options = document.querySelector('.delivery-options');
  const summary = document.querySelector('.summary-body');
  if (!options || !summary) return;

  try {
    const [cartResponse, methodsResponse] = await Promise.all([
      apiFetch('/cart'),
      apiFetch('/delivery/methods')
    ]);
    const cart = cartResponse.data || {};
    const methods = (Array.isArray(methodsResponse) ? methodsResponse : methodsResponse.data || [])
      .filter(method => Number(method.price) > 0 && !String(method.name || '').toLowerCase().includes('free'));
    options.replaceChildren();
    methods.forEach(method => options.appendChild(createMethod(method)));
    options.addEventListener('click', async event => {
      const card = event.target.closest('.delivery-card');
      if (!card) return;
      event.preventDefault();
      try {
        await selectMethod(card.dataset.method);
        const method = methods.find(item => item.code === card.dataset.method);
        const methodName = String(method?.name || '').toLowerCase();
        if (methodName.includes('rank') || card.dataset.method.toLowerCase().includes('rank')) {
          window.location.href = 'rankdelivery.html';
          return;
        }
        if (window.Swal) {
          await Swal.fire({
            title: `You chose ${method?.name || 'delivery'}`,
            text: 'Proceed to checkout to enter your delivery address.',
            icon: 'success',
            confirmButtonText: 'Continue to checkout'
          });
        }
        window.location.href = 'checkout.html';
      } catch (error) {
        alert(error.message || 'Could not select this delivery method.');
      }
    });
    if (methods[0]) await selectMethod(methods[0].code);
    renderCartItems(cart.items || []);
  } catch (error) {
    options.innerHTML = `<p class="empty-state">${error.message || 'Could not load delivery methods.'}</p>`;
  }

  function createMethod(method) {
    const card = document.createElement('article');
    card.className = 'delivery-card';
    card.dataset.method = method.code;
    card.innerHTML = `<div class="card-heading"><div class="icon-box">&#9678;</div><div><h2>${method.name}</h2><p>${method.tagline || ''}</p></div><span class="radio"></span>${method.is_popular ? '<span class="popular">Most Popular</span>' : ''}</div><p class="description">${method.description || ''}</p><ul class="features">${(method.features || []).map(feature => `<li>${feature}</li>`).join('')}</ul><div class="price-row"><strong class="price">${money(method.price)}</strong><span class="price-note">${method.price_note || ''}</span><span class="time">${method.time_estimate || ''}</span></div>`;
    return card;
  }

  async function selectMethod(code) {
    options.querySelectorAll('.delivery-card').forEach(card => card.classList.toggle('selected', card.dataset.method === code));
    const cartResponse = await apiFetch('/cart');
    const cart = cartResponse.data || {};
    const preview = await apiFetch('/delivery/preview', {
      method: 'POST',
      body: JSON.stringify({ items: cart.items || [], methodCode: code })
    });
    const items = cart.items || [];
    summary.innerHTML = items.map(item => `<div class="item"><div>${item.name}<small>Qty: ${item.quantity}</small></div><span>${money(Number(item.price) * Number(item.quantity))}</span></div>`).join('') + `<div class="summary-line"><span>Subtotal</span><strong>${money(preview.subtotal)}</strong></div><div class="summary-line"><span>Delivery</span><strong>${money(preview.delivery)}</strong></div><div class="summary-line total"><span>Total</span><strong>${money(preview.total)}</strong></div>`;
    localStorage.setItem('deliveryMethod', code);
  }

  function renderCartItems(items) {
    if (!items.length) summary.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
  }
});
