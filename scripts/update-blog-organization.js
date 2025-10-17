#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Quick Blog Organization Update
 * Updates blog organization without full re-analysis
 */

class QuickBlogUpdater {
  constructor() {
    this.postsDir = path.join(__dirname, '../posts');
    this.blogHtmlPath = path.join(__dirname, '../blog.html');
  }

  /**
   * Get all blog post files sorted by modification date (newest first)
   */
  getAllPostFiles() {
    const files = fs.readdirSync(this.postsDir)
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const filePath = path.join(this.postsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          filePath,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

    return files;
  }

  /**
   * Extract basic metadata from a blog post
   */
  extractBasicMetadata(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // Extract title
      const titleMatch = content.match(/<title>(.*?) - WittyReply Blog<\/title>/);
      const title = titleMatch ? titleMatch[1] : this.extractTitleFromFilename(filename);
      
      // Extract description
      const descMatch = content.match(/<meta name="description" content="(.*?)">/);
      const description = descMatch ? descMatch[1] : '';
      
      // Extract keywords
      const keywordsMatch = content.match(/<meta name="keywords" content="(.*?)">/);
      const keywords = keywordsMatch ? keywordsMatch[1].split(', ') : [];
      
      // Extract publish date
      const publishDate = this.extractPublishDate(content, filename);
      
      // Determine category
      const category = this.determineCategory(keywords, title);
      
      // Estimate reading time
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.max(5, Math.ceil(wordCount / 200));
      
      return {
        title,
        description,
        keywords,
        filename,
        publishDate,
        category,
        readingTime
      };
    } catch (error) {
      console.error(`Error extracting metadata from ${filePath}:`, error);
      return null;
    }
  }

  extractPublishDate(content, filename) {
    // Try article:published_time first
    const articleTimeMatch = content.match(/<meta property="article:published_time" content="(.*?)">/);
    if (articleTimeMatch) {
      return new Date(articleTimeMatch[1]);
    }
    
    // Try JSON-LD
    const jsonLdMatch = content.match(/"datePublished":\s*"(.*?)"/);
    if (jsonLdMatch) {
      return new Date(jsonLdMatch[1]);
    }
    
    // Extract from filename
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return new Date(dateMatch[1]);
    }
    
    // Fallback to file modification time
    const stats = fs.statSync(path.join(this.postsDir, filename));
    return stats.mtime;
  }

  extractTitleFromFilename(filename) {
    let title = filename.replace('.html', '').replace(/^blog-/, '');
    title = title.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    title = title.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return title;
  }

  determineCategory(keywords, title) {
    const text = `${title} ${keywords.join(' ')}`.toLowerCase();
    
    if (text.includes('ai') || text.includes('artificial intelligence')) {
      return { name: 'AI Tools', class: 'bg-purple-500/20 text-purple-400' };
    } else if (text.includes('api') || text.includes('integration')) {
      return { name: 'API', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('free') || text.includes('cost')) {
      return { name: 'Free Tools', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('business') || text.includes('growth')) {
      return { name: 'Business', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('marketing') || text.includes('digital')) {
      return { name: 'Marketing', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('automation') || text.includes('chatbot')) {
      return { name: 'Automation', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('customer service') || text.includes('support')) {
      return { name: 'Customer Service', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('lead generation') || text.includes('leads')) {
      return { name: 'Lead Generation', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('real estate') || text.includes('property')) {
      return { name: 'Real Estate', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('software') || text.includes('tools')) {
      return { name: 'Software', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('roi') || text.includes('cost')) {
      return { name: 'ROI Analysis', class: 'bg-red-500/20 text-red-400' };
    } else {
      return { name: 'General', class: 'bg-gray-500/20 text-gray-400' };
    }
  }

  formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  generateBlogCard(post, index) {
    const { title, description, filename, publishDate, category, readingTime, keywords } = post;
    const formattedDate = this.formatDisplayDate(publishDate);
    const topKeywords = keywords.slice(0, 3);
    
    const isFeatured = index === 0;
    const cardClass = isFeatured ? "card md:col-span-2" : "card";
    const titleClass = isFeatured ? "text-2xl font-semibold mb-3 leading-tight" : "text-xl font-semibold mb-3 leading-tight";
    
    const tagsHTML = topKeywords.map(keyword => 
      `<span class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">${keyword}</span>`
    ).join('\n                    ');
    
    return `          <article class="${cardClass}">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <span class="${category.class} px-3 py-1 rounded-full text-sm font-medium">${category.name}</span>
                <span class="text-gray-400 text-sm">${formattedDate}</span>
              </div>
              <h3 class="${titleClass}">
                <a href="posts/${filename}" class="text-white hover:text-primary-400 transition-colors">
                  ${title}
                </a>
              </h3>
              <p class="text-gray-300 mb-4">
                ${description}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-400">📖 ${readingTime} min read</span>
                  <div class="flex space-x-2">
                    ${tagsHTML}
                  </div>
                </div>
                <a href="posts/${filename}" class="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                  Read More →
                </a>
              </div>
            </div>
          </article>`;
  }

  /**
   * Update the blog page with organized posts
   */
  updateBlogPage() {
    console.log('🔄 Updating blog organization...');
    
    try {
      const files = this.getAllPostFiles();
      const posts = [];
      
      // Extract metadata for each post
      files.forEach(file => {
        const metadata = this.extractBasicMetadata(file.filePath);
        if (metadata) {
          posts.push(metadata);
        }
      });
      
      // Sort by publish date (newest first)
      posts.sort((a, b) => b.publishDate - a.publishDate);
      
      console.log(`📝 Found ${posts.length} blog posts`);
      
      // Generate blog cards
      const blogCards = posts.map((post, index) => this.generateBlogCard(post, index)).join('\n\n');
      
      // Read current blog.html
      const blogHtml = fs.readFileSync(this.blogHtmlPath, 'utf8');
      
      // Find and replace the blog articles section
      const blogSectionStart = '<!-- Blog Articles Section -->';
      const blogSectionEnd = '<!-- Blog CTA Section -->';
      
      const startIndex = blogHtml.indexOf(blogSectionStart);
      const endIndex = blogHtml.indexOf(blogSectionEnd);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const beforeSection = blogHtml.substring(0, startIndex);
        const afterSection = blogHtml.substring(endIndex);
        
        const newBlogSection = `${blogSectionStart}
    <section class="section bg-gray-800/50">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
${blogCards}
        </div>
      </div>
    </section>

    `;
        
        const newBlogHtml = beforeSection + newBlogSection + afterSection;
        
        // Write updated file
        fs.writeFileSync(this.blogHtmlPath, newBlogHtml, 'utf8');
        console.log('✅ Blog page updated successfully!');
        
        // Show summary
        const grouped = {};
        posts.forEach(post => {
          const monthYear = this.formatDisplayDate(post.publishDate);
          if (!grouped[monthYear]) grouped[monthYear] = 0;
          grouped[monthYear]++;
        });
        
        console.log('\n📊 Organization Summary:');
        Object.keys(grouped).sort().reverse().forEach(month => {
          console.log(`   ${month}: ${grouped[month]} posts`);
        });
        
      } else {
        console.error('❌ Could not find blog articles section');
      }
      
    } catch (error) {
      console.error('❌ Error updating blog page:', error);
    }
  }

  /**
   * Main execution
   */
  run() {
    console.log('🚀 Quick Blog Organization Update\n');
    this.updateBlogPage();
    console.log('\n🎉 Update complete!');
  }
}

// Run the updater
const updater = new QuickBlogUpdater();
updater.run();
