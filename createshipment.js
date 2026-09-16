document.addEventListener("DOMContentLoaded", async () => {
  if (!getAuthToken()) {
    window.location.href = "login.html";
    return;
  }

  document.querySelector(".back")?.addEventListener("click", () => {
    window.location.href = "deliverytracker.html";
  });

  const list = document.getElementById("orders");
  const search = document.getElementById("search");
  let orders = [];

  try {
    const response = await apiFetch("/shipments/unshipped");
    orders = Array.isArray(response)
      ? response
      : response.data || response.orders || [];
  } catch (error) {
    list.innerHTML = `<div class="empty">${error.message || "Could not load unshipped orders."}</div>`;
    return;
  }

  const render = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = orders.filter((order) =>
      `${order.number} ${order.customer} ${order.email} ${order.method} ${order.destination}`
        .toLowerCase()
        .includes(query),
    );
    list.innerHTML =
      filtered
        .map(
          (order) => `
      <article class="order">
        <div class="order-header">
          <button class="order-number" type="button">#${order.number || order.order_number || ""}</button>
          <div class="customer">${order.customer || order.customer_name || "Customer"}<small>${order.email || ""}</small></div>
          <div class="delivery-cell"><span class="delivery-tag">${order.method || "Delivery"}</span><button class="ship-button" data-ship="${order.orderId || order.id}">Ship Order</button></div>
          <span class="order-date">${order.date || order.created_at || ""}<small>${order.destination || ""}</small></span>
          <strong class="order-total">${order.total || money(order.total_amount || order.amount)}</strong>
        </div>
        <div class="items"><p class="items-title">Ordered items</p>${(order.items || []).map((item) => `<div class="item"><span><strong>${item[0] || item.name || ""}</strong> x ${item[1] || item.quantity || 1}</span><span>${item[2] || money(item.price)}</span></div>`).join("")}</div>
        <div class="shipment-options">
          <button class="shipment-option" data-option="rankdrop" data-order="${order.orderId || order.id}"><h3>RankDrop order collection</h3><p>Send the parcel to a pickup location.</p></button>
          <button class="shipment-option" data-option="self_delivery" data-order="${order.orderId || order.id}"><h3>Vendor self-delivery</h3><p>Deliver the parcel yourself.</p></button>
        </div>
      </article>`,
        )
        .join("") ||
      '<div class="empty">No unshipped customer orders match your search.</div>';
  };

  list.addEventListener("click", async (event) => {
    const shipButton = event.target.closest("[data-ship]");
    if (shipButton) {
      shipButton.closest(".order").classList.toggle("ship-options");
      return;
    }

    const option = event.target.closest("[data-option]");
    if (!option) return;
    try {
      await apiFetch("/shipments", {
        method: "POST",
        body: JSON.stringify({
          orderId: Number(option.dataset.order),
          method: option.dataset.option,
          pickupPoint: null,
        }),
      });
      alert("Shipment created successfully.");
      orders = orders.filter(
        (order) =>
          Number(order.orderId || order.id) !== Number(option.dataset.order),
      );
      render();
    } catch (error) {
      alert(error.message || "Could not create shipment.");
    }
  });

  search.addEventListener("input", render);
  render();
});
