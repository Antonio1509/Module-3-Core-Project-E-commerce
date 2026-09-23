<script setup>
import { ref } from 'vue';
import { apiFetch, productImageUrl, getAuthToken, money } from '../../app/services/api';
import { showError } from '../../app/services/alerts';
const props = defineProps({ product: { type: Object, required: true } }); const added = ref(false);
const image = productImageUrl(props.product);
async function add() { if (!getAuthToken()) { window.location.href = 'index.html?view=login'; return; } try { await apiFetch('/cart/add', { method: 'POST', body: JSON.stringify({ product_id: Number(props.product.id || props.product.product_id), quantity: 1 }) }); added.value = true; } catch (error) { await showError(error); } }
</script>
<template><article class="product-card" :data-product-id="product.id || product.product_id"><div class="product-photo"><img v-if="image" :src="image" :alt="product.name || 'Product'" /></div><div class="product-info"><span class="category-pill">{{ product.category || '' }}</span><div class="product-vendor">{{ product.vendor_name || product.vendor?.name || '' }}</div><div class="product-name">{{ product.name }}</div><div class="product-price">{{ money(product.price) }}</div><button class="btn-add-cart" type="button" :disabled="added" @click.stop="add">{{ added ? 'Added' : 'Add to cart' }}</button></div></article></template>
