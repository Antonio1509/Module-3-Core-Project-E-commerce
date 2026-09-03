// ===== CHECKOUT FUNCTIONALITY =====

// Load cart data from sessionStorage
let cartData = null;
let orderTotal = 615.00;
let totalItems = 3;

document.addEventListener('DOMContentLoaded', function() {
    // Load cart from sessionStorage
    const cartJson = sessionStorage.getItem('checkoutCart');
    if (cartJson) {
        try {
            cartData = JSON.parse(cartJson);
            // Update order summary with actual cart data
            updateOrderSummary();
        } catch (e) {
            console.error('Error loading cart:', e);
        }
    }
});

function updateOrderSummary() {
    if (!cartData || !cartData.items) return;
    
    const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = cartData.delivery || 60;
    orderTotal = subtotal + delivery;
    totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update summary rows
    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 3) {
        // Items row
        const itemsSpan = summaryRows[0].querySelectorAll('span');
        if (itemsSpan.length >= 2) {
            itemsSpan[0].textContent = `${totalItems} items`;
            itemsSpan[1].textContent = `R${subtotal.toFixed(2)}`;
        }
        
        // Delivery row - keep as is
        
        // Total row
        const totalRow = summaryRows[2];
        const totalAmount = totalRow.querySelector('.total-amount');
        if (totalAmount) {
            totalAmount.textContent = `R${orderTotal.toFixed(2)}`;
        }
    }
}

// Place order button
document.getElementById('placeOrderBtn').addEventListener('click', function(e) {
    e.preventDefault();

    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const address = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('expiry').value.trim();
    const cvc = document.getElementById('cvc').value.trim();

    // ===== VALIDATION =====
    // Check required fields
    if (!fullName || !address || !city) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Delivery Address',
            text: 'Please fill in all delivery address fields before placing your order.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    // Validate card number (simple check)
    const cardClean = cardNumber.replace(/\s/g, '');
    if (cardClean.length < 16) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Card Number',
            text: 'Please enter a valid 16-digit card number.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    // Validate expiry
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Expiry Date',
            text: 'Please enter expiry date in MM/YY format.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    // Validate CVC
    if (cvc.length < 3) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid CVC',
            text: 'Please enter a valid 3-digit CVC code.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    // ===== PROCESS PAYMENT =====
    // Show loading state
    Swal.fire({
        title: 'Processing Payment...',
        text: 'Please wait while we confirm your order',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Simulate payment processing (2 seconds)
    setTimeout(() => {
        // Generate order number
        const orderNumber = 'LC-' + String(Date.now()).slice(-5);

        // Get cart items for order data
        let items = [];
        let vendorCount = 0;
        let vendors = new Set();
        
        if (cartData && cartData.items) {
            items = cartData.items.map(item => ({
                name: item.name,
                vendor: item.vendor,
                quantity: item.quantity,
                price: item.price
            }));
            cartData.items.forEach(item => {
                if (item.vendor) vendors.add(item.vendor);
            });
            vendorCount = vendors.size;
        } else {
            // Fallback default items
            items = [
                { name: 'Honey oat cookies', vendor: "Maya's Kitchen", quantity: 1, price: 85 },
                { name: 'Shea body butter', vendor: 'Pure Roots Skincare', quantity: 1, price: 150 },
                { name: 'Beaded tote bag', vendor: 'Thandi Designs', quantity: 1, price: 320 }
            ];
            vendorCount = 3;
        }

        // Save order data to localStorage for confirmation page
        const orderData = {
            orderNumber: orderNumber,
            fullName: fullName,
            address: address,
            city: city,
            total: `R${orderTotal.toFixed(2)}`,
            items: items,
            itemCount: totalItems,
            vendorCount: vendorCount,
            deliveryEstimate: '2-4 business days'
        };

        localStorage.setItem('orderData', JSON.stringify(orderData));

        // Build items list HTML for the confirmation
        let itemsHtml = items.map(item => 
            `<li style="padding:4px 0;"> ${item.name} - ${item.vendor} (x${item.quantity})</li>`
        ).join('');

        Swal.fire({
            icon: 'success',
            title: 'Order Confirmed!',
            html: `
                <p style="font-size:16px; font-weight:600; color:#2d6a4f;">
                    Order #${orderNumber}
                </p>
                <p style="color:#6c757d; font-size:14px;">
                    A confirmation has been sent to your email
                </p>
                <hr style="margin:16px 0; border-color:#edf2f7;">
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; text-align:center; background:#f8f9fa; padding:16px; border-radius:8px;">
                    <div>
                        <div style="font-size:12px; color:#6c757d;">Total paid</div>
                        <div style="font-size:18px; font-weight:700; color:#1a1a2e;">R${orderTotal.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size:12px; color:#6c757d;">Items</div>
                        <div style="font-size:18px; font-weight:700; color:#1a1a2e;">${totalItems} from ${vendorCount} vendors</div>
                    </div>
                    <div>
                        <div style="font-size:12px; color:#6c757d;">Delivery</div>
                        <div style="font-size:18px; font-weight:700; color:#1a1a2e;">2-4 business days</div>
                    </div>
                </div>
                <div style="margin-top:16px; text-align:left; font-size:14px;">
                    <strong>Items:</strong>
                    <ul style="list-style:none; padding:0; margin-top:6px;">
                        ${itemsHtml}
                    </ul>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Track Order',
            cancelButtonText: 'View Order Details',
            confirmButtonColor: '#2d6a4f',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `track-order.html?order=${orderNumber}`;
            } else {
                window.location.href = 'confirmation.html';
            }
        });

    }, 2000);
});

// ===== REAL-TIME CARD FORMATTING =====
document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    this.value = formatted;
});

document.getElementById('expiry').addEventListener('input', function(e) {
    let value = this.value.replace(/\D/g, '');
    if (value.length >= 2) {
        this.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        this.value = value;
    }
});

document.getElementById('cvc').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});

// Theme toggle
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

console.log('Checkout.js loaded successfully!');