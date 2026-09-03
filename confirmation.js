// ===== CONFIRMATION FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    // Load order data from localStorage
    const orderDataJson = localStorage.getItem('orderData');
    let orderData = null;
    
    if (orderDataJson) {
        try {
            orderData = JSON.parse(orderDataJson);
        } catch (e) {
            console.error('Error loading order data:', e);
        }
    }
    
    // If no order data, use defaults
    if (!orderData) {
        orderData = {
            orderNumber: 'LC-10482',
            total: 'R615.00',
            itemCount: 3,
            vendorCount: 3,
            deliveryEstimate: '2-4 business days',
            items: [
                { name: 'Honey oat cookies', vendor: "Maya's Kitchen", quantity: 1 },
                { name: 'Shea body butter', vendor: 'Pure Roots Skincare', quantity: 1 },
                { name: 'Beaded tote bag', vendor: 'Thandi Designs', quantity: 1 }
            ]
        };
    }
    
    // Update order number
    const orderNumberEl = document.getElementById('orderNumber');
    if (orderNumberEl) {
        orderNumberEl.textContent = orderData.orderNumber || 'LC-10482';
    }
    
    // Update total paid
    const totalPaidEl = document.getElementById('totalPaid');
    if (totalPaidEl) {
        totalPaidEl.textContent = orderData.total || 'R615.00';
    }
    
    // Update item count
    const itemCountEl = document.getElementById('itemCount');
    if (itemCountEl) {
        itemCountEl.textContent = `${orderData.itemCount || 3} from ${orderData.vendorCount || 3} vendors`;
    }
    
    // Update delivery estimate
    const deliveryEl = document.getElementById('deliveryEstimate');
    if (deliveryEl) {
        deliveryEl.textContent = orderData.deliveryEstimate || '2-4 business days';
    }
    
    // Update items list
    const itemsContainer = document.querySelector('.order-items .items-list');
    if (itemsContainer && orderData.items) {
        // Clear existing items (keep the container)
        const existingItems = itemsContainer.querySelectorAll('.order-item');
        existingItems.forEach(item => item.remove());
        
        // Add items from order data
        orderData.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item';
            
            // Determine icon based on item name or use default
            let iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c08a34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>`;
            
            // Color code based on item
            let color = '#c08a34';
            if (item.name && item.name.toLowerCase().includes('butter')) {
                color = '#40916c';
            } else if (item.name && item.name.toLowerCase().includes('bag')) {
                color = '#3a6ea5';
            }
            
            iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>`;
            
            itemDiv.innerHTML = `
                <span class="item-icon">${iconSvg}</span>
                <div class="item-info">
                    <span class="item-name">${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                    <span class="item-vendor">${item.vendor}</span>
                </div>
            `;
            
            itemsContainer.appendChild(itemDiv);
        });
    }
    
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
});

console.log('Confirmation.js loaded successfully!');