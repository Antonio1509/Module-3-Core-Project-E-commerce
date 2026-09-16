// API Configuration
const API_URL = window.LOCALCART_API_URL || 'http://localhost:5000/api';

// Load cart data from sessionStorage
let cartData = null;
let orderTotal = 0;
let totalItems = 0;

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

    if (new URLSearchParams(window.location.search).get('subscription') === 'true') {
        loadSubscriptionCheckout();
        activateReturnedSubscription();
    } else {
        loadCartData();
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('localcart-theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('localcart-theme', newTheme);
        });
    }
    
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
});

async function activateReturnedSubscription() {
    const params = new URLSearchParams(window.location.search);
    const returnedSuccessfully = ['success', 'COMPLETE', 'completed'].includes(params.get('payment') || params.get('status') || params.get('payment_status'));
    const pending = JSON.parse(localStorage.getItem('pendingSubscription') || 'null');
    if (!returnedSuccessfully || !pending) return;

    try {
        const response = await apiCall('/subscriptions/subscribe', {
            method: 'POST',
            body: JSON.stringify({ planSlug: pending.plan, price: Number(pending.price || 0), billingPeriod: pending.period || 'monthly' })
        });
        if (!response.success && response.error) throw new Error(response.error);
        localStorage.removeItem('pendingSubscription');
        Swal.fire({ icon: 'success', title: 'Subscription activated', text: 'Your vendor plan is now active.', confirmButtonColor: '#2d6a4f' })
            .then(() => { window.location.href = 'vendor-dashboard.html'; });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Subscription confirmation failed', text: error.message || 'Could not activate your plan.', confirmButtonColor: '#2d6a4f' });
    }
}

function loadSubscriptionCheckout() {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan') || 'Subscription';
    const price = Number(params.get('price') || 0);
    const period = params.get('period') === 'yearly' ? 'year' : 'month';
    const summary = document.getElementById('subscriptionSummary');
    const planName = document.getElementById('selectedPlanName');
    const planPrice = document.getElementById('selectedPlanPrice');
    const itemSummary = document.getElementById('cartItemsSummary');
    const deliveryRow = document.getElementById('deliverySummary');
    const total = document.querySelector('.total-amount');
    const placeOrderButton = document.getElementById('placeOrderBtn');

    document.getElementById('checkoutForm').hidden = true;
    document.getElementById('subscriptionForm').hidden = false;
    const user = getStoredUser() || {};
    document.getElementById('vendorFullName').value = user.name || '';
    document.getElementById('vendorBusinessName').value = user.business_name || user.store_name || '';
    document.getElementById('vendorEmail').value = user.email || '';
    document.getElementById('vendorPhone').value = user.phone || '';
    document.getElementById('vendorBillingAddress').value = [user.street, user.city, user.province].filter(Boolean).join(', ');
    document.querySelector('.page-title').textContent = 'Subscription checkout';
    summary.hidden = false;
    planName.textContent = plan;
    planPrice.textContent = `R${price.toFixed(2)} / ${period}`;
    if (itemSummary) itemSummary.hidden = true;
    if (deliveryRow) deliveryRow.hidden = true;
    orderTotal = price;
    if (total) total.textContent = `R${price.toFixed(2)}`;
    if (placeOrderButton) placeOrderButton.textContent = 'Subscribe with PayFast';
    renderVendorCheckoutNavigation();
}

