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
        'blog-post-2025-06-25': resolve(__dirname, 'posts/blog_post_2025-06-25.html'),
        'blog-whatsapp-automation-smb': resolve(__dirname, 'posts/blog-whatsapp-automation-smb.html')
      }
    }
  }
}) 