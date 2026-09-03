// ===== TRACK ORDER FUNCTIONALITY =====

(function() {
    'use strict';

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // ===== PROFILE DROPDOWN TOGGLE =====
    const profileToggle = document.getElementById('profile-toggle');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('open');
            const isOpen = profileDropdown.classList.contains('open');
            profileToggle.setAttribute('aria-expanded', isOpen);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('open');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ===== SEARCH FUNCTIONALITY =====
    const searchInput = document.getElementById('vendor-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log('Searching for:', searchTerm);
        });
    }

    // ===== ORDER STATUS DATA =====
    const orderData = {
        orderId: 'LC-10482',
        placedDate: '25 August 2026',
        status: 'packing', 
        items: [
            { name: 'Honey oat cookies', vendor: "Maya's Kitchen", },
            { name: 'Shea body butter', vendor: 'Pure Roots Skincare', },
            { name: 'Beaded tote bag', vendor: 'Thandi Designs', }
        ],
        timeline: [
            { label: 'Order placed', time: '25 Aug, 14:02', status: 'done' },
            { label: 'Payment confirmed', time: '25 Aug, 14:03', status: 'done' },
            { label: 'Packing', time: 'In progress', status: 'active' },
            { label: 'Out for delivery', time: 'Pending', status: 'pending' },
            { label: 'Delivered', time: 'Pending', status: 'pending' }
        ]
    };

    // ===== UPDATE TIMELINE STATUS =====
    function updateTimeline(status) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const statusMap = {
            'placed': 0,
            'confirmed': 1,
            'packing': 2,
            'shipped': 3,
            'delivered': 4
        };
        
        const currentIndex = statusMap[status] || 0;
        
        timelineItems.forEach((item, index) => {
            // Remove all status classes
            item.classList.remove('done', 'active', 'pending');
            
            if (index < currentIndex) {
                item.classList.add('done');
            } else if (index === currentIndex) {
                item.classList.add('active');
            } else {
                item.classList.add('pending');
            }
        });
    }

    // ===== UPDATE ORDER ITEMS =====
    function updateOrderItems(items) {
        const itemsList = document.querySelector('.items-list');
        if (!itemsList) return;
        
        // Clear existing items
        itemsList.innerHTML = '';
        
        // Add items from orderData
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-icon-box" style="background: ${getIconColor(item.name)};">
                    ${getIconSvg(item.name)}
                </span>
                <span class="item-name">${item.name}</span>
                <span class="item-vendor">${item.vendor}</span>
            `;
            itemsList.appendChild(li);
        });
    }

    // ===== HELPER: Get icon color based on item name =====
    function getIconColor(name) {
        const colors = {
            'cookies': '#c08a34',
            'butter': '#40916c',
            'bag': '#3a6ea5',
            'tea': '#6f8f52',
            'jam': '#b8443f',
            'dress': '#5a6ad0',
            'soap': '#6b6b6b',
            'lipbalm': '#d17a92',
            'bowl': '#c48b5e'
        };
        
        for (const [key, color] of Object.entries(colors)) {
            if (name.toLowerCase().includes(key)) {
                return color;
            }
        }
        return '#6a5cff'; // default color
    }

    // ===== HELPER: Get icon SVG based on item name =====
    function getIconSvg(name) {
        // Return appropriate SVG based on item type
        return `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>
        `;
    }

    // ===== UPDATE ORDER HEADER =====
    function updateOrderHeader(orderId, date) {
        const orderIdSpan = document.querySelector('.order-id');
        const dateSpan = document.querySelector('.track-date');
        
        if (orderIdSpan) {
            orderIdSpan.textContent = `#${orderId}`;
        }
        
        if (dateSpan) {
            dateSpan.textContent = `Placed ${date}`;
        }
    }

    // ===== SIMULATE REAL-TIME UPDATES (Demo) =====
    function simulateStatusUpdate() {
        const statuses = ['placed', 'confirmed', 'packing', 'shipped', 'delivered'];
        let currentIndex = 2; // Start at 'packing' (index 2)
        
        // Update every 5 seconds to simulate real-time tracking
        setInterval(() => {
            if (currentIndex < statuses.length - 1) {
                currentIndex++;
                const newStatus = statuses[currentIndex];
                updateTimeline(newStatus);
                
                // Update status labels
                const statusLabels = document.querySelectorAll('.timeline-item .status-time');
                if (statusLabels[currentIndex]) {
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    statusLabels[currentIndex].textContent = `Today, ${timeStr}`;
                }
                
                // Show notification when status changes
                if (currentIndex === 3) {
                    Toastify({
                        text: "Your order is out for delivery!",
                        duration: 3000,
                        gravity: "bottom",
                        position: "right",
                        style: { 
                            background: "#f0811f",
                            borderRadius: "10px"
                        }
                    }).showToast();
                } else if (currentIndex === 4) {
                    Toastify({
                        text: "Your order has been delivered!",
                        duration: 3000,
                        gravity: "bottom",
                        position: "right",
                        style: { 
                            background: "#2d6a4f",
                            borderRadius: "10px"
                        }
                    }).showToast();
                }
            }
        }, 5000); // Update every 5 seconds
    }

    // ===== INITIALIZE PAGE =====
    function initTrackPage() {
        // Update order header
        updateOrderHeader(orderData.orderId, orderData.placedDate);
        
        // Update order items
        updateOrderItems(orderData.items);
        
        // Update timeline based on current status
        updateTimeline(orderData.status);
        
        console.log('Track order page initialized successfully!');
        console.log(`Order #${orderData.orderId} - Status: ${orderData.status}`);
    }

    // ===== EVENT LISTENERS =====
    document.addEventListener('DOMContentLoaded', function() {
        initTrackPage();
        
    });

})();

console.log('Track-order.js loaded successfully!');