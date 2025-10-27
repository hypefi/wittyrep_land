#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import KeywordPlanner from './keyword-planner.js';
import BlogPostGenerator from './blog-generator.js';
import PostDeployer from './deploy-posts.js';
import BlogManager from './blog-manager.js';
import ConfigManager from './config-manager.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DailyAutomation {
  constructor() {
    this.configManager = new ConfigManager();
    this.config = this.configManager.getConfig();
    this.keywordPlanner = new KeywordPlanner();
    this.blogGenerator = new BlogPostGenerator({ config: this.config });
    this.postDeployer = new PostDeployer();
    this.blogManager = new BlogManager();
    this.planner = this.config.features?.planning ? new BlogPlanner() : null;
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
      autoDeploy: true, // Automatically deploy to dist/
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
      if (todayPosts.length >= (this.config.generation?.postsPerDay || this.config.postsPerDay || 1)) {
        this.log(`✅ Already have ${todayPosts.length} posts for today (${today})`);
        return;
      }

      // Use planning if enabled
      if (this.planner && this.config.features?.planning) {
        await this.generateWithPlanning();
      } else {
        await this.generateWithoutPlanning();
      }
      
      // Auto-deploy if enabled
      if (this.config.generation?.autoDeploy || this.config.autoDeploy) {
        this.log('🚀 Auto-deploying posts...');
        await this.postDeployer.deployAll();
      }

      this.log('✅ Daily blog post generation completed successfully!');
      
    } catch (error) {
      this.log(`❌ Fatal error in daily automation: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * Generate posts with planning integration (from smart-blog-automation.js)
   */
  async generateWithPlanning() {
    this.log('📋 Using planning system for content generation...');
    
    try {
      // Get upcoming planned posts
      const upcomingPosts = this.blogManager.getUpcomingArticles(this.config.planning?.generateDays || 7);
      
      if (upcomingPosts.length > 0) {
        this.log(`📅 Found ${upcomingPosts.length} planned posts to generate`);
        
        for (const plannedPost of upcomingPosts.slice(0, this.config.generation?.postsPerDay || this.config.postsPerDay || 1)) {
          this.log(`📝 Generating planned post: "${plannedPost.title}"`);
          
          const topic = {
            keyword: plannedPost.keyword,
            title: plannedPost.title,
            description: plannedPost.description,
            outline: plannedPost.outline,
            difficulty: plannedPost.difficulty || 'intermediate',
            estimatedWords: plannedPost.targetWords,
            customInstructions: plannedPost.customInstructions
          };

          const postData = await this.blogGenerator.generateBlogPost(topic);
          
          if (postData) {
            const filepath = this.blogGenerator.saveBlogPost(postData);
            if (filepath) {
              // Update article status
              this.blogManager.updateArticleStatus(plannedPost.id, 'generated');
              this.log(`✅ Generated planned post: "${plannedPost.title}"`);
            }
          }
        }
      } else {
        this.log('📝 No planned posts found, generating fresh content...');
        await this.generateWithoutPlanning();
      }
      
    } catch (error) {
      this.log(`❌ Error in planning generation: ${error.message}`, 'ERROR');
      // Fallback to non-planning generation
      await this.generateWithoutPlanning();
    }
  }

  /**
   * Generate posts without planning (original method)
   */
  async generateWithoutPlanning() {
    this.log('📝 Generating fresh topic ideas...');
    const topics = this.keywordPlanner.generateTopicIdeas(this.config.generation?.postsPerDay || this.config.postsPerDay || 1);
    
    if (topics.length === 0) {
      this.log('⚠️ No new topics generated. All keywords may have been used.');
      return;
    }

    // Generate and save blog posts
    for (const topic of topics) {
      this.log(`📖 Generating blog post: ${topic.title}`);
      
      try {
        const postData = await this.blogGenerator.generateBlogPost(topic);
        const savedFile = this.blogGenerator.saveBlogPost(postData);
        
        if (savedFile) {
          this.log(`✅ Blog post saved: ${path.basename(savedFile)}`);
          
          // Mark keyword as used
          this.keywordPlanner.markKeywordAsUsed(topic.keyword);
          
          // Log AI generation status
          if (postData.isAIGenerated) {
            this.log(`🤖 Complete AI-generated article: ${postData.title}`);
            this.log(`📊 Word count: ${postData.wordCount || postData.estimatedWords} words`);
            this.log(`🎯 Sections: ${postData.outline.length} main sections`);
          }
        }
      } catch (error) {
        this.log(`❌ Error generating post for "${topic.keyword}": ${error.message}`, 'ERROR');
      }
    }
  }

  /**
   * Auto-plan content for upcoming weeks
   */
  async autoPlanContent() {
    if (!this.config.features?.planning || !this.config.planning?.autoPlan) {
      this.log('📋 Planning is disabled in configuration');
      return;
    }

    this.log('📋 Starting auto-planning for upcoming content...');
    
    try {
      const planWeeks = this.config.planning?.planWeeks || 4;
      const postsPerWeek = this.config.planning?.postsPerWeek || 3;
      const totalPosts = planWeeks * postsPerWeek;
      
      // Generate topic ideas for planning
      const topics = this.keywordPlanner.generateTopicIdeas(totalPosts);
      
      // Create planned articles
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        const scheduledDate = this.calculateScheduledDate(i, postsPerWeek);
        
        const articleData = {
          title: topic.title || `Complete Guide to ${topic.keyword}`,
          keyword: topic.keyword,
          description: topic.description || `Comprehensive guide to ${topic.keyword} for modern businesses`,
          category: this.getCategoryFromKeyword(topic.keyword),
          priority: 'high',
          scheduledDate: scheduledDate,
          targetWords: this.config.generation?.targetWords || 4000,
          outline: topic.outline || this.generateDefaultOutline(topic.keyword)
        };
        
        this.blogManager.addArticle(articleData);
      }
      
      this.log(`✅ Auto-planned ${totalPosts} articles for the next ${planWeeks} weeks`);
      
    } catch (error) {
      this.log(`❌ Error during auto-planning: ${error.message}`, 'ERROR');
    }
  }

  /**
   * Calculate scheduled date for planned content
   */
  calculateScheduledDate(index, postsPerWeek) {
    const startDate = new Date();
    const weeksAhead = Math.floor(index / postsPerWeek);
    const dayInWeek = index % postsPerWeek;
    
    // Schedule posts on Monday, Wednesday, Friday
    const daysOfWeek = [1, 3, 5]; // Monday, Wednesday, Friday
    const targetDay = daysOfWeek[dayInWeek] || daysOfWeek[0];
    
    const scheduledDate = new Date(startDate);
    scheduledDate.setDate(scheduledDate.getDate() + (weeksAhead * 7) + (targetDay - scheduledDate.getDay()));
    
    return scheduledDate.toISOString().split('T')[0];
  }

  /**
   * Get category from keyword
   */
  getCategoryFromKeyword(keyword) {
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('ai') || keywordLower.includes('artificial intelligence')) {
      return 'ai_tools';
    } else if (keywordLower.includes('business') || keywordLower.includes('growth')) {
      return 'business_automation';
    } else if (keywordLower.includes('marketing') || keywordLower.includes('digital')) {
      return 'digital_marketing';
    } else if (keywordLower.includes('automation') || keywordLower.includes('chatbot')) {
      return 'whatsapp_automation';
    } else if (keywordLower.includes('customer service') || keywordLower.includes('support')) {
      return 'customer_service';
    } else if (keywordLower.includes('lead generation') || keywordLower.includes('leads')) {
      return 'lead_generation';
    } else if (keywordLower.includes('real estate') || keywordLower.includes('property')) {
      return 'real_estate';
    } else {
      return 'whatsapp_automation';
    }
  }

  /**
   * Generate default outline for keyword
   */
  generateDefaultOutline(keyword) {
    return [
      'Introduction & Overview',
      'Key Benefits & Advantages',
      'Implementation Strategy',
      'Best Practices & Tips',
      'Real-World Examples',
      'Common Challenges & Solutions',
      'Measuring Success',
      'Conclusion & Action Steps'
    ];
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
      
      // Create new blog post entry matching your existing structure
      const newPostEntry = `
          <article class="card">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">${this.getCategoryFromKeyword(postData.keyword)}</span>
                <span class="text-gray-400 text-sm">${this.formatDate(postData.publishDate)}</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 leading-tight">
                <a href="posts/blog-${postData.slug}-${postData.publishDate}.html" class="text-white hover:text-primary-400 transition-colors">
                  ${postData.title}
                </a>
              </h3>
              <p class="text-gray-300 mb-4">
                ${postData.description}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-400">📖 ${this.estimateReadTime(postData.estimatedWords)} min read</span>
                  <div class="flex space-x-2">
                    <span class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">${this.getCategoryFromKeyword(postData.keyword)}</span>
                    <span class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">Automation</span>
                    <span class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">Business</span>
                  </div>
                </div>
                <a href="posts/blog-${postData.slug}-${postData.publishDate}.html" class="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                  Read More →
                </a>
              </div>
            </div>
          </article>`;
      
      // Find the posts container - look for the section containing articles
      const postsSection = blogIndex.indexOf('<section class="section" id="blog-posts">');
      if (postsSection === -1) {
        // Try alternative patterns
        const articlePattern = blogIndex.indexOf('<article class="card">');
        if (articlePattern === -1) {
          this.log('⚠️ Could not find posts section in blog.html');
          return;
        }
        
        // Insert before the first article
        blogIndex = blogIndex.slice(0, articlePattern) + newPostEntry + '\n          ' + blogIndex.slice(articlePattern);
      } else {
        // Find the end of the posts section
        const sectionEnd = blogIndex.indexOf('</section>', postsSection);
        if (sectionEnd !== -1) {
          // Insert before the section ends
          blogIndex = blogIndex.slice(0, sectionEnd) + newPostEntry + '\n          ' + blogIndex.slice(sectionEnd);
        }
      }
      
      fs.writeFileSync(blogIndexFile, blogIndex);
      this.log('✅ Blog index updated');
      
    } catch (error) {
      this.log(`⚠️ Error updating blog index: ${error.message}`, 'WARN');
    }
  }

  async deployNewPosts() {
    try {
      this.log('🚀 Deploying new posts to live site...');
      await this.postDeployer.deployNewPosts();
      this.log('✅ Posts deployment completed');
    } catch (error) {
      this.log(`⚠️ Error deploying posts: ${error.message}`, 'WARN');
    }
  }

  // Helper functions
  getCategoryFromKeyword(keyword) {
    if (keyword.includes('lead generation')) return 'Lead Generation';
    if (keyword.includes('customer service')) return 'Customer Service';
    if (keyword.includes('real estate')) return 'Real Estate';
    if (keyword.includes('automation')) return 'Automation';
    if (keyword.includes('business')) return 'Business Growth';
    return 'WhatsApp';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  estimateReadTime(wordCount) {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
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
      await this.updateBlogOrganization();
      this.log('✅ Scheduled task completed successfully');
    } catch (error) {
      this.log(`❌ Scheduled task failed: ${error.message}`, 'ERROR');
      
      // Send notification if configured
      if (this.config.notificationEmail) {
        await this.sendNotification(error.message);
      }
    }
  }

  /**
   * Update blog organization after new posts are added
   */
  async updateBlogOrganization() {
    try {
      this.log('🔄 Updating blog organization...');
      const { stdout, stderr } = await execAsync('node scripts/update-blog-organization.js');
      
      if (stderr) {
        this.log(`⚠️ Blog organization warning: ${stderr}`, 'WARN');
      } else {
        this.log('✅ Blog organization updated successfully');
      }
    } catch (error) {
      this.log(`❌ Blog organization failed: ${error.message}`, 'ERROR');
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
        
      case 'organize':
        await this.updateBlogOrganization();
        break;

      case 'plan':
        await this.autoPlanContent();
        break;

      case 'planning':
        if (args[1] === 'enable') {
          this.config.features = this.config.features || {};
          this.config.features.planning = true;
          this.configManager.updateConfig({ features: this.config.features });
          console.log('✅ Planning enabled');
        } else if (args[1] === 'disable') {
          this.config.features = this.config.features || {};
          this.config.features.planning = false;
          this.configManager.updateConfig({ features: this.config.features });
          console.log('✅ Planning disabled');
        } else {
          console.log(`Planning status: ${this.config.features?.planning ? 'enabled' : 'disabled'}`);
        }
        break;
        
      default:
        console.log(`
🚀 WittyReply Daily Blog Automation

Usage:
  node daily-automation.js generate [count]  - Generate new blog posts
  node daily-automation.js plan             - Auto-plan content for upcoming weeks
  node daily-automation.js planning [cmd]   - Enable/disable planning system
  node daily-automation.js config show      - Show current configuration
  node daily-automation.js config set <k> <v> - Set configuration value
  node daily-automation.js report           - Generate daily report
  node daily-automation.js cleanup          - Clean up old posts
  node daily-automation.js organize        - Update blog organization

Examples:
  node daily-automation.js generate 2
  node daily-automation.js plan
  node daily-automation.js planning enable
  node daily-automation.js config set postsPerDay 3
  node daily-automation.js report

Features:
  🤖 AI-powered content generation
  📋 Content planning system
  📊 Automatic keyword tracking
  🚀 Auto-deployment to dist/
  📈 Daily reporting
  🧹 Automatic cleanup
  📚 Blog organization
  🎯 Smart scheduling
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
