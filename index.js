document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = nextTheme;
      localStorage.setItem('localcart-theme', nextTheme);
    });
  }

  const browseButton = document.getElementById('browse-products');
  const productsSection = document.getElementById('products-grid');
  browseButton?.addEventListener('click', () => productsSection?.scrollIntoView({ behavior: 'smooth' }));

});
