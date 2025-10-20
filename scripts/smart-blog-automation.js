#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BlogPlanner from './blog-planner.js';
import EnhancedBlogAutomation from './enhanced-blog-automation.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SmartBlogAutomation {
  constructor() {
    this.blogPlanner = new BlogPlanner();
    this.blogGenerator = new EnhancedBlogAutomation();
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../config/automation.json');
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.log('Using default smart automation configuration');
    }
    
    return {
      autoPlan: true,
      planWeeks: 4,
      postsPerWeek: 3,
      autoGenerate: true,
      generateDays: 7,
      notificationEmail: '',
      backupEnabled: true,
      qualityCheck: true,
      seoOptimization: true,
      imageGeneration: true,
      internalLinking: true
    };
  }

  async runDailyAutomation() {
    console.log('\n🚀 Starting Smart Blog Automation');
    console.log('=' .repeat(50));
    
    try {
      // Step 1: Check if we need to generate a new plan
      if (this.config.autoPlan && this.shouldGenerateNewPlan()) {
        console.log('📅 Generating new blog plan...');
        await this.blogPlanner.generateBlogPlan(this.config.planWeeks);
      }

      // Step 2: Get upcoming posts for today
      const upcomingPosts = this.blogPlanner.getUpcomingPosts(1);
      
      if (upcomingPosts.length === 0) {
        console.log('📅 No posts scheduled for today');
        return;
      }

      console.log(`📝 Found ${upcomingPosts.length} post(s) scheduled for today`);

      // Step 3: Generate scheduled posts
      for (const post of upcomingPosts) {
        await this.generateScheduledPost(post);
      }

      // Step 4: Update planning status
      this.updatePlanningStatus();

      console.log('\n✅ Daily automation completed successfully!');
      
    } catch (error) {
      console.error('❌ Error in daily automation:', error.message);
      this.logError(error);
    }
  }

  shouldGenerateNewPlan() {
    const plannedPosts = this.blogPlanner.plannedPosts;
    
    // Generate new plan if no posts planned or less than 7 days of content remaining
    if (plannedPosts.length === 0) {
      return true;
    }

    const upcomingPosts = this.blogPlanner.getUpcomingPosts(7);
    return upcomingPosts.length < 3; // Less than 3 posts in next 7 days
  }

  async generateScheduledPost(post) {
    console.log(`\n📝 Generating: "${post.title}"`);
    console.log(`   Keyword: ${post.keyword}`);
    console.log(`   Category: ${post.category}`);
    
    try {
      // Generate the blog post
      const result = await this.blogGenerator.generateEnhancedBlogPost(post.keyword, {
        title: post.title,
        description: post.description,
        category: post.category,
        difficulty: post.difficulty,
        targetWords: post.estimatedWords,
        tags: post.tags,
        outline: post.outline
      });

      if (result.success) {
        // Mark post as completed
        this.blogPlanner.markPostAsCompleted(post.id);
        
        // Log success
        this.logPostGeneration(post, result);
        
        console.log(`✅ Successfully generated: "${post.title}"`);
        console.log(`   📊 Words: ${result.postData?.wordCount || 'N/A'}`);
        console.log(`   🎨 Images: ${result.postData?.images?.length || 0}`);
        console.log(`   🔗 Links: ${result.postData?.linkCount || 0}`);
        
        // Send notification if configured
        if (this.config.notificationEmail) {
          await this.sendNotification(post, result);
        }
        
      } else {
        console.error(`❌ Failed to generate: "${post.title}"`);
        console.error(`   Error: ${result.error}`);
        
        // Log failure
        this.logPostFailure(post, result.error);
      }
      
    } catch (error) {
      console.error(`❌ Error generating post "${post.title}":`, error.message);
      this.logPostFailure(post, error.message);
    }
  }

  updatePlanningStatus() {
    const totalPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => sum + week.posts.length, 0);
    const completedPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => 
      sum + week.posts.filter(post => post.status === 'completed').length, 0
    );
    
    console.log(`\n📊 Planning Status:`);
    console.log(`   📝 Total Posts: ${totalPosts}`);
    console.log(`   ✅ Completed: ${completedPosts}`);
    console.log(`   📋 Remaining: ${totalPosts - completedPosts}`);
    
    if (totalPosts > 0) {
      const completionRate = ((completedPosts / totalPosts) * 100).toFixed(1);
      console.log(`   📈 Completion Rate: ${completionRate}%`);
    }
  }

  logPostGeneration(post, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'post_generated',
      postId: post.id,
      title: post.title,
      keyword: post.keyword,
      category: post.category,
      wordCount: result.postData?.wordCount || 0,
      imageCount: result.postData?.images?.length || 0,
      linkCount: result.postData?.linkCount || 0,
      generationTime: result.generationTime || 0,
      success: true
    };
    
    this.writeLog(logEntry);
  }

  logPostFailure(post, error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'post_failed',
      postId: post.id,
      title: post.title,
      keyword: post.keyword,
      category: post.category,
      error: error,
      success: false
    };
    
    this.writeLog(logEntry);
  }

  logError(error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'automation_error',
      error: error.message,
      stack: error.stack,
      success: false
    };
    
    this.writeLog(logEntry);
  }

  writeLog(logEntry) {
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logFile = path.join(logsDir, 'smart-automation.log');
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(logFile, logLine);
  }

  async sendNotification(post, result) {
    // This would integrate with your notification system
    // For now, just log the notification
    console.log(`📧 Notification would be sent to ${this.config.notificationEmail}`);
    console.log(`   Subject: Blog Post Generated - "${post.title}"`);
    console.log(`   Content: Successfully generated ${result.postData?.wordCount || 0} words`);
  }

  async generateCustomPost(keyword, options = {}) {
    console.log(`\n📝 Generating custom post for: "${keyword}"`);
    
    const postData = {
      keyword,
      title: options.title || `Complete Guide to ${keyword}`,
      description: options.description || `Comprehensive guide to ${keyword} for modern businesses`,
      category: options.category || 'whatsapp_automation',
      priority: options.priority || 'medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedWords: options.estimatedWords || 2000,
      difficulty: options.difficulty || 'intermediate',
      tags: options.tags || ['whatsapp', 'automation', 'business'],
      outline: options.outline || [
        'Introduction and Problem Statement',
        'Why This Matters for Your Business',
        'Key Benefits and ROI',
        'Step-by-Step Implementation',
        'Real Examples and Case Studies',
        'Common Mistakes to Avoid',
        'Tools and Resources Needed',
        'Conclusion and Next Steps'
      ]
    };

    // Add to planned posts
    const customPost = this.blogPlanner.addCustomPost(postData);
    
    // Generate immediately
    const result = await this.generateScheduledPost(customPost);
    
    return {
      post: customPost,
      result: result
    };
  }

  async generateWeeklyBatch() {
    console.log('\n📅 Generating weekly batch of posts...');
    
    const upcomingPosts = this.blogPlanner.getUpcomingPosts(7);
    console.log(`Found ${upcomingPosts.length} posts to generate this week`);
    
    const results = [];
    
    for (const post of upcomingPosts) {
      try {
        await this.generateScheduledPost(post);
        results.push({ post, success: true });
        
        // Add delay between posts to avoid rate limiting
        console.log('⏳ Waiting 30 seconds before next post...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
      } catch (error) {
        console.error(`Failed to generate post "${post.title}":`, error.message);
        results.push({ post, success: false, error: error.message });
      }
    }
    
    return results;
  }

  printStatus() {
    console.log('\n📊 SMART BLOG AUTOMATION STATUS');
    console.log('=' .repeat(40));
    
    // Planning status
    const totalPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => sum + week.posts.length, 0);
    const completedPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => 
      sum + week.posts.filter(post => post.status === 'completed').length, 0
    );
    
    console.log(`📅 Planning Status:`);
    console.log(`   📝 Total Posts Planned: ${totalPosts}`);
    console.log(`   ✅ Completed: ${completedPosts}`);
    console.log(`   📋 Remaining: ${totalPosts - completedPosts}`);
    
    if (totalPosts > 0) {
      const completionRate = ((completedPosts / totalPosts) * 100).toFixed(1);
      console.log(`   📈 Completion Rate: ${completionRate}%`);
    }
    
    // Configuration
    console.log(`\n⚙️  Configuration:`);
    console.log(`   📅 Auto Plan: ${this.config.autoPlan ? 'Enabled' : 'Disabled'}`);
    console.log(`   📝 Posts/Week: ${this.config.postsPerWeek}`);
    console.log(`   🤖 Auto Generate: ${this.config.autoGenerate ? 'Enabled' : 'Disabled'}`);
    console.log(`   🎨 Image Generation: ${this.config.imageGeneration ? 'Enabled' : 'Disabled'}`);
    console.log(`   🔗 Internal Linking: ${this.config.internalLinking ? 'Enabled' : 'Disabled'}`);
    
    // Upcoming posts
    const upcoming = this.blogPlanner.getUpcomingPosts(7);
    if (upcoming.length > 0) {
      console.log(`\n📅 Upcoming Posts (Next 7 Days):`);
      upcoming.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title} (${post.scheduledDate})`);
      });
    } else {
      console.log(`\n📅 No upcoming posts in the next 7 days`);
    }
  }

  runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    
    switch (command) {
      case 'daily':
        this.runDailyAutomation();
        break;
        
      case 'weekly':
        this.generateWeeklyBatch();
        break;
        
      case 'custom':
        const keyword = param || 'whatsapp automation';
        this.generateCustomPost(keyword);
        break;
        
      case 'status':
        this.printStatus();
        break;
        
      case 'plan':
        const weeks = parseInt(param) || 4;
        this.blogPlanner.generateBlogPlan(weeks);
        break;
        
      case 'upcoming':
        const days = parseInt(param) || 7;
        this.blogPlanner.printUpcomingPosts(days);
        break;
        
      default:
        console.log(`
🚀 Smart Blog Automation - WittyReply Content System

Usage:
  node smart-blog-automation.js daily              - Run daily automation
  node smart-blog-automation.js weekly             - Generate weekly batch
  node smart-blog-automation.js custom [keyword]   - Generate custom post
  node smart-blog-automation.js status             - Show automation status
  node smart-blog-automation.js plan [weeks]       - Generate content plan
  node smart-blog-automation.js upcoming [days]    - Show upcoming posts

Examples:
  node smart-blog-automation.js daily              - Run today's automation
  node smart-blog-automation.js custom "whatsapp for restaurants" - Custom post
  node smart-blog-automation.js plan 8             - 8-week plan
  node smart-blog-automation.js status             - Check status

Features:
  ✨ Intelligent content planning
  🤖 Automated blog generation
  📅 Smart scheduling
  📊 Progress tracking
  🔔 Notifications
  📈 Analytics and reporting
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new SmartBlogAutomation();
  automation.runCLI().catch(console.error);
}

export default SmartBlogAutomation;
