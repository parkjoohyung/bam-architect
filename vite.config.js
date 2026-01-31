import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/bam-architect/' : '/', // Use repo name for build, root for dev
  appType: 'mpa', // Disable SPA fallback to index.html
  server: {
    host: true, // Listen on all local IPs
    proxy: {
      // Google Gemini / Imagen 3 API
      '/api/google': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google/, ''),
        secure: true
      },
      // Hugging Face API (Flux, Qwen, etc.)
      '/api/huggingface': {
        target: 'https://api-inference.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/huggingface/, ''),
        secure: true
      },
      // AI Horde API
      '/api/horde': {
        target: 'https://stablehorde.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/horde/, ''),
        secure: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        about: resolve(process.cwd(), 'about.html'),
        projects: resolve(process.cwd(), 'projects.html'),
        blog: resolve(process.cwd(), 'blog.html'),
        news: resolve(process.cwd(), 'news.html'),
        law: resolve(process.cwd(), 'law.html'),
        blogPost: resolve(process.cwd(), 'blog-post.html'),
        contact: resolve(process.cwd(), 'contact.html'),
        aiStudio: resolve(process.cwd(), 'ai-studio.html'),
      },
    },
  }
}));
