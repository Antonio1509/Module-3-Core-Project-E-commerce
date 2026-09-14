// ===== CHECKOUT FUNCTIONALITY WITH PAYFAST =====

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Load cart data from sessionStorage
let cartData = null;
let orderTotal = 615.00;
let totalItems = 3;

// =========================================================
// HELPER: Get Auth Token
// =========================================================
function getAuthToken() {
    return localStorage.getItem('token');
}

// =========================================================
// HELPER: API Call
// =========================================================
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
    return await response.json();
}

// =========================================================
// LOAD CART DATA ON PAGE LOAD
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    loadCartData();
    
    // Theme toggle
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
    
    // Card formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiry);
    }
    
    const cvcInput = document.getElementById('cvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', formatCVC);
    }
    
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
});

// =========================================================
// LOAD CART DATA FROM BACKEND
// =========================================================
async function loadCartData() {
    try {
        const token = getAuthToken();
        if (!token) {
            console.warn('No auth token - using session storage cart');
            loadCartFromSession();
            return;
        }
        
        const result = await apiCall('/cart');
        
        if (result.success) {
            cartData = result.data;
            updateOrderSummary(cartData);
        } else {
            console.warn('Failed to load cart from API, using session');
            loadCartFromSession();
        }
    } catch (error) {
        console.error('Load cart error:', error);
        loadCartFromSession();
    }
}

// =========================================================
// FALLBACK: Load from session storage
// =========================================================
function loadCartFromSession() {
    const cartJson = sessionStorage.getItem('checkoutCart');
    if (cartJson) {
        try {
            cartData = JSON.parse(cartJson);
            updateOrderSummary(cartData);
        } catch (e) {
            console.error('Error loading cart from session:', e);
        }
    }
}

// =========================================================
// UPDATE ORDER SUMMARY
// =========================================================
function updateOrderSummary(cartInfo) {
    if (!cartInfo) return;
    
    // Handle both API response format and session format
    const items = cartInfo.items || [];
    const subtotal = cartInfo.subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = cartInfo.delivery_fee || cartInfo.delivery || 60;
    orderTotal = subtotal + delivery;
    totalItems = cartInfo.total_items || items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update summary rows
    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 3) {
        // Items row
        const itemsSpan = summaryRows[0].querySelectorAll('span');
        if (itemsSpan.length >= 2) {
            itemsSpan[0].textContent = `${totalItems} items`;
            itemsSpan[1].textContent = `R${subtotal.toFixed(2)}`;
        }
        
        // Total row
        const totalRow = summaryRows[2];
        const totalAmount = totalRow.querySelector('.total-amount');
        if (totalAmount) {
            totalAmount.textContent = `R${orderTotal.toFixed(2)}`;
        }
    }
}

// =========================================================
// PLACE ORDER - PAYFAST INTEGRATION
// =========================================================
async function placeOrder(e) {
    e.preventDefault();

    // ============================================================
    //  Get Form Values
    // ============================================================
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email')?.value.trim() || '';
    const address = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('expiry').value.trim();
    const cvc = document.getElementById('cvc').value.trim();

    // ============================================================
    //  Validation
    // ============================================================
    
    // Check required delivery fields
    if (!fullName || !address || !city) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Delivery Address',
            text: 'Please fill in all delivery address fields before placing your order.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    // Validate email (needed for PayFast)
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    // Validate card number
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

    // ============================================================
    //  Show Loading State
    // ============================================================
    Swal.fire({
        title: 'Processing Order...',
        text: 'Please wait while we prepare your payment',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // ============================================================
        //  Create Order in Backend FIRST
        // ============================================================
        const orderResponse = await apiCall('/orders/create', {
            method: 'POST',
            body: JSON.stringify({
                shipping_address: address,
                city: city,
                postal_code: '8001',
                payment_method: 'payfast',
                full_name: fullName,
                email: email
            })
        });

        if (!orderResponse.success) {
            throw new Error(orderResponse.error || 'Failed to create order');
        }

        const orderNumber = orderResponse.data.order_number;
        console.log('Order created:', orderNumber);

        // ============================================================
        //  Initiate PayFast Payment
        // ============================================================
        const paymentResponse = await fetch(`${API_URL}/payment/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                orderNumber: orderNumber,
                totalAmount: orderTotal,
                customerName: fullName,
                customerEmail: email
            })
        });

        const paymentResult = await paymentResponse.json();

        if (!paymentResult.success) {
            throw new Error(paymentResult.error || 'Failed to initiate payment');
        }

        console.log('PayFast payment initiated:', paymentResult.data);

        // ============================================================
        //  Save Order Data for Confirmation Page
        // ============================================================
        const orderData = {
            orderNumber: orderNumber,
            fullName: fullName,
            email: email,
            address: address,
            city: city,
            total: `R${orderTotal.toFixed(2)}`,
            totalAmount: orderTotal,
            items: cartData?.items || [],
            itemCount: totalItems,
            paymentMethod: 'payfast',
            deliveryEstimate: '2-4 business days'
        };

        localStorage.setItem('orderData', JSON.stringify(orderData));

        // ============================================================
        //  Build and Submit PayFast Form
        // ============================================================
        Swal.fire({
            title: 'Redirecting to PayFast...',
            text: 'You will be redirected to complete your payment',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Create hidden form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentResult.data.payfastUrl;
        form.target = '_self';

        // Add all payment data as hidden inputs
        Object.entries(paymentResult.data.paymentData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            }
        });

        // Append form and submit
        document.body.appendChild(form);
        console.log('Submitting form to PayFast...');
        form.submit();

    } catch (error) {
        console.error('Order/Payment error:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: error.message || 'Something went wrong. Please try again.',
            confirmButtonColor: '#2d6a4f'
        });
    }
}

// =========================================================
// CARD FORMATTING HELPERS
// =========================================================
function formatCardNumber(e) {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    this.value = formatted;
}

function formatExpiry(e) {
    let value = this.value.replace(/\D/g, '');
    if (value.length >= 2) {
        this.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        this.value = value;
    }
}

function formatCVC(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
}

console.log('Checkout.js with PayFast loaded successfully!');