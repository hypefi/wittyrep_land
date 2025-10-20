#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import KeywordPlanner from './keyword-planner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogPlanner {
  constructor() {
    this.keywordPlanner = new KeywordPlanner();
    this.plannedPosts = this.loadPlannedPosts();
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../config/automation.json');
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.log('Using default blog planning configuration');
    }
    
    return {
      postsPerWeek: 3,
      contentCategories: [
        'whatsapp_automation',
        'business_growth', 
        'industry_specific',
        'seasonal_topics',
        'case_studies',
        'tutorials',
        'comparisons'
      ],
      priorityKeywords: [
        'whatsapp automation for restaurants',
        'whatsapp lead generation strategies',
        'whatsapp customer service automation',
        'whatsapp business api integration',
        'whatsapp marketing automation tools',
        'whatsapp chatbot development',
        'whatsapp automation for ecommerce',
        'whatsapp automation for real estate',
        'whatsapp automation for healthcare',
        'whatsapp automation for education'
      ],
      seasonalTopics: {
        january: ['new year business planning', 'digital transformation goals', 'automation trends'],
        february: ['valentine marketing', 'customer retention strategies', 'lead generation'],
        march: ['spring business growth', 'quarterly planning', 'marketing automation'],
        april: ['tax season business tips', 'efficiency improvements', 'customer service'],
        may: ['mothers day marketing', 'summer preparation', 'business scaling'],
        june: ['mid year review', 'summer marketing', 'vacation automation'],
        july: ['independence day marketing', 'summer business strategies', 'customer engagement'],
        august: ['back to school marketing', 'fall preparation', 'business optimization'],
        september: ['fall business planning', 'q4 preparation', 'holiday marketing prep'],
        october: ['halloween marketing', 'q4 strategies', 'year end planning'],
        november: ['thanksgiving marketing', 'black friday preparation', 'holiday automation'],
        december: ['holiday marketing', 'year end review', 'new year planning']
      }
    };
  }

  loadPlannedPosts() {
    const plannedFile = path.join(__dirname, '../data/planned-posts.json');
    try {
      if (fs.existsSync(plannedFile)) {
        return JSON.parse(fs.readFileSync(plannedFile, 'utf8'));
      }
    } catch (error) {
      console.log('No existing planned posts file found, starting fresh');
    }
    return [];
  }

  savePlannedPosts() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const plannedFile = path.join(dataDir, 'planned-posts.json');
    fs.writeFileSync(plannedFile, JSON.stringify(this.plannedPosts, null, 2));
  }

  generateBlogPlan(weeks = 4) {
    console.log(`\n🚀 Generating ${weeks}-week blog plan...`);
    console.log('=' .repeat(50));
    
    const plan = [];
    const currentDate = new Date();
    
    for (let week = 0; week < weeks; week++) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(currentDate.getDate() + (week * 7));
      
      const weekPlan = this.generateWeekPlan(weekDate, week + 1);
      plan.push(weekPlan);
    }
    
    this.plannedPosts = plan;
    this.savePlannedPosts();
    
    this.printPlan(plan);
    return plan;
  }

  generateWeekPlan(weekDate, weekNumber) {
    const month = weekDate.toLocaleString('default', { month: 'long' }).toLowerCase();
    const seasonalTopics = this.config.seasonalTopics[month] || [];
    
    const weekPlan = {
      week: weekNumber,
      startDate: weekDate.toISOString().split('T')[0],
      endDate: new Date(weekDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      posts: []
    };

    // Generate 3 posts per week with different categories
    const categories = this.shuffleArray([...this.config.contentCategories]).slice(0, 3);
    
    categories.forEach((category, index) => {
      const postDate = new Date(weekDate);
      postDate.setDate(weekDate.getDate() + (index * 2)); // Spread posts across the week
      
      const post = this.generatePostForCategory(category, postDate, seasonalTopics);
      weekPlan.posts.push(post);
    });

    return weekPlan;
  }

  generatePostForCategory(category, postDate, seasonalTopics) {
    let keyword, title, description, priority;
    
    switch (category) {
      case 'whatsapp_automation':
        keyword = this.getRandomKeyword(['whatsapp automation', 'whatsapp chatbot', 'whatsapp business automation']);
        title = this.generateWhatsAppTitle(keyword);
        description = `Complete guide to ${keyword} for modern businesses`;
        priority = 'high';
        break;
        
      case 'business_growth':
        keyword = this.getRandomKeyword(['lead generation', 'customer acquisition', 'business automation']);
        title = this.generateBusinessTitle(keyword);
        description = `Proven strategies for ${keyword} using WhatsApp automation`;
        priority = 'high';
        break;
        
      case 'industry_specific':
        const industries = ['restaurants', 'real estate', 'ecommerce', 'healthcare', 'education'];
        const industry = this.getRandomKeyword(industries);
        keyword = `whatsapp automation for ${industry}`;
        title = this.generateIndustryTitle(industry);
        description = `How ${industry} businesses can leverage WhatsApp automation`;
        priority = 'medium';
        break;
        
      case 'seasonal_topics':
        keyword = this.getRandomKeyword(seasonalTopics);
        title = this.generateSeasonalTitle(keyword);
        description = `Seasonal ${keyword} strategies for business growth`;
        priority = 'medium';
        break;
        
      case 'case_studies':
        keyword = this.getRandomKeyword(['whatsapp automation success stories', 'business automation case studies']);
        title = this.generateCaseStudyTitle();
        description = `Real-world examples of successful WhatsApp automation implementation`;
        priority = 'medium';
        break;
        
      case 'tutorials':
        keyword = this.getRandomKeyword(['whatsapp automation tutorial', 'whatsapp chatbot setup', 'whatsapp business api']);
        title = this.generateTutorialTitle(keyword);
        description = `Step-by-step guide to ${keyword}`;
        priority = 'high';
        break;
        
      case 'comparisons':
        keyword = this.getRandomKeyword(['whatsapp automation tools comparison', 'best whatsapp automation software']);
        title = this.generateComparisonTitle();
        description = `Comprehensive comparison of WhatsApp automation solutions`;
        priority = 'low';
        break;
        
      default:
        keyword = this.getRandomKeyword(this.config.priorityKeywords);
        title = `Complete Guide to ${keyword}`;
        description = `Everything you need to know about ${keyword}`;
        priority = 'medium';
    }

    return {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      title,
      description,
      category,
      priority,
      scheduledDate: postDate.toISOString().split('T')[0],
      status: 'planned',
      estimatedWords: this.getEstimatedWords(category),
      difficulty: this.getDifficulty(category),
      tags: this.generateTags(keyword, category),
      outline: this.generateOutline(keyword, category)
    };
  }

  generateWhatsAppTitle(keyword) {
    const templates = [
      `How ${keyword} Can Transform Your Business in 2024`,
      `The Complete Guide to ${keyword} for Modern Businesses`,
      `Master ${keyword}: A Step-by-Step Implementation Guide`,
      `Why Every Business Needs ${keyword} in 2024`,
      `${keyword}: The Game-Changer Your Business Has Been Waiting For`
    ];
    return this.getRandomKeyword(templates);
  }

  generateBusinessTitle(keyword) {
    const templates = [
      `${this.getRandomNumber(5, 15)} Proven ${keyword} Strategies That Actually Work`,
      `Transform Your ${keyword} with WhatsApp Automation`,
      `The Ultimate ${keyword} Guide for Small Businesses`,
      `How to 3x Your ${keyword} Results with Smart Automation`,
      `${keyword} Made Simple: A Complete Implementation Guide`
    ];
    return this.getRandomKeyword(templates);
  }

  generateIndustryTitle(industry) {
    const templates = [
      `${industry.charAt(0).toUpperCase() + industry.slice(1)} WhatsApp Automation: Complete Implementation Guide`,
      `How ${industry.charAt(0).toUpperCase() + industry.slice(1)} Businesses Are Using WhatsApp to Grow`,
      `The ${industry.charAt(0).toUpperCase() + industry.slice(1)} Owner's Guide to WhatsApp Automation`,
      `WhatsApp Automation for ${industry.charAt(0).toUpperCase() + industry.slice(1)}: Success Stories & Strategies`,
      `Revolutionizing ${industry.charAt(0).toUpperCase() + industry.slice(1)} with WhatsApp Automation`
    ];
    return this.getRandomKeyword(templates);
  }

  generateSeasonalTitle(keyword) {
    const templates = [
      `${keyword} Strategies for Maximum Business Impact`,
      `How to Leverage ${keyword} for Seasonal Business Growth`,
      `The Complete ${keyword} Playbook for Business Owners`,
      `${keyword}: Your Secret Weapon for Business Success`,
      `Mastering ${keyword} for Competitive Advantage`
    ];
    return this.getRandomKeyword(templates);
  }

  generateCaseStudyTitle() {
    const templates = [
      `Real Success Stories: How Businesses Transformed with WhatsApp Automation`,
      `Case Study: From Manual to Automated - A Business Transformation Story`,
      `Success Stories: 5 Businesses That Mastered WhatsApp Automation`,
      `Case Studies: WhatsApp Automation ROI in Real Businesses`,
      `Real-World Results: WhatsApp Automation Success Stories`
    ];
    return this.getRandomKeyword(templates);
  }

  generateTutorialTitle(keyword) {
    const templates = [
      `How to Set Up ${keyword}: Complete Tutorial`,
      `Step-by-Step Guide to ${keyword} Implementation`,
      `${keyword} Tutorial: From Beginner to Expert`,
      `The Ultimate ${keyword} Setup Guide`,
      `Master ${keyword} in 30 Days: Complete Tutorial`
    ];
    return this.getRandomKeyword(templates);
  }

  generateComparisonTitle() {
    const templates = [
      `Best WhatsApp Automation Tools: Complete Comparison 2024`,
      `WhatsApp Automation Software: Which One is Right for You?`,
      `Top 10 WhatsApp Automation Tools Compared`,
      `WhatsApp Automation Platforms: Features, Pricing & Reviews`,
      `Choosing the Right WhatsApp Automation Tool: Complete Guide`
    ];
    return this.getRandomKeyword(templates);
  }

  generateTags(keyword, category) {
    const baseTags = ['whatsapp', 'automation', 'business'];
    const categoryTags = {
      'whatsapp_automation': ['chatbot', 'messaging', 'customer service'],
      'business_growth': ['marketing', 'sales', 'growth'],
      'industry_specific': ['industry', 'specialized', 'niche'],
      'seasonal_topics': ['seasonal', 'trending', 'timely'],
      'case_studies': ['success stories', 'examples', 'real world'],
      'tutorials': ['how-to', 'guide', 'tutorial'],
      'comparisons': ['review', 'comparison', 'tools']
    };
    
    const keywordWords = keyword.toLowerCase().split(' ').slice(0, 3);
    const categorySpecificTags = categoryTags[category] || [];
    
    return [...baseTags, ...keywordWords, ...categorySpecificTags].slice(0, 8);
  }

  generateOutline(keyword, category) {
    const baseOutline = [
      'Introduction and Problem Statement',
      'Why This Matters for Your Business',
      'Key Benefits and ROI',
      'Step-by-Step Implementation',
      'Real Examples and Case Studies',
      'Common Mistakes to Avoid',
      'Tools and Resources Needed',
      'Conclusion and Next Steps'
    ];

    // Customize outline based on category
    if (category === 'tutorials') {
      return [
        'Introduction and Prerequisites',
        'Step 1: Initial Setup',
        'Step 2: Configuration',
        'Step 3: Testing and Validation',
        'Step 4: Advanced Features',
        'Troubleshooting Common Issues',
        'Best Practices and Tips',
        'Conclusion and Next Steps'
      ];
    }

    if (category === 'comparisons') {
      return [
        'Introduction to WhatsApp Automation Tools',
        'Evaluation Criteria',
        'Tool 1: Features and Pricing',
        'Tool 2: Features and Pricing',
        'Tool 3: Features and Pricing',
        'Head-to-Head Comparison',
        'Recommendations by Business Type',
        'Conclusion and Final Verdict'
      ];
    }

    if (category === 'case_studies') {
      return [
        'Introduction to Success Stories',
        'Case Study 1: Small Business Transformation',
        'Case Study 2: Enterprise Implementation',
        'Case Study 3: Industry-Specific Success',
        'Key Success Factors',
        'Lessons Learned',
        'How to Replicate Success',
        'Conclusion and Action Steps'
      ];
    }

    return baseOutline;
  }

  getEstimatedWords(category) {
    const wordCounts = {
      'whatsapp_automation': 2000,
      'business_growth': 1800,
      'industry_specific': 2200,
      'seasonal_topics': 1600,
      'case_studies': 2500,
      'tutorials': 3000,
      'comparisons': 2800
    };
    return wordCounts[category] || 2000;
  }

  getDifficulty(category) {
    const difficulties = {
      'whatsapp_automation': 'intermediate',
      'business_growth': 'beginner',
      'industry_specific': 'intermediate',
      'seasonal_topics': 'beginner',
      'case_studies': 'intermediate',
      'tutorials': 'advanced',
      'comparisons': 'intermediate'
    };
    return difficulties[category] || 'intermediate';
  }

  getRandomKeyword(keywords) {
    return keywords[Math.floor(Math.random() * keywords.length)];
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  printPlan(plan) {
    console.log('\n📅 BLOG CONTENT PLAN');
    console.log('=' .repeat(50));
    
    plan.forEach(week => {
      console.log(`\n📆 Week ${week.week} (${week.startDate} - ${week.endDate})`);
      console.log('-'.repeat(30));
      
      week.posts.forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title}`);
        console.log(`   📝 Keyword: ${post.keyword}`);
        console.log(`   📊 Category: ${post.category}`);
        console.log(`   ⭐ Priority: ${post.priority}`);
        console.log(`   📅 Date: ${post.scheduledDate}`);
        console.log(`   📖 Words: ${post.estimatedWords}`);
        console.log(`   🎯 Difficulty: ${post.difficulty}`);
        console.log(`   🏷️  Tags: ${post.tags.join(', ')}`);
      });
    });
    
    const totalPosts = plan.reduce((sum, week) => sum + week.posts.length, 0);
    console.log(`\n📊 Total Posts Planned: ${totalPosts}`);
    console.log(`📅 Plan Duration: ${plan.length} weeks`);
    console.log(`📝 Average Posts/Week: ${(totalPosts / plan.length).toFixed(1)}`);
  }

  exportPlan(format = 'json') {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `blog-plan-${timestamp}.${format}`;
    const filepath = path.join(__dirname, '../data', filename);
    
    try {
      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      if (format === 'json') {
        fs.writeFileSync(filepath, JSON.stringify(this.plannedPosts, null, 2));
      } else if (format === 'csv') {
        const csv = this.convertToCSV();
        fs.writeFileSync(filepath, csv);
      }
      
      console.log(`\n✅ Blog plan exported to: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error exporting plan:', error);
      return null;
    }
  }

  convertToCSV() {
    const headers = ['Week', 'Date', 'Title', 'Keyword', 'Category', 'Priority', 'Words', 'Difficulty', 'Tags'];
    const rows = [];
    
    this.plannedPosts.forEach(week => {
      week.posts.forEach(post => {
        rows.push([
          week.week,
          post.scheduledDate,
          `"${post.title}"`,
          post.keyword,
          post.category,
          post.priority,
          post.estimatedWords,
          post.difficulty,
          `"${post.tags.join(', ')}"`
        ]);
      });
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  addCustomPost(postData) {
    const post = {
      id: `custom-${Date.now()}`,
      ...postData,
      status: 'planned',
      addedDate: new Date().toISOString()
    };
    
    // Add to current week or create new week
    if (this.plannedPosts.length === 0) {
      this.plannedPosts.push({
        week: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        posts: [post]
      });
    } else {
      const currentWeek = this.plannedPosts[this.plannedPosts.length - 1];
      currentWeek.posts.push(post);
    }
    
    this.savePlannedPosts();
    console.log(`✅ Custom post added: "${post.title}"`);
    return post;
  }

  markPostAsCompleted(postId) {
    let found = false;
    this.plannedPosts.forEach(week => {
      week.posts.forEach(post => {
        if (post.id === postId) {
          post.status = 'completed';
          post.completedDate = new Date().toISOString();
          found = true;
        }
      });
    });
    
    if (found) {
      this.savePlannedPosts();
      console.log(`✅ Post marked as completed: ${postId}`);
    } else {
      console.log(`❌ Post not found: ${postId}`);
    }
  }

  getUpcomingPosts(days = 7) {
    const upcoming = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    this.plannedPosts.forEach(week => {
      week.posts.forEach(post => {
        const postDate = new Date(post.scheduledDate);
        if (postDate <= cutoffDate && post.status === 'planned') {
          upcoming.push(post);
        }
      });
    });
    
    return upcoming.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }

  printUpcomingPosts(days = 7) {
    const upcoming = this.getUpcomingPosts(days);
    
    console.log(`\n📅 UPCOMING POSTS (Next ${days} days)`);
    console.log('=' .repeat(40));
    
    if (upcoming.length === 0) {
      console.log('No upcoming posts in the next 7 days.');
      return;
    }
    
    upcoming.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   📅 Date: ${post.scheduledDate}`);
      console.log(`   📝 Keyword: ${post.keyword}`);
      console.log(`   📊 Category: ${post.category}`);
      console.log(`   ⭐ Priority: ${post.priority}`);
    });
  }

  runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    
    switch (command) {
      case 'generate':
        const weeks = parseInt(param) || 4;
        this.generateBlogPlan(weeks);
        break;
        
      case 'export':
        const format = param || 'json';
        this.exportPlan(format);
        break;
        
      case 'upcoming':
        const days = parseInt(param) || 7;
        this.printUpcomingPosts(days);
        break;
        
      case 'add':
        console.log('To add a custom post, use the addCustomPost method in the script');
        break;
        
      case 'complete':
        const postId = param;
        if (postId) {
          this.markPostAsCompleted(postId);
        } else {
          console.log('Please provide a post ID to mark as completed');
        }
        break;
        
      case 'status':
        this.printStatus();
        break;
        
      default:
        console.log(`
🚀 Blog Planner - WittyReply Content Planning System

Usage:
  node blog-planner.js generate [weeks]     - Generate blog plan (default: 4 weeks)
  node blog-planner.js export [format]      - Export plan (json/csv, default: json)
  node blog-planner.js upcoming [days]      - Show upcoming posts (default: 7 days)
  node blog-planner.js complete [postId]    - Mark post as completed
  node blog-planner.js status               - Show planning status

Examples:
  node blog-planner.js generate 8           - Generate 8-week plan
  node blog-planner.js export csv           - Export as CSV
  node blog-planner.js upcoming 14          - Show next 14 days
  node blog-planner.js status               - Show current status

Features:
  ✨ Automated content planning
  📅 Weekly scheduling
  🎯 Category-based content strategy
  📊 Priority management
  📈 Progress tracking
  📤 Multiple export formats
        `);
    }
  }

  printStatus() {
    const totalPosts = this.plannedPosts.reduce((sum, week) => sum + week.posts.length, 0);
    const completedPosts = this.plannedPosts.reduce((sum, week) => 
      sum + week.posts.filter(post => post.status === 'completed').length, 0
    );
    const plannedPosts = totalPosts - completedPosts;
    
    console.log('\n📊 BLOG PLANNING STATUS');
    console.log('=' .repeat(30));
    console.log(`📅 Total Weeks Planned: ${this.plannedPosts.length}`);
    console.log(`📝 Total Posts: ${totalPosts}`);
    console.log(`✅ Completed: ${completedPosts}`);
    console.log(`📋 Planned: ${plannedPosts}`);
    console.log(`📈 Completion Rate: ${totalPosts > 0 ? ((completedPosts / totalPosts) * 100).toFixed(1) : 0}%`);
    
    if (this.plannedPosts.length > 0) {
      const nextWeek = this.plannedPosts[0];
      console.log(`\n📅 Next Week: ${nextWeek.startDate} - ${nextWeek.endDate}`);
      console.log(`📝 Posts Scheduled: ${nextWeek.posts.length}`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const planner = new BlogPlanner();
  planner.runCLI().catch(console.error);
}

export default BlogPlanner;