function renderVendorCheckoutNavigation() {
    const header = document.querySelector('body > header');
    const nav = header?.querySelector('nav');
    const logo = header?.querySelector('.logo');
    if (!header || !nav) return;
    if (logo && !logo.querySelector('.logo-tag')) {
        logo.insertAdjacentHTML('beforeend', ' <span class="logo-tag">for Vendors</span>');
    }
    nav.innerHTML = `
        <a href="vendor-dashboard.html">Dashboard</a>
        <a href="add-product.html">Products</a>
        <a href="deliverytracker.html">Orders</a>
        <a href="subscription.html" class="active">Subscribe</a>`;
}

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
    const delivery = Number(cartInfo.delivery_fee || cartInfo.delivery || 0);
    orderTotal = subtotal + delivery;
    totalItems = cartInfo.total_items || items.reduce((sum, item) => sum + item.quantity, 0);
    
    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 3) {
        const itemsSummary = document.getElementById('cartItemsSummary');
        const deliverySummary = document.getElementById('deliverySummary');
        if (itemsSummary) itemsSummary.innerHTML = `<span>${totalItems} items</span><span>R${subtotal.toFixed(2)}</span>`;
        if (deliverySummary) deliverySummary.innerHTML = `<span>Delivery</span><span>R${delivery.toFixed(2)}</span>`;
        
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

    const subscriptionParams = new URLSearchParams(window.location.search);
    if (subscriptionParams.get('subscription') === 'true') {
        const vendorFullName = document.getElementById('vendorFullName').value.trim();
        const vendorBusinessName = document.getElementById('vendorBusinessName').value.trim();
        const vendorEmail = document.getElementById('vendorEmail').value.trim();
        const vendorPhone = document.getElementById('vendorPhone').value.trim();
        const vendorBillingAddress = document.getElementById('vendorBillingAddress').value.trim();
        if (!vendorFullName || !vendorBusinessName || !vendorEmail || !vendorPhone || !vendorBillingAddress) {
            Swal.fire({ icon: 'warning', title: 'Complete your details', text: 'Please fill in all vendor payment details before continuing.', confirmButtonColor: '#2d6a4f' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorEmail)) {
            Swal.fire({ icon: 'warning', title: 'Invalid email', text: 'Please enter a valid email address.', confirmButtonColor: '#2d6a4f' });
            return;
        }
        const subscriptionOrderNumber = `SUB-${Date.now()}`;
        Swal.fire({
            title: 'Preparing PayFast...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        try {
            const paymentResponse = await apiCall('/payment/initiate', {
                method: 'POST',
                body: JSON.stringify({
                    paymentType: 'subscription',
                    payment_type: 'subscription',
                    orderNumber: subscriptionOrderNumber,
                    order_number: subscriptionOrderNumber,
                    planSlug: subscriptionParams.get('plan'),
                    plan_slug: subscriptionParams.get('plan'),
                    totalAmount: Number(subscriptionParams.get('price') || 0),
                    total_amount: Number(subscriptionParams.get('price') || 0),
                    amount: Number(subscriptionParams.get('price') || 0),
                    paymentMethod: 'payfast',
                    payment_method: 'payfast',
                    billingPeriod: subscriptionParams.get('period') || 'monthly',
                    billing_period: subscriptionParams.get('period') || 'monthly',
                    customerName: vendorFullName,
                    customer_name: vendorFullName,
                    customerEmail: vendorEmail,
                    customer_email: vendorEmail,
                    full_name: vendorFullName,
                    business_name: vendorBusinessName,
                    phone: vendorPhone,
                    billing_address: vendorBillingAddress,
                    item_name: `${subscriptionParams.get('plan') || 'LocalCart'} vendor subscription`,
                    description: `${vendorBusinessName} subscription`,
                    returnUrl: `${window.location.origin}${window.location.pathname}?${subscriptionParams.toString()}&payment=success`,
                    cancelUrl: `${window.location.origin}${window.location.pathname}?${subscriptionParams.toString()}&payment=cancelled`,
                    return_url: `${window.location.origin}${window.location.pathname}?${subscriptionParams.toString()}&payment=success`,
                    cancel_url: `${window.location.origin}${window.location.pathname}?${subscriptionParams.toString()}&payment=cancelled`
                })
            });
            if (!paymentResponse.success) {
                throw new Error(paymentResponse.error || 'Could not prepare PayFast payment.');
            }
            const payment = paymentResponse.data || paymentResponse;
            if (!payment.payfastUrl || !payment.paymentData) {
                throw new Error('PayFast payment details were not returned by the server.');
            }
            localStorage.setItem('pendingSubscription', JSON.stringify({
                plan: subscriptionParams.get('plan'),
                price: subscriptionParams.get('price'),
                period: subscriptionParams.get('period')
            }));
            const paymentForm = document.createElement('form');
            paymentForm.method = 'POST';
            paymentForm.action = payment.payfastUrl;
            Object.entries(payment.paymentData).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                paymentForm.appendChild(input);
            });
            document.body.appendChild(paymentForm);
            paymentForm.submit();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Subscription failed', text: error.message || 'Could not activate subscription.', confirmButtonColor: '#2d6a4f' });
        }
        return;
    }

    // ============================================================
    // Get Form Values
    // ============================================================
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email')?.value.trim() || '';
    const address = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();

    // ============================================================
    // Validation
    // ============================================================
    if (!fullName || !address || !city || !postalCode) {
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
                postal_code: postalCode,
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
        localStorage.setItem('pendingOrderNumber', orderNumber);

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