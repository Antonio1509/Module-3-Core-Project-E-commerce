# LocalCart — Frontend

The customer- and vendor-facing web app for **LocalCart**, a multi-vendor marketplace connecting local South African vendors with customers. Built with plain HTML, CSS, and JavaScript — no framework or build step required.

## Features

-  Product browsing with category filters & search
-  Vendor storefronts with follow/unfollow
-  Shopping cart with live quantity updates
-  Delivery method selection (RankDrop pickup or home delivery)
-  Checkout with PayFast payment integration
-  Order confirmation & order tracking
-  Product reviews
-  Customer profile management
-  Vendor dashboard: manage products, view orders, track shipments, manage subscription plan
-  Light/dark theme toggle

## Tech Stack

| Layer | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 (with `mobile.css` for responsive breakpoints) |
| Logic | Vanilla JavaScript (ES6+) |
| Alerts | SweetAlert2 |
| Hosting | Render (static site) |

## Project Structure

├── index.html # Homepage / product dashboard
├── vendors.html # Vendor directory
├── vendor.html # Individual vendor storefront
├── vendor-dashboard.html # Vendor admin dashboard
├── add-product.html # Vendor: add new product
├── cart.html # Shopping cart
├── choosedelivery.html # Delivery method selection
├── checkout.html # Checkout & payment
├── confirmation.html # Order confirmation
├── track-order.html # Order tracking
├── deliverytracker.html # Vendor: order fulfilment overview
├── createshipment.html # Vendor: create shipment
├── rankdelivery.html # RankDrop pickup point selection
├── rankoverview.html # Vendor: RankDrop analytics
├── subscription.html # Vendor subscription plans
├── login.html / about.html / contact.html # Auth & static pages
├── app.js # Shared behaviour (theme, profile dropdown, logout)
├── api.js # Core API client (apiFetch, auth helpers)
├── config.js # API base URL configuration
├── products.js / vendor.js / vendors.js / cart.js / ... # Page-specific logic
├── style.css # Main stylesheet
└── mobile.css # Responsive styles


## Getting Started

### Prerequisites

- A running instance of the [LocalCart backend API](https://github.com/Antonio1509/Module-3-Core-Project-E-commerce-Backend)
- A local static server (e.g. VS Code's Live Server extension), since some browser features require a served page rather than a `file://` URL

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Antonio1509/Module-3-Core-Project-E-commerce.git
cd Module-3-Core-Project-E-commerce
```

2. Configure your API URL — create or edit `config.js`:

```javascript
window.LOCALCART_API_URL = 'http://localhost:5000/api';
```

Update this to your deployed backend URL when deploying (e.g. a Railway URL).

3. Serve the folder with a local static server (e.g. right-click `index.html` → "Open with Live Server" in VS Code).

## Configuration

All API calls read their base URL from a single global variable set in `config.js`:

```javascript
window.LOCALCART_API_URL = 'https://your-backend-url.up.railway.app/api';
```

Make sure `config.js` is loaded before any other script tag on every page, e.g.:

```html
<head>
  <script src="config.js"></script>
  <!-- other scripts -->
</head>
```

## Key Pages

| Page | Purpose |
| --- | --- |
| index.html | Product dashboard with categories & featured products |
| vendors.html / vendor.html | Vendor directory & individual storefronts |
| cart.html | View and update cart contents |
| choosedelivery.html | Pick RankDrop pickup or home delivery |
| checkout.html | Enter delivery details & pay via PayFast |
| confirmation.html | Order confirmation after successful payment |
| track-order.html | Track an order's delivery status |
| vendor-dashboard.html | Vendor's product, order & profile management |
| subscription.html | Vendor subscription plan selection |

## Deployment

This site is deployed on [Render](https://render.com) as a static site.

Live site: `https://module-3-core-project-e-commerce.onrender.com`

To deploy your own copy:
1. Connect the repository to Render as a Static Site.
2. Leave the Build Command empty (no build step required).
3. Set the Publish Directory to `.`
4. Ensure `config.js` points to your deployed backend's public URL.

## License

This project was built as part of a training module and is intended for educational purposes.
