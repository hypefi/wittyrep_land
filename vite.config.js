import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        '404': resolve(__dirname, '404.html'),
        ar: resolve(__dirname, 'ar.html'),
        fr: resolve(__dirname, 'fr.html'),
        'ar/index': resolve(__dirname, 'ar/index.html'),
        'fr/index': resolve(__dirname, 'fr/index.html'),
        'blog-post-2025-06-25': resolve(__dirname, 'posts/blog_post_2025-06-25.html'),
        'blog-whatsapp-automation-smb': resolve(__dirname, 'posts/blog-whatsapp-automation-smb.html'),
        'blog-cost-manual-whatsapp-management': resolve(__dirname, 'posts/blog-cost-manual-whatsapp-management.html'),
        'blog-real-estate-whatsapp-automation': resolve(__dirname, 'posts/blog-real-estate-whatsapp-automation.html'),
        'blog-whatsapp-lead-generation-sequences': resolve(__dirname, 'posts/blog-whatsapp-lead-generation-sequences.html')
      }
    }
  }
}) 