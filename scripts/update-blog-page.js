#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogPageUpdater {
  constructor() {
    this.blogPagePath = path.join(__dirname, '../blog.html');
    this.postsDir = path.join(__dirname, '../posts');
    this.newArticles = [];
  }

  getNewArticles() {
    const files = fs.readdirSync(this.postsDir);
    const newFiles = files.filter(file => 
      file.includes('2025-09-13') && file.endsWith('.html')
    );

    console.log(`📝 Found ${newFiles.length} new articles to add`);

    return newFiles.map(filename => {
      const filepath = path.join(this.postsDir, filename);
      const content = fs.readFileSync(filepath, 'utf8');
      
      // Extract title and description from HTML
      const titleMatch = content.match(/<title>(.*?) - WittyReply Blog<\/title>/);
      const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
      
      const title = titleMatch ? titleMatch[1] : filename.replace('.html', '').replace(/-/g, ' ');
      const description = descMatch ? descMatch[1] : 'Comprehensive guide to WhatsApp automation for modern businesses.';
      
      // Extract keyword/category from filename
      const keyword = this.extractKeywordFromFilename(filename);
      const category = this.getCategoryFromKeyword(keyword);
      const categoryColor = this.getCategoryColor(category);
      
      return {
        filename,
        title,
        description,
        keyword,
        category,
        categoryColor,
        date: 'September 2025',
        readTime: this.estimateReadTime(description)
      };
    }).sort((a, b) => a.title.localeCompare(b.title));
  }

  extractKeywordFromFilename(filename) {
    // Extract the main part between 'blog-' and '-2025-09-13.html'
    const match = filename.match(/blog-(.+)-2025-09-13\.html/);
    return match ? match[1].replace(/-/g, ' ') : 'automation';
  }

  getCategoryFromKeyword(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword.includes('ai')) return 'AI Tools';
    if (lowerKeyword.includes('marketing')) return 'Marketing';
    if (lowerKeyword.includes('software')) return 'Software';
    if (lowerKeyword.includes('business')) return 'Business';
    if (lowerKeyword.includes('automation')) return 'Automation';
    if (lowerKeyword.includes('tools')) return 'Tools';
    return 'WhatsApp';
  }

  getCategoryColor(category) {
    const colors = {
      'AI Tools': 'bg-purple-500/20 text-purple-400',
      'Marketing': 'bg-pink-500/20 text-pink-400',
      'Software': 'bg-blue-500/20 text-blue-400',
      'Business': 'bg-green-500/20 text-green-400',
      'Automation': 'bg-orange-500/20 text-orange-400',
      'Tools': 'bg-teal-500/20 text-teal-400',
      'WhatsApp': 'bg-green-500/20 text-green-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  }

  estimateReadTime(description) {
    // Estimate based on description length and typical article size
    const baseWords = 2000; // Our articles are around 2000 words
    const readingSpeed = 200; // words per minute
    return Math.ceil(baseWords / readingSpeed);
  }

  generateTags(keyword) {
    const words = keyword.split(' ');
    const tags = [];
    
    // Add main category tags
    if (keyword.includes('ai')) tags.push('AI');
    if (keyword.includes('automation')) tags.push('Automation');
    if (keyword.includes('software')) tags.push('Software');
    if (keyword.includes('business')) tags.push('Business');
    if (keyword.includes('marketing')) tags.push('Marketing');
    if (keyword.includes('tools')) tags.push('Tools');
    
    // Ensure we have at least 2 tags
    if (tags.length < 2) {
      tags.push('WhatsApp');
    }
    if (tags.length < 2) {
      tags.push('Guide');
    }
    
    return tags.slice(0, 3); // Max 3 tags
  }

  generateArticleHTML(article) {
    const tags = this.generateTags(article.keyword);
    
    return `          <article class="card">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <span class="${article.categoryColor} px-3 py-1 rounded-full text-sm font-medium">${article.category}</span>
                <span class="text-gray-400 text-sm">${article.date}</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 leading-tight">
                <a href="posts/${article.filename}" class="text-white hover:text-primary-400 transition-colors">
                  ${article.title}
                </a>
              </h3>
              <p class="text-gray-300 mb-4">
                ${article.description}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-400">📖 ${article.readTime} min read</span>
                  <div class="flex space-x-2">
                    ${tags.map(tag => `<span class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">${tag}</span>`).join('\n                    ')}
                  </div>
                </div>
                <a href="posts/${article.filename}" class="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                  Read More →
                </a>
              </div>
            </div>
          </article>`;
  }

  updateBlogPage() {
    try {
      // Read current blog page
      let blogContent = fs.readFileSync(this.blogPagePath, 'utf8');
      
      // Get new articles
      const newArticles = this.getNewArticles();
      
      if (newArticles.length === 0) {
        console.log('❌ No new articles found to add');
        return;
      }

      // Generate HTML for new articles
      const newArticlesHTML = newArticles.map(article => this.generateArticleHTML(article)).join('\n\n');
      
      // Find the insertion point (after the featured article and before existing articles)
      const insertionPoint = blogContent.indexOf('          <article class="card">');
      
      if (insertionPoint === -1) {
        console.log('❌ Could not find insertion point in blog.html');
        return;
      }

      // Insert new articles
      const beforeInsertion = blogContent.substring(0, insertionPoint);
      const afterInsertion = blogContent.substring(insertionPoint);
      
      const updatedContent = beforeInsertion + newArticlesHTML + '\n\n' + afterInsertion;
      
      // Write updated content
      fs.writeFileSync(this.blogPagePath, updatedContent);
      
      console.log(`✅ Successfully added ${newArticles.length} articles to blog page`);
      
      // Show summary
      console.log('\n📝 Added Articles:');
      newArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   📂 Category: ${article.category}`);
        console.log(`   🔗 File: ${article.filename}`);
      });
      
    } catch (error) {
      console.error('❌ Error updating blog page:', error.message);
    }
  }

  async runCLI() {
    console.log('📄 Blog Page Updater');
    console.log('=' .repeat(50));
    
    this.updateBlogPage();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new BlogPageUpdater();
  updater.runCLI().catch(console.error);
}

export default BlogPageUpdater;
