const alertApi = window.Sweetalert2;

export async function showAlert(options) {
  if (!alertApi?.fire) {
    console.error('SweetAlert2 is not loaded.', options);
    return { isConfirmed: false };
  }
  return alertApi.fire({ confirmButtonColor: '#2d6a4f', ...options });
}

export function showError(error, title = 'Something went wrong') {
  return showAlert({ icon: 'error', title, text: error?.message || String(error || 'Please try again.') });
}

