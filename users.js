/* =========================================================
   LocalCart — users.js
   Drives users.html: the profile view/edit toggle, saving
   edits to localStorage, and the "Vendors you follow" grid
   (sourced from data.js's per-user follow state).
   ========================================================= */

function starIconSmall() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L6 21l1.6-7L2.2 9.3l7.1-.7L12 2z"/></svg>`;
}

function renderProfileView(user) {
  document.getElementById("view-name").textContent = user.name;
  document.getElementById("view-email").textContent = user.email;
  document.getElementById("view-location").textContent = user.location;
  document.getElementById("view-joined").textContent = user.joined;
  document.getElementById("view-bio").textContent = user.bio;

  document.getElementById("edit-name").value = user.name;
  document.getElementById("edit-email").value = user.email;
  document.getElementById("edit-location").value = user.location;
  document.getElementById("edit-bio").value = user.bio;

  document.getElementById("profile-avatar-lg").textContent = user.avatarInitials;
}

function followedVendorCard(vendor) {
  const el = document.createElement("div");
  el.className = "vendor-card";
  el.innerHTML = `
    <button class="unfollow-btn" data-unfollow="${vendor.id}">Unfollow</button>
    <a href="vendor.html?id=${vendor.id}" style="display:contents;">
      <div class="vendor-cover" style="background-image:url('${vendor.cover}')">
        <span class="vendor-badge">${vendor.category}</span>
      </div>
      <div class="vendor-body">
        <div class="vendor-logo">${vendor.logoText}</div>
        <h3>${vendor.name}</h3>
        <div class="vendor-category">${vendor.location}</div>
        <p class="vendor-desc">${vendor.description}</p>
        <div class="vendor-meta">
          <span class="vendor-rating">${starIconSmall()} ${vendor.rating.toFixed(1)}</span>
          <span>Since ${vendor.joined}</span>
        </div>
      </div>
    </a>
  `;
  return el;
}

function renderFollowingGrid() {
  const grid = document.getElementById("following-grid");
  const countEl = document.getElementById("following-count");
  const vendors = getUserFollowingVendors(CURRENT_USER_ID);

  countEl.textContent = `${vendors.length} vendor${vendors.length === 1 ? "" : "s"}`;
  grid.innerHTML = "";

  if (vendors.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>You're not following any vendors yet</h3>
        <p>Visit a vendor's storefront and hit Follow to see them here.</p>
      </div>`;
    return;
  }

  vendors.forEach(v => grid.appendChild(followedVendorCard(v)));

  // Unfollow buttons — stop the click from also triggering the card's link
  grid.querySelectorAll("[data-unfollow]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const vendorId = btn.dataset.unfollow;
      const vendor = getVendorById(vendorId);
      toggleFollowVendor(CURRENT_USER_ID, vendorId);
      showToast(`Unfollowed ${vendor.name}`);
      renderFollowingGrid();
    });
  });
}

function initProfileToggle(user) {
  const card = document.getElementById("profile-card");
  const toggleBtn = document.getElementById("toggle-edit-btn");
  const saveBtn = document.getElementById("save-profile-btn");

  card.classList.add("profile-view");

  toggleBtn.addEventListener("click", () => {
    const enteringEdit = !card.classList.contains("profile-editing");
    card.classList.toggle("profile-editing", enteringEdit);
    card.classList.toggle("profile-view", !enteringEdit);
    toggleBtn.textContent = enteringEdit ? "Cancel" : "Edit profile";

    if (!enteringEdit) {
      // Cancelled — reset the form fields back to the last saved values
      renderProfileView(getCurrentUser());
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
      showToast("Name and email can't be empty");
      return;
    }

    saveCurrentUserProfile(updates);
    renderProfileView(getCurrentUser());

    card.classList.remove("profile-editing");
    card.classList.add("profile-view");
    toggleBtn.textContent = "Edit profile";

    showToast("Profile updated");
  });
}

const currentUser = getCurrentUser();
renderProfileView(currentUser);
initProfileToggle(currentUser);
renderFollowingGrid();