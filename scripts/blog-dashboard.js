#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BlogPlanner from './blog-planner.js';
import SmartBlogAutomation from './smart-blog-automation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogDashboard {
  constructor() {
    this.blogPlanner = new BlogPlanner();
    this.automation = new SmartBlogAutomation();
  }

  generateDashboard() {
    console.log('\n🎯 WITTYREPLY BLOG DASHBOARD');
    console.log('=' .repeat(50));
    
    // Current status
    this.showCurrentStatus();
    
    // Content calendar
    this.showContentCalendar();
    
    // Performance metrics
    this.showPerformanceMetrics();
    
    // Recommendations
    this.showRecommendations();
    
    // Quick actions
    this.showQuickActions();
  }

  showCurrentStatus() {
    console.log('\n📊 CURRENT STATUS');
    console.log('-'.repeat(20));
    
    const totalPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => sum + week.posts.length, 0);
    const completedPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => 
      sum + week.posts.filter(post => post.status === 'completed').length, 0
    );
    const plannedPosts = totalPosts - completedPosts;
    
    console.log(`📝 Total Posts: ${totalPosts}`);
    console.log(`✅ Completed: ${completedPosts}`);
    console.log(`📋 Planned: ${plannedPosts}`);
    
    if (totalPosts > 0) {
      const completionRate = ((completedPosts / totalPosts) * 100).toFixed(1);
      console.log(`📈 Completion Rate: ${completionRate}%`);
    }
    
    // Show today's posts
    const todayPosts = this.blogPlanner.getUpcomingPosts(1);
    if (todayPosts.length > 0) {
      console.log(`\n📅 Today's Posts: ${todayPosts.length}`);
      todayPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`);
      });
    } else {
      console.log('\n📅 No posts scheduled for today');
    }
  }

  showContentCalendar() {
    console.log('\n📅 CONTENT CALENDAR (Next 4 Weeks)');
    console.log('-'.repeat(35));
    
    const upcomingWeeks = this.blogPlanner.plannedPosts.slice(0, 4);
    
    if (upcomingWeeks.length === 0) {
      console.log('No content planned. Generate a plan first!');
      return;
    }
    
    upcomingWeeks.forEach(week => {
      console.log(`\n📆 Week ${week.week} (${week.startDate} - ${week.endDate})`);
      console.log(`   Posts: ${week.posts.length}`);
      
      week.posts.forEach((post, index) => {
        const status = post.status === 'completed' ? '✅' : '📋';
        const priority = post.priority === 'high' ? '🔴' : post.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${index + 1}. ${status} ${priority} ${post.title}`);
      });
    });
  }

  showPerformanceMetrics() {
    console.log('\n📈 PERFORMANCE METRICS');
    console.log('-'.repeat(25));
    
    // Analyze recent posts
    const recentPosts = this.getRecentPosts(30); // Last 30 days
    const categories = this.analyzeCategories(recentPosts);
    const priorities = this.analyzePriorities(recentPosts);
    
    console.log(`📊 Recent Activity (Last 30 days):`);
    console.log(`   📝 Posts Generated: ${recentPosts.length}`);
    console.log(`   📅 Average per Week: ${(recentPosts.length / 4).toFixed(1)}`);
    
    console.log(`\n📊 Content Categories:`);
    Object.entries(categories).forEach(([category, count]) => {
      const percentage = ((count / recentPosts.length) * 100).toFixed(1);
      console.log(`   ${category}: ${count} posts (${percentage}%)`);
    });
    
    console.log(`\n📊 Priority Distribution:`);
    Object.entries(priorities).forEach(([priority, count]) => {
      const percentage = ((count / recentPosts.length) * 100).toFixed(1);
      console.log(`   ${priority}: ${count} posts (${percentage}%)`);
    });
  }

  showRecommendations() {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(20));
    
    const upcomingPosts = this.blogPlanner.getUpcomingPosts(7);
    const totalPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => sum + week.posts.length, 0);
    const completedPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => 
      sum + week.posts.filter(post => post.status === 'completed').length, 0
    );
    
    // Content gaps
    if (upcomingPosts.length < 3) {
      console.log('⚠️  Low content pipeline - consider generating more posts');
    }
    
    // Category balance
    const categories = this.analyzeCategories(upcomingPosts);
    const categoryCount = Object.keys(categories).length;
    if (categoryCount < 3) {
      console.log('⚠️  Limited category diversity - add more variety');
    }
    
    // Priority balance
    const priorities = this.analyzePriorities(upcomingPosts);
    if (priorities.high < 2) {
      console.log('⚠️  Low high-priority content - add more strategic posts');
    }
    
    // Completion rate
    if (totalPosts > 0) {
      const completionRate = (completedPosts / totalPosts) * 100;
      if (completionRate < 80) {
        console.log('⚠️  Low completion rate - review and optimize workflow');
      }
    }
    
    // Positive recommendations
    if (upcomingPosts.length >= 3 && categoryCount >= 3) {
      console.log('✅ Good content pipeline and diversity');
    }
    
    if (totalPosts > 0 && (completedPosts / totalPosts) >= 0.8) {
      console.log('✅ Excellent completion rate');
    }
  }

  showQuickActions() {
    console.log('\n⚡ QUICK ACTIONS');
    console.log('-'.repeat(15));
    
    console.log('1. Generate 4-week plan:     node blog-planner.js generate 4');
    console.log('2. Run daily automation:     node smart-blog-automation.js daily');
    console.log('3. Generate custom post:     node smart-blog-automation.js custom "keyword"');
    console.log('4. Show upcoming posts:      node blog-planner.js upcoming 7');
    console.log('5. Export plan to CSV:       node blog-planner.js export csv');
    console.log('6. Check automation status:  node smart-blog-automation.js status');
  }

  getRecentPosts(days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentPosts = [];
    this.blogPlanner.plannedPosts.forEach(week => {
      week.posts.forEach(post => {
        const postDate = new Date(post.scheduledDate);
        if (postDate >= cutoffDate && post.status === 'completed') {
          recentPosts.push(post);
        }
      });
    });
    
    return recentPosts;
  }

  analyzeCategories(posts) {
    const categories = {};
    posts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });
    return categories;
  }

  analyzePriorities(posts) {
    const priorities = {};
    posts.forEach(post => {
      priorities[post.priority] = (priorities[post.priority] || 0) + 1;
    });
    return priorities;
  }

  generateContentIdeas(count = 10) {
    console.log(`\n💡 GENERATING ${count} CONTENT IDEAS`);
    console.log('=' .repeat(40));
    
    const ideas = this.blogPlanner.keywordPlanner.generateTopicIdeas(count);
    this.blogPlanner.keywordPlanner.printTopicIdeas();
    
    return ideas;
  }

  exportDashboard() {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      status: this.getDashboardStatus(),
      calendar: this.getCalendarData(),
      metrics: this.getMetricsData(),
      recommendations: this.getRecommendationsData()
    };
    
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filename = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(dataDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(dashboardData, null, 2));
    console.log(`\n✅ Dashboard exported to: ${filepath}`);
    
    return filepath;
  }

  getDashboardStatus() {
    const totalPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => sum + week.posts.length, 0);
    const completedPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => 
      sum + week.posts.filter(post => post.status === 'completed').length, 0
    );
    
    return {
      totalPosts,
      completedPosts,
      plannedPosts: totalPosts - completedPosts,
      completionRate: totalPosts > 0 ? ((completedPosts / totalPosts) * 100).toFixed(1) : 0,
      todayPosts: this.blogPlanner.getUpcomingPosts(1).length
    };
  }

  getCalendarData() {
    return this.blogPlanner.plannedPosts.slice(0, 4).map(week => ({
      week: week.week,
      startDate: week.startDate,
      endDate: week.endDate,
      posts: week.posts.map(post => ({
        title: post.title,
        keyword: post.keyword,
        category: post.category,
        priority: post.priority,
        status: post.status,
        scheduledDate: post.scheduledDate
      }))
    }));
  }

  getMetricsData() {
    const recentPosts = this.getRecentPosts(30);
    return {
      recentPosts: recentPosts.length,
      averagePerWeek: (recentPosts.length / 4).toFixed(1),
      categories: this.analyzeCategories(recentPosts),
      priorities: this.analyzePriorities(recentPosts)
    };
  }

  getRecommendationsData() {
    const upcomingPosts = this.blogPlanner.getUpcomingPosts(7);
    const totalPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => sum + week.posts.length, 0);
    const completedPosts = this.blogPlanner.plannedPosts.reduce((sum, week) => 
      sum + week.posts.filter(post => post.status === 'completed').length, 0
    );
    
    const recommendations = [];
    
    if (upcomingPosts.length < 3) {
      recommendations.push('Low content pipeline - consider generating more posts');
    }
    
    const categories = this.analyzeCategories(upcomingPosts);
    if (Object.keys(categories).length < 3) {
      recommendations.push('Limited category diversity - add more variety');
    }
    
    const priorities = this.analyzePriorities(upcomingPosts);
    if (priorities.high < 2) {
      recommendations.push('Low high-priority content - add more strategic posts');
    }
    
    if (totalPosts > 0) {
      const completionRate = (completedPosts / totalPosts) * 100;
      if (completionRate < 80) {
        recommendations.push('Low completion rate - review and optimize workflow');
      }
    }
    
    return recommendations;
  }

  runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    
    switch (command) {
      case 'show':
        this.generateDashboard();
        break;
        
      case 'ideas':
        const count = parseInt(param) || 10;
        this.generateContentIdeas(count);
        break;
        
      case 'export':
        this.exportDashboard();
        break;
        
      case 'status':
        this.showCurrentStatus();
        break;
        
      case 'calendar':
        this.showContentCalendar();
        break;
        
      case 'metrics':
        this.showPerformanceMetrics();
        break;
        
      case 'recommendations':
        this.showRecommendations();
        break;
        
      default:
        console.log(`
🎯 Blog Dashboard - WittyReply Content Management

Usage:
  node blog-dashboard.js show              - Show full dashboard
  node blog-dashboard.js ideas [count]     - Generate content ideas
  node blog-dashboard.js export            - Export dashboard data
  node blog-dashboard.js status            - Show current status
  node blog-dashboard.js calendar          - Show content calendar
  node blog-dashboard.js metrics           - Show performance metrics
  node blog-dashboard.js recommendations   - Show recommendations

Examples:
  node blog-dashboard.js show              - Full dashboard view
  node blog-dashboard.js ideas 15          - Generate 15 content ideas
  node blog-dashboard.js export            - Export dashboard data

Features:
  📊 Real-time status monitoring
  📅 Content calendar visualization
  📈 Performance metrics analysis
  💡 Smart recommendations
  📤 Data export capabilities
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new BlogDashboard();
  dashboard.runCLI().catch(console.error);
}

export default BlogDashboard;
