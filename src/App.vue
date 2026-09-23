<script setup>
import { computed, onMounted, ref } from 'vue';
import MainLayout from './app/layouts/MainLayout.vue';
import { resolveView } from './app/router';
import LegacyPages from './app/views/LegacyPages.vue';

const path = ref(window.location.pathname);
const query = new URLSearchParams(window.location.search);
const currentView = computed(() => resolveView(path.value, query));
onMounted(() => { document.documentElement.dataset.theme = localStorage.getItem('localcart-theme') || localStorage.getItem('theme') || 'light'; });
function navigate(url) { window.location.href = url; }
</script>
<template><MainLayout :raw-page="currentView === LegacyPages" @navigate="navigate"><component :is="currentView" :vendor-id="query.get('id')" /></MainLayout></template>
