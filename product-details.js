document.addEventListener('DOMContentLoaded', () => {
  const modal = document.createElement('div');
  modal.className = 'product-details-modal';
  modal.hidden = true;
  modal.innerHTML = `<div class="product-details-backdrop"></div><section class="product-details-panel" role="dialog" aria-modal="true"><button class="product-details-close" type="button" aria-label="Close">×</button><h2 class="details-name"></h2><p class="details-description"></p><div class="details-reviews"></div><form class="review-form"><h3>Leave a review</h3><label>Rating <select name="rating" required><option value="">Choose</option><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select></label><label>Review <textarea name="comment" required></textarea></label><button type="submit" class="btn-primary">Submit review</button><p class="review-message" role="status"></p></form></section>`;
  document.body.appendChild(modal);

  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
  modal.querySelector('.product-details-close').addEventListener('click', close);
  modal.querySelector('.product-details-backdrop').addEventListener('click', close);

  document.addEventListener('click', async event => {
    const card = event.target.closest('.product-card[data-product-id]');
    if (!card || event.target.closest('button')) return;
    const id = card.dataset.productId;
    const name = card.dataset.productName || card.querySelector('.product-name, h4')?.textContent || '';
    const description = card.dataset.productDescription || 'No description available.';
    modal.querySelector('.details-name').textContent = name;
    modal.querySelector('.details-description').textContent = description;
    modal.querySelector('.review-message').textContent = '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const target = modal.querySelector('.details-reviews');
    const renderReviews = reviews => {
      target.replaceChildren();
      if (!reviews.length) { target.textContent = 'No reviews yet.'; return; }
      reviews.forEach(review => {
        const row = document.createElement('article');
        row.className = 'product-review';
        row.innerHTML = `<strong>${review.user_name || 'Customer'}</strong><span>${'★'.repeat(Number(review.rating))}</span><p></p>`;
        row.querySelector('p').textContent = review.comment;
        target.appendChild(row);
      });
    };
    const loadReviews = async () => {
      const response = await apiFetch(`/products/${encodeURIComponent(id)}/reviews`);
      renderReviews(response.data || []);
    };

    modal.querySelector('.review-form').onsubmit = async submitEvent => {
      submitEvent.preventDefault();
      if (!getAuthToken()) { window.location.href = 'login.html'; return; }
      const form = submitEvent.currentTarget;
      try {
        await apiFetch(`/products/${encodeURIComponent(id)}/reviews`, { method: 'POST', body: JSON.stringify({ rating: form.rating.value, comment: form.comment.value }) });
        await loadReviews();
        window.dispatchEvent(new CustomEvent('localcart:review-saved', {
          detail: { productId: Number(id), rating: Number(form.rating.value) }
        }));
        modal.querySelector('.review-message').textContent = 'Review saved.';
        form.reset();
      } catch (error) { modal.querySelector('.review-message').textContent = error.message || 'Could not save review.'; }
    };

    try { await loadReviews(); }
    catch (error) { target.textContent = error.message || 'Could not load reviews.'; }
  });
});
