/* =========================================================
   LocalCart — data.js
   Temporary mock data layer. Each vendor/product object mirrors
   the shape the real back end (SQL/Node.js API) should return,
   so swapping getVendors()/getProducts() for a fetch() call
   later requires no changes in vendors.js or vendor.js.
   ========================================================= */

const VENDOR_CATEGORIES = [
  "All",
  "Bakery",
  "Crafts",
  "Skincare",
  "Clothing",
  "Home & Decor"
];

const VENDORS = [
  {
    id: "v1",
    name: "Thandi's Kitchen",
    category: "Bakery",
    location: "Durban, KZN",
    cover: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=60",
    logoText: "TK",
    rating: 4.9,
    reviewCount: 132,
    joined: "Mar 2024",
    description: "Small-batch sourdough, amagwinya and celebration cakes baked fresh every morning in Umbilo.",
    about: "Thandi's Kitchen started as a Saturday market stall in 2021 and has grown into a full home bakery serving the greater Durban area. Every loaf is proofed for 18 hours and every cake is made to order, so please allow 24 hours' notice for custom pieces. We use locally milled flour and free-range eggs from a farm in Kloof.",
    responseTime: "Usually replies within 2 hours",
    deliveryArea: "Durban Metro",
    shipping: "Local delivery & collection"
  },
  {
    id: "v2",
    name: "Kwela Crafts",
    category: "Crafts",
    location: "Cape Town, WC",
    cover: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=60",
    logoText: "KC",
    rating: 4.8,
    reviewCount: 87,
    joined: "Jan 2023",
    description: "Handwoven baskets and beadwork made by a collective of artisans in Khayelitsha.",
    about: "Kwela Crafts is a collective of eight artisans creating hand-woven telephone-wire baskets, beadwork and coiled grass bowls using techniques passed down through generations. Every purchase directly supports the maker's household — we split proceeds transparently and publish our impact numbers quarterly.",
    responseTime: "Usually replies within a day",
    deliveryArea: "Nationwide (courier)",
    shipping: "Courier, 2-4 working days"
  },
  {
    id: "v3",
    name: "Karoo Botanicals",
    category: "Skincare",
    location: "Oudtshoorn, WC",
    cover: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=60",
    logoText: "KB",
    rating: 4.7,
    reviewCount: 210,
    joined: "Aug 2022",
    description: "Cold-pressed skincare made with indigenous Karoo botanicals — no parabens, no fuss.",
    about: "We formulate every product in small batches using cold-press extraction from plants grown on our own smallholding — buchu, rooibos and kalahari melon oil are our signature ingredients. All packaging is glass or recyclable, and we're proudly certified cruelty-free.",
    responseTime: "Usually replies within 3 hours",
    deliveryArea: "Nationwide",
    shipping: "Courier, 1-3 working days"
  },
  {
    id: "v4",
    name: "Mzansi Threads",
    category: "Clothing",
    location: "Johannesburg, GP",
    cover: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=60",
    logoText: "MT",
    rating: 4.6,
    reviewCount: 64,
    joined: "Nov 2024",
    description: "Contemporary streetwear cut and sewn in Maboneng using shweshwe and mudcloth prints.",
    about: "Mzansi Threads reworks traditional shweshwe and mudcloth textiles into modern streetwear silhouettes. Each drop is limited to under 40 pieces per design, cut and finished in our small Maboneng studio by a team of four.",
    responseTime: "Usually replies within a day",
    deliveryArea: "Nationwide",
    shipping: "Courier, 2-5 working days"
  },
  {
    id: "v5",
    name: "Bushveld Ceramics",
    category: "Home & Decor",
    location: "Hoedspruit, LP",
    cover: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&q=60",
    logoText: "BC",
    rating: 4.9,
    reviewCount: 41,
    joined: "May 2025",
    description: "Wood-fired stoneware — mugs, bowls and vases thrown and glazed by hand in the Lowveld.",
    about: "Every piece is thrown on the wheel, wood-fired in a homemade kiln, and glazed with ash from the same fire — which means no two pieces are ever identical. We keep batches small so we can guarantee quality on each item.",
    responseTime: "Usually replies within 2 days",
    deliveryArea: "Nationwide",
    shipping: "Courier, 3-6 working days (fragile, extra care packing)"
  },
  {
    id: "v6",
    name: "Little Karoo Preserves",
    category: "Bakery",
    location: "Barrydale, WC",
    cover: "https://images.unsplash.com/photo-1488477304112-4944851de03d?w=800&q=60",
    logoText: "LP",
    rating: 4.8,
    reviewCount: 58,
    joined: "Feb 2024",
    description: "Farm-stall jams, rusks and preserves made with fruit from our own orchard.",
    about: "We've been making preserves the same way for three generations — small copper pots, real fruit, and no shortcuts. Our rusks are buttermilk-based and slow-dried overnight for the perfect dunk.",
    responseTime: "Usually replies within a day",
    deliveryArea: "Western Cape + nationwide courier",
    shipping: "Courier, 3-5 working days"
  }
];

