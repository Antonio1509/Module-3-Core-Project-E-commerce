<script setup>
import Header from '../components/Header.vue';

const emit = defineEmits(['navigate']);
defineProps({ rawPage: { type: Boolean, default: false } });
</script>

<template>
  <template v-if="!rawPage"><Header @navigate="emit('navigate', $event)" /><main><slot /></main></template>
  <slot v-else />
</template>
