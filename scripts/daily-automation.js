#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import KeywordPlanner from './keyword-planner.js';
import BlogPostGenerator from './blog-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DailyAutomation {
  constructor() {
    this.keywordPlanner = new KeywordPlanner();
    this.blogGenerator = new BlogPostGenerator();
    this.config = this.loadConfig();
    this.logFile = path.join(__dirname, '../logs/automation.log');
  }

  loadConfig() {
    try {
      const configFile = path.join(__dirname, '../config/automation.json');
      if (fs.existsSync(configFile)) {
        return JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }
    } catch (error) {
      console.log('No config file found, using defaults');
    }

    return {
      postsPerDay: 1,
      maxPostsInQueue: 30,
      autoPublish: false,
      notificationEmail: '',
      keywordsPerPost: 3,
      contentVariation: 'high',
      seoOptimization: true,
      socialSharing: false
    };
  }

  saveConfig() {
    try {
      const configDir = path.join(__dirname, '../config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const configFile = path.join(__dirname, '../config/automation.json');
      fs.writeFileSync(configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logEntry);
    
    try {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  async generateDailyPosts() {
    this.log('🚀 Starting daily blog post generation...');
    
    try {
      // Check if we need to generate new posts
      const postsDir = path.join(__dirname, '../posts');
      const existingPosts = fs.existsSync(postsDir) ? fs.readdirSync(postsDir) : [];
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we already have posts for today
      const todayPosts = existingPosts.filter(post => post.includes(today));
      if (todayPosts.length >= this.config.postsPerDay) {
        this.log(`✅ Already have ${todayPosts.length} posts for today (${today})`);
        return;
      }

      // Generate new topic ideas
      this.log('📝 Generating new topic ideas...');
      const topics = this.keywordPlanner.generateTopicIdeas(this.config.postsPerDay);
      
      if (topics.length === 0) {
        this.log('⚠️ No new topics generated. All keywords may have been used.');
        return;
      }

      // Generate and save blog posts
      for (const topic of topics) {
        this.log(`📖 Generating blog post: ${topic.title}`);
        
        try {
          const postData = this.blogGenerator.generateBlogPost(topic);
          const savedFile = this.blogGenerator.saveBlogPost(postData);
          
          if (savedFile) {
            this.log(`✅ Blog post saved: ${path.basename(savedFile)}`);
            
            // Mark keyword as used
            this.keywordPlanner.markKeywordAsUsed(topic.keyword);
            
            // Generate additional variations if configured
            if (this.config.contentVariation === 'high') {
              await this.generateVariations(postData, topic);
            }
            
            // Update sitemap and blog index
            this.updateSitemap(postData);
            this.updateBlogIndex(postData);
            
          } else {
            this.log(`❌ Failed to save blog post: ${topic.title}`, 'ERROR');
          }
        } catch (error) {
          this.log(`❌ Error generating blog post: ${error.message}`, 'ERROR');
        }
      }

      this.log('🎉 Daily blog post generation completed successfully!');
      
      // Clean up old posts if needed
      this.cleanupOldPosts();
      
      // Generate report
      this.generateDailyReport();
      
    } catch (error) {
      this.log(`❌ Fatal error in daily automation: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async generateVariations(postData, topic) {
    if (this.config.contentVariation !== 'high') return;
    
    this.log('🔄 Generating content variations...');
    
    try {
      // Generate 2-3 variations with different angles
      const variations = [
        { angle: 'how-to', suffix: 'Complete Guide' },
        { angle: 'tips', suffix: 'Pro Tips' },
        { angle: 'case-study', suffix: 'Real Examples' }
      ];
      
      for (const variation of variations.slice(0, 2)) {
        const variationData = { ...postData };
        variationData.title = `${postData.title}: ${variation.suffix}`;
        variationData.slug = this.blogGenerator.generateSlug(variationData.title);
        variationData.publishDate = this.getFutureDate(1); // Schedule for tomorrow
        
        const variationFile = this.blogGenerator.saveBlogPost(variationData);
        if (variationFile) {
          this.log(`✅ Variation generated: ${path.basename(variationFile)}`);
        }
      }
    } catch (error) {
      this.log(`⚠️ Error generating variations: ${error.message}`, 'WARN');
    }
  }

  getFutureDate(daysAhead) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  }

  updateSitemap(postData) {
    try {
      const sitemapFile = path.join(__dirname, '../sitemap.xml');
      if (!fs.existsSync(sitemapFile)) {
        this.log('⚠️ Sitemap not found, skipping update');
        return;
      }
      
      // Read existing sitemap
      let sitemap = fs.readFileSync(sitemapFile, 'utf8');
      
      // Add new blog post entry
      const newEntry = `
  <url>
    <loc>https://wittyreply.com/posts/${postData.slug}</loc>
    <lastmod>${postData.publishDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      
      // Insert before closing urlset tag
      const insertPoint = sitemap.lastIndexOf('</urlset>');
      if (insertPoint !== -1) {
        sitemap = sitemap.slice(0, insertPoint) + newEntry + '\n' + sitemap.slice(insertPoint);
        fs.writeFileSync(sitemapFile, sitemap);
        this.log('✅ Sitemap updated');
      }
    } catch (error) {
      this.log(`⚠️ Error updating sitemap: ${error.message}`, 'WARN');
    }
  }

  updateBlogIndex(postData) {
    try {
      const blogIndexFile = path.join(__dirname, '../blog.html');
      if (!fs.existsSync(blogIndexFile)) {
        this.log('⚠️ Blog index not found, skipping update');
        return;
      }
      
      // Read existing blog index
      let blogIndex = fs.readFileSync(blogIndexFile, 'utf8');
      
      // Add new blog post entry to the posts list
      const newPostEntry = `
        <div class="bg-gray-800/30 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
          <h3 class="text-xl font-semibold mb-3">
            <a href="posts/blog-${postData.slug}-${postData.publishDate}.html" class="text-white hover:text-green-400 transition-colors">
              ${postData.title}
            </a>
          </h3>
          <p class="text-gray-300 mb-4">${postData.description}</p>
          <div class="flex items-center justify-between text-sm text-gray-400">
            <span>${postData.publishDate}</span>
            <span class="bg-green-900/20 text-green-400 px-2 py-1 rounded">${postData.difficulty}</span>
          </div>
        </div>`;
      
      // Find the posts container and add new post
      const postsContainer = blogIndex.indexOf('<div class="grid md:grid-cols-2 gap-6">');
      if (postsContainer !== -1) {
        const insertPoint = blogIndex.indexOf('</div>', postsContainer) + 6;
        blogIndex = blogIndex.slice(0, insertPoint) + newPostEntry + blogIndex.slice(insertPoint);
        fs.writeFileSync(blogIndexFile, blogIndex);
        this.log('✅ Blog index updated');
      }
    } catch (error) {
      this.log(`⚠️ Error updating blog index: ${error.message}`, 'WARN');
    }
  }

  cleanupOldPosts() {
    try {
      const postsDir = path.join(__dirname, '../posts');
      if (!fs.existsSync(postsDir)) return;
      
      const posts = fs.readdirSync(postsDir);
      const maxAge = 365; // Keep posts for 1 year
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);
      
      let deletedCount = 0;
      
      posts.forEach(post => {
        const postPath = path.join(postsDir, post);
        const stats = fs.statSync(postPath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(postPath);
          deletedCount++;
          this.log(`🗑️ Deleted old post: ${post}`);
        }
      });
      
      if (deletedCount > 0) {
        this.log(`🧹 Cleanup completed: ${deletedCount} old posts deleted`);
      }
    } catch (error) {
      this.log(`⚠️ Error during cleanup: ${error.message}`, 'WARN');
    }
  }

  generateDailyReport() {
    try {
      const reportDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const reportFile = path.join(reportDir, `daily-report-${today}.json`);
      
      const postsDir = path.join(__dirname, '../posts');
      const posts = fs.existsSync(postsDir) ? fs.readdirSync(postsDir) : [];
      const todayPosts = posts.filter(post => post.includes(today));
      
      const report = {
        date: today,
        postsGenerated: todayPosts.length,
        totalPosts: posts.length,
        keywordsUsed: this.keywordPlanner.usedKeywords.length,
        topicsGenerated: this.keywordPlanner.topicIdeas.length,
        config: this.config,
        generatedPosts: todayPosts.map(post => ({
          filename: post,
          path: path.join(postsDir, post)
        }))
      };
      
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      this.log(`📊 Daily report generated: ${path.basename(reportFile)}`);
      
    } catch (error) {
      this.log(`⚠️ Error generating report: ${error.message}`, 'WARN');
    }
  }

  async runScheduledTask() {
    this.log('⏰ Running scheduled daily task...');
    
    try {
      await this.generateDailyPosts();
      this.log('✅ Scheduled task completed successfully');
    } catch (error) {
      this.log(`❌ Scheduled task failed: ${error.message}`, 'ERROR');
      
      // Send notification if configured
      if (this.config.notificationEmail) {
        await this.sendNotification(error.message);
      }
    }
  }

  async sendNotification(errorMessage) {
    // This would integrate with your notification system
    // For now, just log it
    this.log(`📧 Notification would be sent to ${this.config.notificationEmail}: ${errorMessage}`);
  }

  // CLI interface
  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'generate':
        const count = args[1] ? parseInt(args[1]) : 1;
        this.config.postsPerDay = count;
        await this.generateDailyPosts();
        break;
        
      case 'config':
        if (args[1] === 'show') {
          console.log('Current configuration:');
          console.log(JSON.stringify(this.config, null, 2));
        } else if (args[1] === 'set') {
          const key = args[2];
          const value = args[3];
          if (key && value !== undefined) {
            this.config[key] = value;
            this.saveConfig();
            console.log(`✅ Config updated: ${key} = ${value}`);
          } else {
            console.log('Usage: node daily-automation.js config set <key> <value>');
          }
        }
        break;
        
      case 'report':
        this.generateDailyReport();
        break;
        
      case 'cleanup':
        this.cleanupOldPosts();
        break;
        
      default:
        console.log(`
🚀 WittyReply Daily Blog Automation

Usage:
  node daily-automation.js generate [count]  - Generate new blog posts
  node daily-automation.js config show       - Show current configuration
  node daily-automation.js config set <k> <v> - Set configuration value
  node daily-automation.js report            - Generate daily report
  node daily-automation.js cleanup           - Clean up old posts

Examples:
  node daily-automation.js generate 3        - Generate 3 posts today
  node daily-automation.js config set postsPerDay 2
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new DailyAutomation();
  automation.runCLI().catch(console.error);
}

export default DailyAutomation;
