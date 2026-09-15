// API Configuration
const API_URL = 'http://localhost:5000/api';

// Load cart data from sessionStorage
let cartData = null;
let orderTotal = 615.00;
let totalItems = 3;

// =========================================================
// Get Auth Token
// =========================================================
function getAuthToken() {
    return localStorage.getItem('token');
}

// =========================================================
// API Call
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
// PAGE INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    // ============================================================
    // EARLY GUARD: Redirect guests before they can fill in the form
    // ============================================================
    if (!getAuthToken()) {
        Swal.fire({
            icon: 'warning',
            title: 'Please Log In',
            text: 'You need an account to check out. Please log in or sign up to continue.',
            confirmButtonColor: '#2d6a4f',
            confirmButtonText: 'Go to Login',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }

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
// Load from session storage
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
    
    const items = cartInfo.items || [];
    const subtotal = cartInfo.subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = cartInfo.delivery_fee || cartInfo.delivery || 60;
    orderTotal = subtotal + delivery;
    totalItems = cartInfo.total_items || items.reduce((sum, item) => sum + item.quantity, 0);
    
    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 3) {
        const itemsSpan = summaryRows[0].querySelectorAll('span');
        if (itemsSpan.length >= 2) {
            itemsSpan[0].textContent = `${totalItems} items`;
            itemsSpan[1].textContent = `R${subtotal.toFixed(2)}`;
        }
        
        const totalRow = summaryRows[2];
        const totalAmount = totalRow.querySelector('.total-amount');
        if (totalAmount) {
            totalAmount.textContent = `R${orderTotal.toFixed(2)}`;
        }
    }
}

// =========================================================
// PAYFAST INTEGRATION
// =========================================================
async function placeOrder(e) {
    if (e) e.preventDefault();

    // ============================================================
    // Require Authentication
    // ============================================================
    const authToken = getAuthToken();
    if (!authToken) {
        Swal.fire({
            icon: 'warning',
            title: 'Please Log In',
            text: 'You need an account to place an order. Please log in or sign up to continue.',
            confirmButtonColor: '#2d6a4f',
            confirmButtonText: 'Go to Login'
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }

    // ============================================================
    // Get Form Values
    // ============================================================
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email')?.value.trim() || '';
    const address = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();

    // ============================================================
    // Validation
    // ============================================================
    if (!fullName || !address || !city) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Delivery Address',
            text: 'Please fill in all delivery address fields.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.',
            confirmButtonColor: '#2d6a4f'
        });
        return;
    }

    // ============================================================
    // Show Loading State
    // ============================================================
    Swal.fire({
        title: 'Processing Order...',
        text: 'Please wait while we prepare your payment',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        // ============================================================
        // Create Order in Backend
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
        console.log(' Order created:', orderNumber);

        // ============================================================
        // Initiate PayFast Payment
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

        console.log(' PayFast data received:', paymentResult.data);

        // ============================================================
        // Save Order Data for Confirmation Page
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
        // Redirect to PayFast
        // ============================================================
        Swal.fire({
            title: 'Redirecting to PayFast...',
            text: 'You will be redirected to complete your payment',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // Build hidden form
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

        // Submit the form
        document.body.appendChild(form);
        console.log(' Submitting to PayFast...');
        form.submit();

    } catch (error) {
        console.error(' Order/Payment error:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: error.message || 'Something went wrong. Please try again.',
            confirmButtonColor: '#2d6a4f'
        });
    }
}

console.log(' Checkout.js with PayFast loaded successfully!');