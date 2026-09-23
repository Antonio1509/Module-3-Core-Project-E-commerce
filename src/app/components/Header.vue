<script setup>
import { computed, onMounted, ref } from 'vue';
import { apiFetch, getAuthToken, getStoredUser } from '../services/api';
const emit = defineEmits(['navigate']); const user = ref(getStoredUser()); const open = ref(false);
const isVendor = computed(() => Boolean(user.value?.vendor_id || user.value?.is_vendor || user.value?.role === 'vendor'));
const initials = computed(() => user.value?.avatar_initials || (user.value?.name || '').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'GU');
onMounted(async () => { if (!getAuthToken()) return; try { user.value = (await apiFetch('/auth/me')) || user.value; } catch { /* cached session is enough */ } });
function toggleTheme() { const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = next; localStorage.setItem('localcart-theme', next); }
function logout() { ['token', 'user', 'localcart-token', 'localcart-user'].forEach((key) => localStorage.removeItem(key)); emit('navigate', 'index.html?view=login'); }
</script>
<template>
  <header><a class="logo" href="index.html" @click.prevent="emit('navigate', 'index.html')"><span class="logo-mark"><img src="https://i.ibb.co/LWW04LT/logo.png" alt="LocalCart" width="20" height="20" /></span>LocalCart</a><nav><a href="index.html" @click.prevent="emit('navigate', 'index.html')">Dashboard</a><a href="index.html?view=vendors" @click.prevent="emit('navigate', 'index.html?view=vendors')">Vendors</a><a href="index.html?view=legacy&page=about">About</a><a href="index.html?view=legacy&page=contact">Contact</a><a v-if="isVendor" href="index.html?view=legacy&page=vendor-dashboard">Vendor workspace</a></nav><div class="header-right"><button class="icon-btn" type="button" aria-label="Toggle theme" @click="toggleTheme">◐</button><a class="icon-btn" href="index.html?view=cart" aria-label="Cart">🛒</a><div class="profile-dropdown-wrap"><button class="profile-toggle" type="button" aria-label="Open profile menu" @click="open = !open"><div class="avatar">{{ initials }}</div></button><div v-if="open" class="profile-dropdown open"><div class="profile-dropdown-header"><div class="avatar">{{ initials }}</div><div><strong>{{ user?.name || '' }}</strong><span>{{ user?.email || '' }}</span></div></div><div class="profile-dropdown-links"><a href="index.html?view=legacy&page=users">My Profile</a><a href="index.html?view=cart">My Orders</a><div class="divider"></div><button class="logout-link" type="button" @click="logout">Log out</button></div></div></div></div></header>
</template>
