#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced Blog Post Organizer
 * Automatically organizes blog posts by date with proper metadata extraction
 */

class BlogOrganizer {
  constructor() {
    this.postsDir = path.join(__dirname, '../posts');
    this.blogHtmlPath = path.join(__dirname, '../blog.html');
    this.posts = [];
  }

  /**
   * Extract comprehensive metadata from a blog post file
   */
  extractPostMetadata(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // Extract title from <title> tag
      const titleMatch = content.match(/<title>(.*?) - WittyReply Blog<\/title>/);
      const title = titleMatch ? titleMatch[1] : this.extractTitleFromFilename(filename);
      
      // Extract description
      const descMatch = content.match(/<meta name="description" content="(.*?)">/);
      const description = descMatch ? descMatch[1] : '';
      
      // Extract keywords
      const keywordsMatch = content.match(/<meta name="keywords" content="(.*?)">/);
      const keywords = keywordsMatch ? keywordsMatch[1].split(', ') : [];
      
      // Extract main heading
      const headingMatch = content.match(/<h1[^>]*class="[^"]*gradient-text[^"]*"[^>]*>(.*?)<\/h1>/);
      const mainHeading = headingMatch ? headingMatch[1].replace(/<[^>]*>/g, '') : title;
      
      // Extract publish date from multiple sources
      const publishDate = this.extractPublishDate(content, filename);
      
      // Extract article published time
      const articleTimeMatch = content.match(/<meta property="article:published_time" content="(.*?)">/);
      const articleTime = articleTimeMatch ? new Date(articleTimeMatch[1]) : publishDate;
      
      // Determine category and color
      const category = this.determineCategory(keywords, title);
      
      // Estimate reading time
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.max(5, Math.ceil(wordCount / 200));
      
      return {
        title: mainHeading,
        description,
        keywords,
        filename,
        publishDate,
        articleTime,
        category,
        readingTime,
        wordCount,
        filePath
      };
    } catch (error) {
      console.error(`Error extracting metadata from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract publish date from multiple sources
   */
  extractPublishDate(content, filename) {
    // Try to extract from article:published_time meta tag
    const articleTimeMatch = content.match(/<meta property="article:published_time" content="(.*?)">/);
    if (articleTimeMatch) {
      return new Date(articleTimeMatch[1]);
    }
    
    // Try to extract from JSON-LD structured data
    const jsonLdMatch = content.match(/"datePublished":\s*"(.*?)"/);
    if (jsonLdMatch) {
      return new Date(jsonLdMatch[1]);
    }
    
    // Extract from filename (format: YYYY-MM-DD)
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return new Date(dateMatch[1]);
    }
    
    // Fallback to file modification time
    const stats = fs.statSync(path.join(this.postsDir, filename));
    return stats.mtime;
  }

  /**
   * Extract title from filename if not found in content
   */
  extractTitleFromFilename(filename) {
    // Remove .html extension and blog- prefix
    let title = filename.replace('.html', '').replace(/^blog-/, '');
    
    // Remove date pattern
    title = title.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    
    // Convert hyphens to spaces and capitalize
    title = title.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return title;
  }

  /**
   * Determine category and color based on content analysis
   */
  determineCategory(keywords, title) {
    const text = `${title} ${keywords.join(' ')}`.toLowerCase();
    
    if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
      return { name: 'AI Tools', color: 'purple', class: 'bg-purple-500/20 text-purple-400' };
    } else if (text.includes('api') || text.includes('integration') || text.includes('business api')) {
      return { name: 'API', color: 'blue', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('free') || text.includes('cost') || text.includes('budget')) {
      return { name: 'Free Tools', color: 'green', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('business') || text.includes('growth') || text.includes('efficiency')) {
      return { name: 'Business', color: 'green', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('marketing') || text.includes('digital') || text.includes('social media')) {
      return { name: 'Marketing', color: 'blue', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('automation') || text.includes('chatbot') || text.includes('workflow')) {
      return { name: 'Automation', color: 'green', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('customer service') || text.includes('support') || text.includes('service')) {
      return { name: 'Customer Service', color: 'blue', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('lead generation') || text.includes('leads') || text.includes('conversion')) {
      return { name: 'Lead Generation', color: 'green', class: 'bg-green-500/20 text-green-400' };
    } else if (text.includes('real estate') || text.includes('property') || text.includes('estate')) {
      return { name: 'Real Estate', color: 'blue', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('software') || text.includes('tools') || text.includes('platform')) {
      return { name: 'Software', color: 'blue', class: 'bg-blue-500/20 text-blue-400' };
    } else if (text.includes('roi') || text.includes('cost') || text.includes('savings')) {
      return { name: 'ROI Analysis', color: 'red', class: 'bg-red-500/20 text-red-400' };
    } else if (text.includes('pro tips') || text.includes('tips') || text.includes('guide')) {
      return { name: 'Pro Tips', color: 'yellow', class: 'bg-yellow-500/20 text-yellow-400' };
    } else {
      return { name: 'General', color: 'gray', class: 'bg-gray-500/20 text-gray-400' };
    }
  }

  /**
   * Format date for display
   */
  formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  /**
   * Generate HTML for a blog post card
   */
  generateBlogCard(post, index) {
    const { title, description, filename, publishDate, category, readingTime, keywords } = post;
    
    // Format date
    const formattedDate = this.formatDisplayDate(publishDate);
    
    // Get top 3 keywords for tags
    const topKeywords = keywords.slice(0, 3);
    
    // Determine if this should be featured (first post or marked as featured)
    const isFeatured = index === 0 || post.featured;
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
   * Group posts by month/year for better organization
   */
  groupPostsByMonth(posts) {
    const grouped = {};
    
    posts.forEach(post => {
      const monthYear = this.formatDisplayDate(post.publishDate);
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(post);
    });
    
    return grouped;
  }

  /**
   * Load all blog posts and extract metadata
   */
  loadAllPosts() {
    console.log('📝 Loading and analyzing blog posts...\n');
    
    const files = fs.readdirSync(this.postsDir)
      .filter(file => file.endsWith('.html'))
      .sort(); // Sort alphabetically first
    
    this.posts = [];
    
    files.forEach(file => {
      const filePath = path.join(this.postsDir, file);
      const metadata = this.extractPostMetadata(filePath);
      
      if (metadata) {
        this.posts.push(metadata);
        console.log(`✅ ${metadata.title}`);
        console.log(`   📅 ${this.formatDisplayDate(metadata.publishDate)}`);
        console.log(`   🏷️  ${metadata.category.name}`);
        console.log(`   ⏱️  ${metadata.readingTime} min read\n`);
      }
    });
    
    // Sort posts by date (newest first)
    this.posts.sort((a, b) => b.publishDate - a.publishDate);
    
    console.log(`\n🎉 Loaded ${this.posts.length} blog posts!`);
    return this.posts;
  }

  /**
   * Update the blog.html file with organized posts
   */
  updateBlogPage() {
    console.log('\n🔄 Updating blog page...');
    
    try {
      const blogHtml = fs.readFileSync(this.blogHtmlPath, 'utf8');
      
      // Generate all blog cards
      const blogCards = this.posts.map((post, index) => this.generateBlogCard(post, index)).join('\n\n');
      
      // Find the blog articles section
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
        
        // Write the updated blog.html file
        fs.writeFileSync(this.blogHtmlPath, newBlogHtml, 'utf8');
        console.log('✅ Blog page updated successfully!');
        
        // Generate summary report
        this.generateSummaryReport();
        
      } else {
        console.error('❌ Could not find blog articles section in the HTML file');
      }
    } catch (error) {
      console.error('❌ Error updating blog page:', error);
    }
  }

  /**
   * Generate a summary report of the organization
   */
  generateSummaryReport() {
    console.log('\n📊 Blog Organization Summary:');
    console.log('=' .repeat(50));
    
    const grouped = this.groupPostsByMonth(this.posts);
    const months = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date(grouped[a][0].publishDate);
      const dateB = new Date(grouped[b][0].publishDate);
      return dateB - dateA;
    });
    
    months.forEach(month => {
      const posts = grouped[month];
      console.log(`\n📅 ${month} (${posts.length} posts)`);
      posts.forEach(post => {
        console.log(`   • ${post.title} (${post.category.name})`);
      });
    });
    
    console.log(`\n📈 Total: ${this.posts.length} posts organized`);
    console.log(`📊 Categories: ${[...new Set(this.posts.map(p => p.category.name))].join(', ')}`);
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🚀 Starting Blog Organization Process...\n');
    
    // Load all posts
    this.loadAllPosts();
    
    if (this.posts.length === 0) {
      console.log('❌ No blog posts found to organize');
      return;
    }
    
    // Update blog page
    this.updateBlogPage();
    
    console.log('\n🎉 Blog organization complete!');
  }
}

// Run the organizer
const organizer = new BlogOrganizer();
organizer.run().catch(console.error);