const PRODUCTS = [
  // Thandi's Kitchen (v1)
  { id: "p1", vendorId: "v1", name: "Farmhouse Sourdough Loaf", price: 65, unit: "each", image: "https://images.unsplash.com/photo-1585478259715-4d3a5f4d3a3f?w=500&q=60", stock: 12 },
  { id: "p2", vendorId: "v1", name: "Amagwinya (6-pack)", price: 45, unit: "pack", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=60", stock: 20 },
  { id: "p3", vendorId: "v1", name: "Malva Pudding Cake", price: 180, unit: "whole cake", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=60", stock: 4 },
  { id: "p4", vendorId: "v1", name: "Custom Celebration Cake", price: 450, unit: "from", image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&q=60", stock: 3 },

  // Kwela Crafts (v2)
  { id: "p5", vendorId: "v2", name: "Telephone-Wire Basket, Large", price: 620, unit: "each", image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=60", stock: 6 },
  { id: "p6", vendorId: "v2", name: "Beaded Coaster Set (4)", price: 210, unit: "set", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=60", stock: 15 },
  { id: "p7", vendorId: "v2", name: "Coiled Grass Bowl", price: 340, unit: "each", image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=500&q=60", stock: 2 },

  // Karoo Botanicals (v3)
  { id: "p8", vendorId: "v3", name: "Buchu & Rooibos Face Serum", price: 285, unit: "30ml", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=60", stock: 18 },
  { id: "p9", vendorId: "v3", name: "Kalahari Melon Body Oil", price: 220, unit: "100ml", image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500&q=60", stock: 25 },
  { id: "p10", vendorId: "v3", name: "Rooibos Clay Mask", price: 165, unit: "80g", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=60", stock: 0 },
  { id: "p11", vendorId: "v3", name: "Gift Set — Full Ritual", price: 590, unit: "box", image: "https://images.unsplash.com/photo-1591019479261-1a5f0f0c0b1c?w=500&q=60", stock: 9 },

  // Mzansi Threads (v4)
  { id: "p12", vendorId: "v4", name: "Shweshwe Panel Bomber", price: 950, unit: "each", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=60", stock: 5 },
  { id: "p13", vendorId: "v4", name: "Mudcloth Print Cap", price: 260, unit: "each", image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&q=60", stock: 14 },
  { id: "p14", vendorId: "v4", name: "Reworked Denim Jacket", price: 720, unit: "each", image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&q=60", stock: 3 },

  // Bushveld Ceramics (v5)
  { id: "p15", vendorId: "v5", name: "Ash-Glazed Stoneware Mug", price: 195, unit: "each", image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&q=60", stock: 11 },
  { id: "p16", vendorId: "v5", name: "Wood-Fired Serving Bowl", price: 380, unit: "each", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&q=60", stock: 6 },
  { id: "p17", vendorId: "v5", name: "Table Vase, Medium", price: 310, unit: "each", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500&q=60", stock: 1 },

  // Little Karoo Preserves (v6)
  { id: "p18", vendorId: "v6", name: "Fig & Ginger Preserve", price: 85, unit: "jar", image: "https://images.unsplash.com/photo-1600250395178-3e18ba7d6e17?w=500&q=60", stock: 22 },
  { id: "p19", vendorId: "v6", name: "Buttermilk Rusks", price: 70, unit: "bag", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=60", stock: 30 },
  { id: "p20", vendorId: "v6", name: "Farm Preserve Hamper", price: 310, unit: "hamper", image: "https://images.unsplash.com/photo-1488477304112-4944851de03d?w=500&q=60", stock: 7 }
];

/* ---------- Data access helpers (replace bodies with fetch() calls later) ---------- */

function getVendors({ category = "All", search = "" } = {}) {
  return VENDORS.filter(v => {
    const matchesCategory = category === "All" || v.category === category;
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                           v.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function getVendorById(id) {
  return VENDORS.find(v => v.id === id) || null;
}

function getProductsByVendor(vendorId) {
  return PRODUCTS.filter(p => p.vendorId === vendorId);
}

function formatPrice(amount) {
  return "R" + amount.toLocaleString("en-ZA");
}