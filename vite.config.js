import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Changed to root for custom domain (www.bam-architects.com)
  build: {
    outDir: 'dist',
  }
});
