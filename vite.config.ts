import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split mermaid into its own lazy chunk — it's ~2MB and only needed on DocsViewer
          mermaid: ['mermaid'],
          // Split react-markdown separately
          markdown: ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Exclude mermaid from test transforms — it's ESM-only and tested via integration
    server: {
      deps: {
        inline: ['@testing-library/user-event'],
      },
    },
  },
});
