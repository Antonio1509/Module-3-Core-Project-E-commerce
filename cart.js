// ===== CART FUNCTIONALITY =====

// Get all cart items
const subtotalEl = document.querySelector('.subtotal');
const totalEl = document.querySelector('.total-amount');
const cartCountEl = document.querySelector('.cart-count');
const itemCountEl = document.querySelector('.item-count');

// Cart data structure for persistence
let cartData = {
    items: [],
    delivery: 60.00
};

// Initialize cart data from DOM
function initCartData() {
    cartData.items = [];
    document.querySelectorAll('.cart-item').forEach(item => {
        const name = item.querySelector('.item-name').textContent;
        const vendor = item.dataset.vendor || item.querySelector('.item-vendor').textContent;
        const price = parseFloat(item.querySelector('.item-price').textContent.replace('R', ''));
        const qty = parseInt(item.querySelector('.qty-value').textContent);
        const id = parseInt(item.dataset.id) || cartData.items.length + 1;
        
        cartData.items.push({
            id: id,
            name: name,
            vendor: vendor,
            price: price,
            quantity: qty
        });
    });
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartData));
}

// Load cart from localStorage
function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            cartData = parsed;
            return true;
        } catch (e) {
            console.error('Error loading cart:', e);
            return false;
        }
    }
    return false;
}

// Create a cart item element
function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.id = item.id;
    div.dataset.vendor = item.vendor;
    div.dataset.price = item.price;
    
    div.innerHTML = `
        <div class="item-image">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>
        </div>
        <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-vendor">${item.vendor}</p>
            <p class="item-price">R${item.price.toFixed(2)}</p>
        </div>
        <div class="item-actions">
            <div class="quantity-control">
                <button class="qty-btn minus" data-id="${item.id}">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    
    return div;
}

// Render cart items from cartData
function renderCart() {
    const container = document.querySelector('.cart-items');
    // Clear existing items
    container.querySelectorAll('.cart-item').forEach(item => item.remove());
    
    // Add items from cartData
    cartData.items.forEach(item => {
        const element = createCartItemElement(item);
        container.appendChild(element);
    });
    
    updateCartTotal();
}

// Update total function
function updateCartTotal() {
    let subtotal = 0;
    let totalItems = 0;

    cartData.items.forEach(item => {
        subtotal += item.price * item.quantity;
        totalItems += item.quantity;
    });

    const delivery = cartData.delivery || 60;
    const total = subtotal + delivery;

    // Update display
    if (subtotalEl) subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `R${total.toFixed(2)}`;
    if (cartCountEl) cartCountEl.textContent = totalItems;
    if (itemCountEl) itemCountEl.textContent = `(${totalItems} items)`;
}

// ===== EVENT DELEGATION - THIS FIXES THE ISSUE =====
// Listen for clicks on the cart-items container
document.querySelector('.cart-items').addEventListener('click', function(e) {
    const target = e.target.closest('button');
    if (!target) return;
    
    // Find the parent cart item
    const cartItem = target.closest('.cart-item');
    if (!cartItem) return;
    
    const itemId = parseInt(cartItem.dataset.id);
    const itemIndex = cartData.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    const qtySpan = cartItem.querySelector('.qty-value');
    let currentQty = cartData.items[itemIndex].quantity;
    
    // Handle plus button
    if (target.classList.contains('plus')) {
        cartData.items[itemIndex].quantity++;
        qtySpan.textContent = cartData.items[itemIndex].quantity;
        updateCartTotal();
        saveCart();
        Toastify({
            text: `Quantity updated to ${cartData.items[itemIndex].quantity}`,
            duration: 1500,
            gravity: "bottom",
            position: "right",
            style: { background: "#2d6a4f" }
        }).showToast();
        return;
    }
    
    // Handle minus button
    if (target.classList.contains('minus')) {
        if (cartData.items[itemIndex].quantity > 1) {
            cartData.items[itemIndex].quantity--;
            qtySpan.textContent = cartData.items[itemIndex].quantity;
            updateCartTotal();
            saveCart();
            Toastify({
                text: `Quantity updated to ${cartData.items[itemIndex].quantity}`,
                duration: 1500,
                gravity: "bottom",
                position: "right",
                style: { background: "#2d6a4f" }
            }).showToast();
        } else {
            Toastify({
                text: "Quantity cannot be less than 1",
                duration: 1500,
                gravity: "bottom",
                position: "right",
                style: { background: "#f4a261" }
            }).showToast();
        }
        return;
    }
    
    // Handle remove button
    if (target.classList.contains('remove-item')) {
        const itemName = cartData.items[itemIndex].name;
        
        Swal.fire({
            title: 'Remove item?',
            text: `Are you sure you want to remove "${itemName}" from your cart?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, remove it'
        }).then((result) => {
            if (result.isConfirmed) {
                cartData.items.splice(itemIndex, 1);
                renderCart();
                saveCart();
                
                Toastify({
                    text: `✓ Removed "${itemName}" from cart`,
                    duration: 2000,
                    gravity: "bottom",
                    position: "right",
                    style: { background: "#e63946" }
                }).showToast();
                
                if (cartData.items.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Your cart is empty',
                        text: 'Browse products to add items to your cart',
                        confirmButtonColor: '#2d6a4f'
                    });
                }
            }
        });
        return;
    }
});

// Initialize cart
document.addEventListener('DOMContentLoaded', function() {
    // Try to load from localStorage first
    const loaded = loadCart();
    
    if (!loaded || cartData.items.length === 0) {
        // If no saved cart, initialize from DOM
        initCartData();
        // Update the DOM to match the initialized data
        const container = document.querySelector('.cart-items');
        container.querySelectorAll('.cart-item').forEach(item => item.remove());
        cartData.items.forEach(item => {
            const element = createCartItemElement(item);
            container.appendChild(element);
        });
        saveCart();
    } else {
        // Render the loaded cart
        renderCart();
    }
    
    // Update checkout button to pass data
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Save to sessionStorage for checkout
            sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));
            window.location.href = 'choosedelivery.html';
        });
    }
});

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

console.log('Cart.js loaded successfully!');