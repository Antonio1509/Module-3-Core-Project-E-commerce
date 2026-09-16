document.addEventListener("DOMContentLoaded", async () => {
  if (!getAuthToken()) {
    window.location.href = "login.html";
    return;
  }

  const welcome = document.getElementById("vendor-welcome");
  const statsBox = document.getElementById("vendor-stats");
  const ordersBody = document.getElementById("vendor-orders");
  const addProductButton = document.getElementById("add-product-btn");
  const overviewButton = document.getElementById("overview-btn");
  const profileForm = document.getElementById("vendor-profile-form");
  const editProfileButton = document.getElementById("edit-vendor-profile-btn");
  const cancelProfileButton = document.getElementById(
    "cancel-vendor-profile-btn",
  );
  const profileActions = profileForm?.querySelector(".vendor-profile-actions");
  let vendorId = null;
  let vendorProfile = null;

  addProductButton?.addEventListener("click", () => {
    window.location.href = "add-product.html";
  });
  overviewButton?.addEventListener("click", () => {
    window.location.href = "deliverytracker.html";
  });

  try {
    const currentUser = await getCurrentUser();
    const user = currentUser?.user || currentUser;
    if (user?.name && welcome)
      welcome.textContent = `Welcome back, ${user.name}`;
    if (user?.vendor_id) {
      vendorId = user.vendor_id;
      const vendorResponse = await apiFetch(
        `/vendors/${encodeURIComponent(vendorId)}`,
      );
      const vendor = vendorResponse.vendor || vendorResponse;
      vendorProfile = vendor;
      document.querySelectorAll(".vendor-name").forEach((element) => {
        element.textContent = vendor?.name || user.name || "Vendor";
      });
      populateVendorProfile(vendor);
      setProfileEditing(false);
      await loadVendorFollowers(vendorId);
    }
  } catch (error) {
    console.error("Could not load vendor profile:", error);
  }

  editProfileButton?.addEventListener("click", () => {
    setProfileEditing(true);
    if (profileActions) profileActions.hidden = false;
    editProfileButton.hidden = true;
  });

  cancelProfileButton?.addEventListener("click", () => {
    populateVendorProfile(vendorProfile);
    setProfileEditing(false);
    if (profileActions) profileActions.hidden = true;
    editProfileButton.hidden = false;
  });

  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!vendorId) return;

    const payload = Object.fromEntries(new FormData(profileForm));
    try {
      const response = await apiFetch(
        `/vendors/${encodeURIComponent(vendorId)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
      vendorProfile = { ...vendorProfile, ...payload };
      populateVendorProfile(vendorProfile);
      setProfileEditing(false);
      if (profileActions) profileActions.hidden = true;
      editProfileButton.hidden = false;
      document.querySelectorAll(".vendor-name").forEach((element) => {
        element.textContent = vendorProfile.name;
      });
      if (typeof showToast === "function")
        showToast(response.message || "Vendor profile updated");
    } catch (error) {
      if (typeof showToast === "function")
        showToast(error.message || "Could not update vendor profile");
      else console.error("Could not update vendor profile:", error);
    }
  });

  function setProfileEditing(isEditing) {
    const form = document.getElementById("vendor-profile-form");
    form?.classList.toggle("editing", isEditing);
    form?.querySelectorAll("input, textarea").forEach((field) => {
      field.disabled = !isEditing;
    });
  }
  try {
    const [summaryResponse, ordersResponse] = await Promise.all([
      apiFetch("/analytics/vendor/summary"),
      apiFetch("/analytics/vendor/orders"),
    ]);
    const summary = summaryResponse.data || summaryResponse;
    const orders = Array.isArray(ordersResponse)
      ? ordersResponse
      : ordersResponse.data || ordersResponse.orders || [];

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

    ordersBody.innerHTML =
      orders
        .slice(0, 10)
        .map(
          (order) => `
      <tr>
        <td class="order-id">#${order.order_number || order.orderNumber || order.id || ""}</td>
        <td>${order.items || order.item || ""}</td>
        <td><span class="status-pill status-${String(order.status || "pending")
          .toLowerCase()
          .replace(/\s+/g, "-")}">${order.status || "Pending"}</span></td>
        <td class="num amount">${money(order.total_amount || order.total || order.amount)}</td>
      </tr>`,
        )
        .join("") || '<tr><td colspan="4">No orders yet.</td></tr>';
  } catch (error) {
    console.error("Could not load vendor dashboard data:", error);
    statsBox.innerHTML = "<p>Could not load dashboard data.</p>";
    ordersBody.innerHTML =
      '<tr><td colspan="4">Could not load orders.</td></tr>';
  }
});

function populateVendorProfile(vendor) {
  if (!vendor) return;
  const values = {
    "vendor-profile-name": vendor.name || "",
    "vendor-profile-category": vendor.category || "",
    "vendor-profile-location": vendor.location || "",
    "vendor-profile-response": vendor.response_time || "",
    "vendor-profile-delivery": vendor.delivery_area || "",
    "vendor-profile-shipping": vendor.shipping_info || "",
    "vendor-profile-about": vendor.about || vendor.description || "",
  };
  Object.entries(values).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });
}

async function loadVendorFollowers(vendorId) {
  const list = document.getElementById("vendor-followers-list");
  const count = document.getElementById("vendor-follower-count");
  if (!list || !count) return;

  try {
    const response = await apiFetch(
      `/vendors/${encodeURIComponent(vendorId)}/followers`,
    );
    const followers = response.followers || response.data || [];
    count.textContent = followers.length;
    list.innerHTML = followers.length
      ? followers
          .map(
            (follower) => `
          <div class="vendor-follower-row">
            <span class="vendor-follower-avatar">${follower.avatar_initials || initialsFor(follower.name)}</span>
            <span><strong>${follower.name || "Customer"}</strong><small>${follower.email || ""}</small></span>
          </div>`,
          )
          .join("")
      : '<p class="vendor-profile-empty">No customers follow your store yet.</p>';
  } catch (error) {
    count.textContent = "0";
    list.innerHTML = `<p class="vendor-profile-empty">${error.message || "Could not load followers."}</p>`;
  }
}

function initialsFor(name) {
  return String(name || "Customer")
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
