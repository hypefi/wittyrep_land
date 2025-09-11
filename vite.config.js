import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'
import { join } from 'path'

// Dynamically get all blog posts
function getBlogPosts() {
  const postsDir = join(__dirname, 'posts')
  const blogPosts = {}
  
  try {
    const files = readdirSync(postsDir)
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const name = file.replace('.html', '')
        blogPosts[name] = resolve(__dirname, `posts/${file}`)
      }
    })
  } catch (error) {
    console.warn('Could not read posts directory:', error.message)
  }
  
  return blogPosts
}

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
        'privacy-policy': resolve(__dirname, 'privacy-policy.html'),
        'terms-of-service': resolve(__dirname, 'terms-of-service.html'),
        // Dynamically include all blog posts
        ...getBlogPosts()
      }
    }
  }
}) 