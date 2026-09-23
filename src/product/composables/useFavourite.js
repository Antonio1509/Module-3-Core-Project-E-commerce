import { ref } from 'vue';
import { apiFetch, getAuthToken } from '../../app/services/api';

export function useFavourite(vendorId) {
  const following = ref(false);

  async function toggle() {
    if (!getAuthToken()) {
      window.location.href = 'index.html?view=login';
      return;
    }
    await apiFetch(`/users/following/${encodeURIComponent(vendorId)}`, {
      method: following.value ? 'DELETE' : 'POST',
    });
    following.value = !following.value;
  }

  return { following, toggle };
}