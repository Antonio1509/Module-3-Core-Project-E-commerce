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
  "Home & Decor",
  "Food Truck"
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
    shipping: "Local delivery & collection",
    following: ["v3", "v6"],
    followers: ["v2", "v3", "v4", "v6", "v8"]
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
    shipping: "Courier, 2-4 working days",
    following: ["v1", "v5"],
    followers: ["v5"]
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
    shipping: "Courier, 1-3 working days",
    following: ["v1", "v6"],
    followers: ["v1", "v4"]
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
    shipping: "Courier, 2-5 working days",
    following: ["v1", "v3", "v5"],
    followers: ["v7"]
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
    shipping: "Courier, 3-6 working days (fragile, extra care packing)",
    following: ["v2"],
    followers: ["v2", "v4"]
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
    shipping: "Courier, 3-5 working days",
    following: ["v1"],
    followers: ["v1", "v3", "v7"]
  },
  {
    id: "v7",
    name: "Shisa Nyama Wheels",
    category: "Food Truck",
    location: "Johannesburg, GP",
    cover: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=60",
    logoText: "SW",
    rating: 4.8,
    reviewCount: 176,
    joined: "Sep 2023",
    description: "Fire-grilled shisa nyama, wors rolls and pap served hot from our converted Isuzu truck.",
    about: "Shisa Nyama Wheels brings the Sunday braai to street corners, markets and office parks across Joburg. We fire up the grill fresh at every stop — nothing sits under a heat lamp. Our spice blends are made in-house and we always keep a vegetarian grilled option on the menu.",
    responseTime: "Usually replies within an hour",
    deliveryArea: "Johannesburg & Pretoria (event bookings)",
    shipping: "Collection at truck location only",
    following: ["v8", "v9"],
    followers: ["v4", "v8", "v9"]
  },
  {
    id: "v8",
    name: "Durban Bunny Bus",
    category: "Food Truck",
    location: "Durban, KZN",
    cover: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=60",
    logoText: "DB",
    rating: 4.9,
    reviewCount: 243,
    joined: "Jun 2022",
    description: "Durban-style bunny chow — mutton, chicken and bean curries in a hollowed loaf, made fresh daily.",
    about: "The Durban Bunny Bus has been a fixture at the beachfront and local markets for three years, slow-cooking curries the same way our grandmothers did. Quarter, half and full loaf sizes available, and our bean bunny is a firm vegan favourite.",
    responseTime: "Usually replies within 2 hours",
    deliveryArea: "Durban Metro (event bookings & scheduled stops)",
    shipping: "Collection at truck location only",
    following: ["v1", "v7"],
    followers: ["v1", "v7", "v9"]
  },
  {
    id: "v9",
    name: "Cape Malay Kitchen on Wheels",
    category: "Food Truck",
    location: "Cape Town, WC",
    cover: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=60",
    logoText: "CM",
    rating: 4.7,
    reviewCount: 98,
    joined: "Apr 2024",
    description: "Cape Malay curries, koeksisters and samoosas from a family recipe book, dished up street-side in the Bo-Kaap.",
    about: "Cape Malay Kitchen on Wheels is run by a mother-and-son team sharing recipes passed down four generations. Every curry is slow-simmered that morning and our koeksisters are rolled and fried fresh — we regularly sell out by early afternoon, so we recommend pre-ordering for groups.",
    responseTime: "Usually replies within 3 hours",
    deliveryArea: "Cape Town CBD & Bo-Kaap (event bookings)",
    shipping: "Collection at truck location only",
    following: ["v7"],
    followers: ["v7", "v8"]
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
  { id: "p20", vendorId: "v6", name: "Farm Preserve Hamper", price: 310, unit: "hamper", image: "https://images.unsplash.com/photo-1488477304112-4944851de03d?w=500&q=60", stock: 7 },

  // Shisa Nyama Wheels (v7)
  { id: "p21", vendorId: "v7", name: "Mixed Grill Platter", price: 150, unit: "each", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=60", stock: 25 },
  { id: "p22", vendorId: "v7", name: "Boerewors Roll", price: 55, unit: "each", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=60", stock: 40 },
  { id: "p23", vendorId: "v7", name: "Pap, Chakalaka & Grilled Chicken", price: 95, unit: "each", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=60", stock: 18 },
  { id: "p24", vendorId: "v7", name: "Grilled Halloumi & Veg Skewer", price: 75, unit: "each", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=60", stock: 12 },

  // Durban Bunny Bus (v8)
  { id: "p25", vendorId: "v8", name: "Quarter Mutton Bunny", price: 90, unit: "each", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=60", stock: 20 },
  { id: "p26", vendorId: "v8", name: "Half Chicken Bunny", price: 130, unit: "each", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=60", stock: 15 },
  { id: "p27", vendorId: "v8", name: "Bean Bunny (Vegan)", price: 70, unit: "each", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=60", stock: 22 },
  { id: "p28", vendorId: "v8", name: "Full Loaf Sharer Bunny", price: 220, unit: "each", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=60", stock: 6 },

  // Cape Malay Kitchen on Wheels (v9)
  { id: "p29", vendorId: "v9", name: "Cape Malay Chicken Curry & Roti", price: 110, unit: "each", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=60", stock: 16 },
  { id: "p30", vendorId: "v9", name: "Koeksisters (6-pack)", price: 60, unit: "pack", image: "https://images.unsplash.com/photo-1541599468348-e96984315921?w=500&q=60", stock: 28 },
  { id: "p31", vendorId: "v9", name: "Beef Samoosas (4-pack)", price: 50, unit: "pack", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=60", stock: 24 }
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

// Returns the full vendor objects a vendor follows (not just their ids)
function getFollowing(vendorId) {
  const vendor = getVendorById(vendorId);
  if (!vendor) return [];
  return vendor.following.map(id => getVendorById(id)).filter(Boolean);
}

// Returns the full vendor objects who follow this vendor
function getFollowers(vendorId) {
  const vendor = getVendorById(vendorId);
  if (!vendor) return [];
  return vendor.followers.map(id => getVendorById(id)).filter(Boolean);
}

/* =========================================================
   Shoppers (site users) — separate from the vendor-to-vendor
   network above. A "user" is a logged-in customer who can
   follow vendor storefronts and edit their own profile.
   ========================================================= */

const USERS = [
  {
    id: "u1",
    name: "Thabo Mokoena",
    email: "thabo@example.com",
    location: "Durban, KZN",
    joined: "Jan 2025",
    bio: "Foodie, craft-market regular, always hunting for local finds.",
    avatarInitials: "TM",
    followingVendors: ["v1", "v3", "v7", "v8"]
  },
  {
    id: "u2",
    name: "Aisha Adams",
    email: "aisha@example.com",
    location: "Cape Town, WC",
    joined: "Mar 2025",
    bio: "Skincare enthusiast and weekend market regular.",
    avatarInitials: "AA",
    followingVendors: ["v2", "v3", "v9"]
  },
  {
    id: "u3",
    name: "Sipho Nkosi",
    email: "sipho@example.com",
    location: "Johannesburg, GP",
    joined: "Jun 2024",
    bio: "Street food connoisseur, never misses a food truck weekend.",
    avatarInitials: "SN",
    followingVendors: ["v4", "v7"]
  }
];

// The demo "logged-in" shopper. In a real build this would come
// from the JWT/session after login, not a hardcoded constant.
const CURRENT_USER_ID = "u1";

const FOLLOW_STATE_KEY = "localcart-user-follows";
const PROFILE_OVERRIDE_KEY_PREFIX = "localcart-user-profile-";

// Follow relationships are seeded from USERS on first load, then
// persisted in localStorage so toggling Follow survives a refresh.
function loadFollowState() {
  const raw = localStorage.getItem(FOLLOW_STATE_KEY);
  if (raw) return JSON.parse(raw);

  const seeded = {};
  USERS.forEach(u => { seeded[u.id] = [...u.followingVendors]; });
  localStorage.setItem(FOLLOW_STATE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveFollowState(state) {
  localStorage.setItem(FOLLOW_STATE_KEY, JSON.stringify(state));
}

function getUserById(id) {
  return USERS.find(u => u.id === id) || null;
}

// Merges the mock user with any profile edits saved to localStorage
function getCurrentUser() {
  const base = getUserById(CURRENT_USER_ID);
  if (!base) return null;
  const overrideRaw = localStorage.getItem(PROFILE_OVERRIDE_KEY_PREFIX + CURRENT_USER_ID);
  const overrides = overrideRaw ? JSON.parse(overrideRaw) : {};
  return { ...base, ...overrides };
}

function saveCurrentUserProfile(updates) {
  localStorage.setItem(PROFILE_OVERRIDE_KEY_PREFIX + CURRENT_USER_ID, JSON.stringify(updates));
}

function isFollowingVendor(userId, vendorId) {
  const state = loadFollowState();
  return (state[userId] || []).includes(vendorId);
}

// Toggles follow status for a user/vendor pair and returns the new state
function toggleFollowVendor(userId, vendorId) {
  const state = loadFollowState();
  const list = state[userId] || (state[userId] = []);
  const index = list.indexOf(vendorId);
  let nowFollowing;

  if (index >= 0) {
    list.splice(index, 1);
    nowFollowing = false;
  } else {
    list.push(vendorId);
    nowFollowing = true;
  }

  saveFollowState(state);
  return nowFollowing;
}

// Full vendor objects a given user follows (used on the profile page)
function getUserFollowingVendors(userId) {
  const state = loadFollowState();
  return (state[userId] || []).map(id => getVendorById(id)).filter(Boolean);
}

// How many shoppers follow a given vendor (used on the storefront)
function getVendorFollowerUserCount(vendorId) {
  const state = loadFollowState();
  return Object.values(state).filter(list => list.includes(vendorId)).length;
}

function formatPrice(amount) {
  return "R" + amount.toLocaleString("en-ZA");
}