/* =========================================================
   LocalCart — users.js
   Loads the signed-in user's profile from the backend API.
   The follow/following list is intentionally left empty because
   the backend does not currently expose a follow feature.
   ========================================================= */

function starIconSmall() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L6 21l1.6-7L2.2 9.3l7.1-.7L12 2z"/></svg>`;
}

function renderProfileView(user) {
  if (!user) return;

  document.getElementById("view-name").textContent = user.name || 'User';
  document.getElementById("view-email").textContent = user.email || '';
  document.getElementById("view-location").textContent = user.location || 'South Africa';
  document.getElementById("view-joined").textContent = user.joined || 'Recently joined';
  document.getElementById("view-bio").textContent = user.bio || 'No bio yet.';

  document.getElementById("edit-name").value = user.name || '';
  document.getElementById("edit-email").value = user.email || '';
  document.getElementById("edit-location").value = user.location || '';
  document.getElementById("edit-bio").value = user.bio || '';

  document.getElementById("profile-avatar-lg").textContent = (user.name || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
}

async function renderFollowingGrid() {
  const grid = document.getElementById("following-grid");
  const countEl = document.getElementById("following-count");

  if (!grid || !countEl) return;

  const response = await apiFetch('/users/following');
  const vendors = response.data || [];
  countEl.textContent = `${vendors.length} vendor${vendors.length === 1 ? '' : 's'}`;
  grid.innerHTML = vendors.length ? vendors.map(vendor => {
    const initials = vendor.logo_text || (vendor.name || 'LC').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
    const cover = vendor.cover_image || '';
    const rating = Number(vendor.rating || 0).toFixed(1);
    const reviews = Number(vendor.review_count || 0);
    return `<a class="vendor-card" href="vendor.html?id=${encodeURIComponent(vendor.id)}">
      <div class="vendor-cover"${cover ? ` style="background-image:url('${cover}')"` : ''}>
        <span class="vendor-badge">${vendor.category || 'Local vendor'}</span>
      </div>
      <div class="vendor-body">
        <div class="vendor-logo">${initials}</div>
        <h3>${vendor.name || ''}</h3>
        <div class="vendor-category">${vendor.location || 'South Africa'}</div>
        <p class="vendor-desc">${vendor.description || 'Discover products from this local vendor.'}</p>
        <div class="vendor-meta">
          <span class="vendor-rating">${starIconSmall()} ${rating} <span style="color:var(--text-faint);font-weight:400">(${reviews})</span></span>
          <span>Since ${vendor.joined || 'Recently'}</span>
        </div>
      </div>
    </a>`;
  }).join('') : '<div class="empty-state"><h3>You are not following any vendors yet</h3><p>Follow vendors to see them here.</p></div>';
}

function initProfileToggle(user) {
  const card = document.getElementById("profile-card");
  const toggleBtn = document.getElementById("toggle-edit-btn");
  const saveBtn = document.getElementById("save-profile-btn");

  if (!card || !toggleBtn || !saveBtn) return;

  card.classList.add("profile-view");

  toggleBtn.addEventListener("click", () => {
    const enteringEdit = !card.classList.contains("profile-editing");
    card.classList.toggle("profile-editing", enteringEdit);
    card.classList.toggle("profile-view", !enteringEdit);
    toggleBtn.textContent = enteringEdit ? "Cancel" : "Edit profile";

    if (!enteringEdit) {
      renderProfileView(user);
    }
  });

  saveBtn.addEventListener("click", () => {
    const updates = {
      name: document.getElementById("edit-name").value.trim(),
      email: document.getElementById("edit-email").value.trim(),
      location: document.getElementById("edit-location").value.trim(),
      bio: document.getElementById("edit-bio").value.trim()
    };

    if (!updates.name || !updates.email) {
      if (typeof showToast === 'function') showToast("Name and email can't be empty");
      return;
    }

    Object.assign(user, updates);
    renderProfileView(user);

    card.classList.remove("profile-editing");
    card.classList.add("profile-view");
    toggleBtn.textContent = "Edit profile";

    if (typeof showToast === 'function') showToast("Profile updated");
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  renderProfileView(user);
  initProfileToggle(user);
  try { await renderFollowingGrid(); } catch (error) { console.error(error); }
});