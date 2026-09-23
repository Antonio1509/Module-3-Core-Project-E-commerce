import { ref } from 'vue';
import { apiFetch, listFrom } from '../../app/services/api';

export function useProductCatalog() {
  const products = ref([]);
  const loading = ref(false);

  async function loadProducts(query = {}) {
    loading.value = true;
    try {
      const params = new URLSearchParams(query);
      products.value = listFrom(await apiFetch(`/products?${params}`), ['products']);
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, loadProducts };
}