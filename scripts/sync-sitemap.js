#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  baseUrl: 'https://wittyrep.com',
  postsDir: path.join(__dirname, '../posts'),
  sitemapPath: path.join(__dirname, '../sitemap.xml'),
  publicSitemapPath: path.join(__dirname, '../public/sitemap.xml'),
  blogPostPriority: '0.6',
  blogPostChangefreq: 'monthly'
};

/**
 * Get the modification date of a file in YYYY-MM-DD format
 */
function getFileModDate(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0];
  } catch (error) {
    console.warn(`Warning: Could not get modification date for ${filePath}`);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Extract date from filename if it follows the pattern YYYY-MM-DD
 */
function extractDateFromFilename(filename) {
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : null;
}

/**
 * Get all blog post files from the posts directory
 */
function getBlogPosts() {
  try {
    const files = fs.readdirSync(CONFIG.postsDir);
    return files
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const filePath = path.join(CONFIG.postsDir, file);
        const fileModDate = getFileModDate(filePath);
        const filenameDate = extractDateFromFilename(file);
        
        return {
          filename: file,
          url: `${CONFIG.baseUrl}/posts/${file}`,
          lastmod: filenameDate || fileModDate,
          changefreq: CONFIG.blogPostChangefreq,
          priority: CONFIG.blogPostPriority
        };
      })
      .sort((a, b) => new Date(b.lastmod) - new Date(a.lastmod)); // Sort by date, newest first
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}

/**
 * Generate the complete sitemap XML content
 */
function generateSitemapXML(blogPosts) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Homepage -->
  <url>
    <loc>${CONFIG.baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Language versions -->
  <url>
    <loc>${CONFIG.baseUrl}/ar.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${CONFIG.baseUrl}/fr.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Blog listing page -->
  <url>
    <loc>${CONFIG.baseUrl}/blog.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Legal pages -->
  <url>
    <loc>${CONFIG.baseUrl}/privacy-policy.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${CONFIG.baseUrl}/terms-of-service.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Blog Posts -->`;

  // Add all blog posts
  blogPosts.forEach(post => {
    xml += `
  <url>
    <loc>${post.url}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
  </url>`;
  });

  xml += `

</urlset>`;

  return xml;
}

/**
 * Write sitemap to both locations
 */
function writeSitemap(xmlContent) {
  try {
    // Write to root sitemap
    fs.writeFileSync(CONFIG.sitemapPath, xmlContent, 'utf8');
    console.log(`✓ Updated sitemap: ${CONFIG.sitemapPath}`);
    
    // Write to public sitemap
    fs.writeFileSync(CONFIG.publicSitemapPath, xmlContent, 'utf8');
    console.log(`✓ Updated sitemap: ${CONFIG.publicSitemapPath}`);
    
    return true;
  } catch (error) {
    console.error('Error writing sitemap files:', error);
    return false;
  }
}

/**
 * Main synchronization function
 */
function syncSitemap() {
  console.log('🔄 Starting sitemap synchronization...');
  console.log(`📁 Scanning posts directory: ${CONFIG.postsDir}`);
  
  // Get all blog posts
  const blogPosts = getBlogPosts();
  console.log(`📝 Found ${blogPosts.length} blog posts`);
  
  if (blogPosts.length === 0) {
    console.warn('⚠️  No blog posts found. Sitemap will only contain static pages.');
  } else {
    console.log('📋 Blog posts found:');
    blogPosts.forEach(post => {
      console.log(`   - ${post.filename} (${post.lastmod})`);
    });
  }
  
  // Generate sitemap XML
  const xmlContent = generateSitemapXML(blogPosts);
  
  // Write sitemap files
  const success = writeSitemap(xmlContent);
  
  if (success) {
    console.log('✅ Sitemap synchronization completed successfully!');
    console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);
    console.log(`📊 Total URLs in sitemap: ${6 + blogPosts.length} (6 static pages + ${blogPosts.length} blog posts)`);
  } else {
    console.error('❌ Sitemap synchronization failed!');
    process.exit(1);
  }
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Sitemap Synchronization Script
==============================

This script synchronizes all blog posts from the posts/ directory to sitemap.xml

Usage:
  node sync-sitemap.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be updated without making changes
  --verbose      Show detailed output

Configuration:
  Base URL: ${CONFIG.baseUrl}
  Posts directory: ${CONFIG.postsDir}
  Sitemap files: 
    - ${CONFIG.sitemapPath}
    - ${CONFIG.publicSitemapPath}
`);
    return;
  }
  
  if (args.includes('--dry-run')) {
    console.log('🧪 DRY RUN MODE - No files will be modified');
    const blogPosts = getBlogPosts();
    console.log(`📝 Would add ${blogPosts.length} blog posts to sitemap:`);
    blogPosts.forEach(post => {
      console.log(`   - ${post.url} (${post.lastmod})`);
    });
    console.log(`📊 Total URLs would be: ${6 + blogPosts.length}`);
    return;
  }
  
  // Run the synchronization
  syncSitemap();
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  syncSitemap,
  getBlogPosts,
  generateSitemapXML,
  CONFIG
};
