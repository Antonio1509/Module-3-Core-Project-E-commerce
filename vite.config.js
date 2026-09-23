import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	server: {
		port: 5173,
		proxy: {
			'/api/': {
				target: 'https://module-3-core-project-e-commerce-backend-production.up.railway.app',
				changeOrigin: true,
				secure: true,
			},
		},
	},
});
