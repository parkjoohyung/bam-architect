import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/bam-architect/' : '/', // Use repo name for build, root for dev
  appType: 'mpa', // Disable SPA fallback to index.html
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
      },
    },
  }
}));
