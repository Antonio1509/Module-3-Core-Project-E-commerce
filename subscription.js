document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("plans-grid");

  if (grid) {
    grid.replaceChildren();
    try {
      const [plansResponse, activeResponse] = await Promise.all([
        apiFetch("/subscriptions/plans"),
        getAuthToken() ? apiFetch("/subscriptions/me") : Promise.resolve(null),
      ]);
      const plans = Array.isArray(plansResponse)
        ? plansResponse
        : plansResponse.plans || plansResponse.data || [];
      const activeSubscription = activeResponse?.data || activeResponse;
      renderSubscriptionStatus(activeSubscription);
      if (plans.length) {
        grid.innerHTML = plans
          .map(
            (plan) => `
          <div class="plan-card ${plan.is_popular ? "featured" : ""}">
            ${plan.is_popular ? '<div class="popular-badge">Most popular</div>' : ""}
            <div class="plan-name">${plan.name}</div>
            <div class="plan-tagline">${plan.tagline || plan.description || ""}</div>
            <div class="plan-price"><span class="amount">${money(plan.price)}</span><span class="period">/${plan.billing_period === "yearly" ? "year" : "month"}</span></div>
            <div class="section-label">Features</div>
            <ul class="feature-list">${(plan.features || []).map((feature) => `<li>${feature}</li>`).join("")}</ul>
            <button type="button" class="choose-btn" data-plan="${plan.slug || plan.name}" data-price="${plan.price}" data-period="${plan.billing_period || "monthly"}">${activeSubscription?.slug === plan.slug ? "Current plan" : activeSubscription ? "Change to " : "Choose "}${activeSubscription?.slug === plan.slug ? "" : plan.name}</button>
          </div>`,
          )
          .join("");
      }
    } catch (error) {
      grid.innerHTML = `<p class="empty-state">${error.message || "Could not load subscription plans."}</p>`;
    }
  }

  document.querySelectorAll(".choose-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.textContent.trim() === "Current plan") return;
      if (!getAuthToken()) {
        window.location.href = "login.html";
        return;
      }
      const params = new URLSearchParams({
        subscription: "true",
        plan:
          button.dataset.plan ||
          button
            .closest(".plan-card")
            ?.querySelector(".plan-name")
            ?.textContent.trim() ||
          "Subscription",
        price: String(
          button.dataset.price ||
            button.closest(".plan-card")?.querySelector(".amount")
              ?.textContent ||
            "0",
        ).replace(/[^0-9.]/g, ""),
        period: button.dataset.period || "monthly",
      });
      window.location.href = `checkout.html?${params.toString()}`;
    });
  });
});

function renderSubscriptionStatus(subscription) {
  const header = document.querySelector(".page-header");
  if (!header) return;
  const existing = document.getElementById("active-subscription-status");
  existing?.remove();
  if (!subscription || subscription.status !== "active") return;

  const status = document.createElement("div");
  status.id = "active-subscription-status";
  status.className = "active-subscription-status";
  status.innerHTML = `<strong>Current plan: ${subscription.name}</strong><span>R${Number(subscription.price || 0).toFixed(2)} / month</span><button type="button" id="cancel-subscription-btn">Cancel plan</button>`;
  header.appendChild(status);
  status
    .querySelector("#cancel-subscription-btn")
    .addEventListener("click", async () => {
      if (!window.confirm("Cancel your active subscription?")) return;
      try {
        await apiFetch("/subscriptions/cancel", { method: "POST" });
        status.remove();
        document.querySelectorAll(".choose-btn").forEach((button) => {
          button.textContent = `Choose ${button.dataset.plan}`;
        });
        if (typeof showToast === "function")
          showToast("Subscription cancelled");
      } catch (error) {
        if (typeof showToast === "function")
          showToast(error.message || "Could not cancel subscription");
      }
    });
}
