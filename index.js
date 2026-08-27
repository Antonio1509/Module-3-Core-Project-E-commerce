/* ==========================================================
   LocalCart
   Front-end functionality

   Includes:
   - Dark / light mode
   - Product search
   - Category filtering
   - Browse products button
   - Shopping cart
   - Cart count
   - Add to cart
   - LocalStorage cart persistence
   - Navigation active state
========================================================== */


document.addEventListener("DOMContentLoaded", () => {

  initThemeToggle();

  initBrowseButton();

  initNavigation();

  initSearch();

  initCategoryFilter();

  initCart();

});


/* ==========================================================
   THEME TOGGLE
========================================================== */

function initThemeToggle() {

  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) return;


  // Check if user already selected a theme
  const savedTheme = localStorage.getItem("localcart-theme");

  if (savedTheme) {

    root.setAttribute("data-theme", savedTheme);

  } else {

    // Otherwise use system preference
    const prefersLight =
      window.matchMedia("(prefers-color-scheme: light)").matches;

    root.setAttribute(
      "data-theme",
      prefersLight ? "light" : "dark"
    );
  }


  // Change theme when clicked
  toggle.addEventListener("click", () => {

    const currentTheme =
      root.getAttribute("data-theme");

    const nextTheme =
      currentTheme === "dark"
        ? "light"
        : "dark";

    root.setAttribute(
      "data-theme",
      nextTheme
    );

    localStorage.setItem(
      "localcart-theme",
      nextTheme
    );

  });

}


/* ==========================================================
   BROWSE PRODUCTS BUTTON
========================================================== */

function initBrowseButton() {

  const browseButton =
    document.getElementById("browse-products");

  const productsSection =
    document.getElementById("products-grid");


  if (!browseButton || !productsSection) return;


  browseButton.addEventListener("click", () => {

    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

}


/* ==========================================================
   NAVIGATION
========================================================== */

function initNavigation() {

  const navLinks =
    document.querySelectorAll("header nav a");


  navLinks.forEach((link) => {

    link.addEventListener("click", () => {

      // Remove active class from all links
      navLinks.forEach((item) => {
        item.classList.remove("active");
      });


      // Add active class to clicked link
      link.classList.add("active");

      /*
        IMPORTANT:
        We do NOT use preventDefault() here.

        The browser must be allowed to follow:
        index.html
        featured-products.html
        about.html
        subscribe.html
      */

    });

  });

}


/* ==========================================================
   SEARCH
========================================================== */

function initSearch() {

  const searchInput =
    document.getElementById("search-input");

  if (!searchInput) return;


  searchInput.addEventListener("input", () => {

    applyFilters();

  });

}


/* ==========================================================
   CATEGORY FILTER
========================================================== */

function initCategoryFilter() {

  const categoryCards =
    document.querySelectorAll(".category-card");


  categoryCards.forEach((card) => {


    // Click
    card.addEventListener("click", () => {

      toggleCategory(card);

    });


    // Keyboard accessibility
    card.addEventListener("keydown", (event) => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        toggleCategory(card);

      }

    });

  });

}


/* ==========================================================
   TOGGLE CATEGORY
========================================================== */

function toggleCategory(card) {

  const category =
    card.dataset.category;

  const alreadyActive =
    card.classList.contains("active");


  // Remove active from every category
  document
    .querySelectorAll(".category-card")
    .forEach((item) => {

      item.classList.remove("active");

    });


  // If it wasn't active, activate it
  if (!alreadyActive) {

    card.classList.add("active");

  }


  // Apply category filter
  applyFilters();


  // Scroll to products
  const productsSection =
    document.getElementById("products-grid");

  if (productsSection) {

    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


/* ==========================================================
   FILTER PRODUCTS
========================================================== */

function applyFilters() {

  const searchInput =
    document.getElementById("search-input");


  const searchTerm =
    searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";


  // Find active category
  const activeCategoryCard =
    document.querySelector(
      ".category-card.active"
    );


  const activeCategory =
    activeCategoryCard
      ? activeCategoryCard.dataset.category
      : null;


  // Find products
  const productCards =
    document.querySelectorAll(".product-card");


  let visibleProducts = 0;


  productCards.forEach((card) => {

    const name =
      card.dataset.name
        ? card.dataset.name.toLowerCase()
        : "";


    const vendor =
      card.dataset.vendor
        ? card.dataset.vendor.toLowerCase()
        : "";


    const category =
      card.dataset.category
        ? card.dataset.category
        : "";


    // Search matching
    const matchesSearch =
      searchTerm === "" ||
      name.includes(searchTerm) ||
      vendor.includes(searchTerm);


    // Category matching
    const matchesCategory =
      !activeCategory ||
      category === activeCategory;


    // Final result
    const shouldShow =
      matchesSearch &&
      matchesCategory;


    card.style.display =
      shouldShow ? "" : "none";


    if (shouldShow) {

      visibleProducts++;

    }

  });


  // Empty state
  const emptyState =
    document.getElementById("empty-state");


  if (emptyState) {

    emptyState.hidden =
      visibleProducts !== 0;

  }

}


/* ==========================================================
   SHOPPING CART
========================================================== */

function initCart() {

  const cartCount =
    document.getElementById("cart-count");


  const addButtons =
    document.querySelectorAll(".btn-add-cart");


  /*
    Get existing cart from LocalStorage.

    This means the cart doesn't disappear
    when the user changes pages or refreshes.
  */

  let cart =
    JSON.parse(
      localStorage.getItem("localcart-cart")
    ) || [];


  /* --------------------------------------------------------
     Save cart
  -------------------------------------------------------- */

  function saveCart() {

    localStorage.setItem(
      "localcart-cart",
      JSON.stringify(cart)
    );

  }


  /* --------------------------------------------------------
     Update cart number
  -------------------------------------------------------- */

  function updateCartCount() {

    const totalQuantity =
      cart.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );


    if (cartCount) {

      cartCount.textContent =
        totalQuantity;

      /*
        Hide the badge when cart is empty.
      */

      cartCount.hidden =
        totalQuantity === 0;

    }

  }


  /* --------------------------------------------------------
     Add product
  -------------------------------------------------------- */

  function addToCart(product) {

    const existingProduct =
      cart.find(
        (item) =>
          item.name === product.name &&
          item.vendor === product.vendor
      );


    if (existingProduct) {

      existingProduct.quantity += 1;

    } else {

      cart.push({

        name: product.name,

        vendor: product.vendor,

        price: product.price,

        quantity: 1

      });

    }


    saveCart();

    updateCartCount();

  }


  /* --------------------------------------------------------
     Add button events
  -------------------------------------------------------- */

  addButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const productCard =
        button.closest(".product-card");


      if (!productCard) return;


      const product = {

        name:
          productCard.dataset.name,

        vendor:
          productCard.dataset.vendor,

        price:
          Number(productCard.dataset.price)

      };


      addToCart(product);


      /*
        Give the user visual feedback.
      */

      const originalText =
        button.textContent;


      button.textContent =
        "Added ✓";

      button.disabled = true;


      setTimeout(() => {

        button.textContent =
          originalText;

        button.disabled = false;

      }, 900);

    });

  });


  // Initial cart count
  updateCartCount();

}


/* ==========================================================
   INITIAL PRODUCT FILTER
========================================================== */

applyFilters();