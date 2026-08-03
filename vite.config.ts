import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ GitHub Pages 배포용 서브패스(base) 설정.
// - `GITHUB_PAGES=true npm run build` (또는 `npm run build:demo`)일 때만
//   `/cmf-library/` 서브패스를 사용하고, 그 외(로컬 개발/Firebase Hosting)는 루트('/')를 사용한다.
const base = process.env.GITHUB_PAGES === 'true' ? '/cmf-library/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: [
            'firebase/app',
            'firebase/firestore',
            'firebase/storage',
            'firebase/analytics',
          ],
        },
      },
    },
  },
});
