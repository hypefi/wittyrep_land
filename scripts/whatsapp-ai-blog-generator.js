#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BlogPostGenerator from './blog-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppAIBlogGenerator {
  constructor() {
    this.blogGenerator = new BlogPostGenerator();
    this.keywordData = this.loadKeywordData();
    this.generatedArticles = [];
  }

  loadKeywordData() {
    try {
      const csvPath = path.join(__dirname, '../wittyreply_seo/whatsapp_ai_ENHANCED.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      const keywords = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith(',')) {
          const values = line.split(',');
          if (values.length >= 6) {
            keywords.push({
              keyword: values[0].trim(),
              competition: values[1].trim(),
              competitionScore: parseFloat(values[2]) || 0,
              opportunityScore: parseFloat(values[3]) || 0,
              difficultyScore: parseFloat(values[4]) || 0,
              recommendation: values[5].trim()
            });
          }
        }
      }

      console.log(`📊 Loaded ${keywords.length} keywords from CSV`);
      return keywords;
    } catch (error) {
      console.error('Error loading keyword data:', error);
      return [];
    }
  }

  prioritizeKeywords() {
    // Group keywords by priority
    const prioritized = {
      high: this.keywordData.filter(k => k.recommendation === 'MEDIUM_PRIORITY'),
      medium: this.keywordData.filter(k => k.recommendation === 'LONG_TERM'),
      low: this.keywordData.filter(k => k.recommendation === 'CONSIDER')
    };

    // Sort by opportunity score within each group
    Object.keys(prioritized).forEach(priority => {
      prioritized[priority].sort((a, b) => b.opportunityScore - a.opportunityScore);
    });

    console.log(`🎯 Priority breakdown:`);
    console.log(`   High Priority (MEDIUM_PRIORITY): ${prioritized.high.length} keywords`);
    console.log(`   Medium Priority (LONG_TERM): ${prioritized.medium.length} keywords`);
    console.log(`   Low Priority (CONSIDER): ${prioritized.low.length} keywords`);

    return prioritized;
  }

  async generateArticleForKeyword(keywordData, options = {}) {
    console.log(`\n🚀 Generating article for: "${keywordData.keyword}"`);
    console.log(`   📊 Opportunity Score: ${keywordData.opportunityScore}`);
    console.log(`   🎯 Competition: ${keywordData.competition} (${keywordData.competitionScore})`);
    console.log(`   💪 Difficulty: ${keywordData.difficultyScore}`);

    try {
      // Create enhanced topic data for the blog generator
      const topic = this.createTopicFromKeyword(keywordData, options);
      
      // Generate the blog post
      const postData = await this.blogGenerator.generateBlogPost(topic);
      
      if (postData) {
        // Save the blog post
        const filepath = this.blogGenerator.saveBlogPost(postData);
        
        if (filepath) {
          this.generatedArticles.push({
            keyword: keywordData.keyword,
            title: postData.title,
            filepath: filepath,
            opportunityScore: keywordData.opportunityScore,
            isAIGenerated: postData.isAIGenerated,
            wordCount: postData.wordCount || 0,
            publishDate: postData.publishDate
          });

          console.log(`✅ Successfully generated: "${postData.title}"`);
          console.log(`   📁 File: ${path.basename(filepath)}`);
          console.log(`   📝 Words: ${postData.wordCount || 'N/A'}`);
          console.log(`   🤖 AI Generated: ${postData.isAIGenerated ? 'Yes' : 'No'}`);
          
          return postData;
        }
      }
      
      throw new Error('Failed to generate or save blog post');
      
    } catch (error) {
      console.error(`❌ Error generating article for "${keywordData.keyword}":`, error.message);
      return null;
    }
  }

  createTopicFromKeyword(keywordData, options = {}) {
    const keyword = keywordData.keyword;
    const difficulty = this.mapDifficultyScore(keywordData.difficultyScore);
    const industry = this.extractIndustryFromKeyword(keyword);
    
    // Create title variations based on keyword
    const title = this.generateTitleForKeyword(keyword, keywordData.opportunityScore);
    const description = this.generateDescriptionForKeyword(keyword, keywordData);
    const outline = this.generateOutlineForKeyword(keyword);

    return {
      title: title,
      keyword: keyword,
      description: description,
      outline: outline,
      difficulty: difficulty,
      estimatedWords: options.targetWords || 2000,
      industry: industry,
      opportunityScore: keywordData.opportunityScore,
      competition: keywordData.competition,
      ...options
    };
  }

  generateTitleForKeyword(keyword, opportunityScore) {
    const titleTemplates = {
      'whatsapp automation ai tool': [
        'Top WhatsApp Automation AI Tools That Transform Business Communication',
        'Revolutionary WhatsApp AI Tools: Automate Your Customer Service in 2024',
        'Best WhatsApp Automation AI Tools for Smart Business Growth'
      ],
      'whatsapp marketing automation software': [
        'WhatsApp Marketing Automation Software: Complete Business Guide',
        'Powerful WhatsApp Marketing Automation Tools for Modern Businesses',
        'Transform Your Marketing with WhatsApp Automation Software'
      ],
      'best whatsapp automation software': [
        'Best WhatsApp Automation Software: Expert Reviews & Comparisons',
        'Top-Rated WhatsApp Automation Software for Business Success',
        'Ultimate Guide to Choosing WhatsApp Automation Software'
      ],
      'whatsapp automation tools for business': [
        'Essential WhatsApp Automation Tools Every Business Needs',
        'Business WhatsApp Automation Tools: Features & Benefits Guide',
        'WhatsApp Business Automation Tools That Drive Results'
      ],
      'whatsapp ai chat automation': [
        'WhatsApp AI Chat Automation: Complete Implementation Guide',
        'Smart WhatsApp AI Chatbots for Automated Customer Service',
        'WhatsApp AI Chat Automation: Boost Efficiency & Sales'
      ],
      'whatsapp business automation software': [
        'WhatsApp Business Automation Software: Professional Solutions',
        'Enterprise WhatsApp Automation Software for Growing Companies',
        'WhatsApp Business Automation: Software Comparison & Guide'
      ]
    };

    // Check for exact match first
    if (titleTemplates[keyword]) {
      return titleTemplates[keyword][Math.floor(Math.random() * titleTemplates[keyword].length)];
    }

    // Generate dynamic title based on keyword patterns
    if (keyword.includes('ai')) {
      return `AI-Powered ${this.capitalizeKeyword(keyword)}: Transform Your Business`;
    } else if (keyword.includes('automation')) {
      return `Master ${this.capitalizeKeyword(keyword)} for Business Growth`;
    } else if (keyword.includes('tools')) {
      return `Essential ${this.capitalizeKeyword(keyword)} for Modern Businesses`;
    } else {
      return `Complete Guide to ${this.capitalizeKeyword(keyword)}`;
    }
  }

  generateDescriptionForKeyword(keyword, keywordData) {
    const descriptions = {
      'whatsapp automation ai tool': 'Discover powerful WhatsApp AI automation tools that streamline customer service and boost business efficiency.',
      'whatsapp marketing automation software': 'Transform your marketing strategy with advanced WhatsApp automation software designed for business growth.',
      'best whatsapp automation software': 'Compare top WhatsApp automation software solutions and find the perfect fit for your business needs.',
      'whatsapp automation tools for business': 'Explore essential WhatsApp automation tools that help businesses scale customer communication effectively.',
      'whatsapp ai chat automation': 'Learn how WhatsApp AI chat automation can revolutionize your customer service and increase satisfaction rates.',
      'whatsapp business automation software': 'Professional WhatsApp business automation software solutions for enterprises and growing companies.'
    };

    return descriptions[keyword] || 
           `Comprehensive guide to ${keyword} for modern businesses. Learn implementation strategies and best practices.`;
  }

  generateOutlineForKeyword(keyword) {
    const baseOutlines = {
      'ai': [
        'Introduction to AI-Powered WhatsApp Automation',
        'Key Benefits of AI Integration',
        'Top AI WhatsApp Tools & Features',
        'Implementation Best Practices',
        'Real-World Success Stories',
        'Getting Started with AI Automation',
        'Future of AI in WhatsApp Business',
        'Conclusion & Next Steps'
      ],
      'software': [
        'WhatsApp Automation Software Overview',
        'Essential Features to Look For',
        'Top Software Solutions Comparison',
        'Integration & Setup Guide',
        'Cost-Benefit Analysis',
        'Common Implementation Challenges',
        'Success Metrics & ROI',
        'Choosing the Right Solution'
      ],
      'tools': [
        'Essential WhatsApp Automation Tools',
        'Tool Categories & Use Cases',
        'Feature Comparison Matrix',
        'Setup & Configuration Guide',
        'Advanced Automation Workflows',
        'Measuring Tool Effectiveness',
        'Troubleshooting Common Issues',
        'Scaling Your Automation Strategy'
      ],
      'business': [
        'WhatsApp Business Automation Fundamentals',
        'Strategic Benefits for Businesses',
        'Implementation Roadmap',
        'Team Training & Adoption',
        'Customer Experience Optimization',
        'Performance Monitoring',
        'Scaling Automation Processes',
        'Long-term Success Strategies'
      ]
    };

    // Find the best matching outline
    for (const [key, outline] of Object.entries(baseOutlines)) {
      if (keyword.includes(key)) {
        return outline;
      }
    }

    // Default outline
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

  capitalizeKeyword(keyword) {
    return keyword.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  mapDifficultyScore(score) {
    if (score <= 50) return 'beginner';
    if (score <= 70) return 'intermediate';
    return 'advanced';
  }

  extractIndustryFromKeyword(keyword) {
    if (keyword.includes('business') || keyword.includes('enterprise')) return 'business automation';
    if (keyword.includes('marketing')) return 'digital marketing';
    if (keyword.includes('ai')) return 'artificial intelligence';
    if (keyword.includes('software')) return 'software solutions';
    return 'business automation';
  }

  async generateBatchArticles(priorityLevel = 'high', maxArticles = 5, options = {}) {
    const prioritized = this.prioritizeKeywords();
    const keywordsToProcess = prioritized[priorityLevel].slice(0, maxArticles);

    console.log(`\n🚀 Starting batch generation for ${priorityLevel} priority keywords`);
    console.log(`📝 Generating ${keywordsToProcess.length} articles...\n`);

    const results = [];

    for (let i = 0; i < keywordsToProcess.length; i++) {
      const keywordData = keywordsToProcess[i];
      console.log(`\n📝 Progress: ${i + 1}/${keywordsToProcess.length}`);
      
      const result = await this.generateArticleForKeyword(keywordData, options);
      results.push(result);

      // Add delay between generations to avoid API rate limits
      if (i < keywordsToProcess.length - 1) {
        console.log('⏱️  Waiting 2 seconds before next generation...');
        await this.delay(2000);
      }
    }

    return results.filter(result => result !== null);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateSummaryReport() {
    if (this.generatedArticles.length === 0) {
      console.log('\n📊 No articles generated yet.');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ARTICLE GENERATION SUMMARY REPORT');
    console.log('='.repeat(60));

    console.log(`\n✅ Total Articles Generated: ${this.generatedArticles.length}`);
    
    const aiGenerated = this.generatedArticles.filter(a => a.isAIGenerated).length;
    const templateGenerated = this.generatedArticles.length - aiGenerated;
    
    console.log(`🤖 AI Generated: ${aiGenerated}`);
    console.log(`📝 Template Generated: ${templateGenerated}`);

    const totalWords = this.generatedArticles.reduce((sum, a) => sum + (a.wordCount || 0), 0);
    const avgWords = totalWords / this.generatedArticles.length;
    console.log(`📊 Total Words: ${totalWords.toLocaleString()}`);
    console.log(`📈 Average Words per Article: ${Math.round(avgWords)}`);

    const avgOpportunity = this.generatedArticles.reduce((sum, a) => sum + a.opportunityScore, 0) / this.generatedArticles.length;
    console.log(`🎯 Average Opportunity Score: ${avgOpportunity.toFixed(1)}`);

    console.log('\n📝 Generated Articles:');
    this.generatedArticles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   🔑 Keyword: ${article.keyword}`);
      console.log(`   📊 Opportunity: ${article.opportunityScore}`);
      console.log(`   📝 Words: ${article.wordCount || 'N/A'}`);
      console.log(`   🤖 AI: ${article.isAIGenerated ? 'Yes' : 'No'}`);
      console.log(`   📁 File: ${path.basename(article.filepath)}`);
    });

    console.log('\n' + '='.repeat(60));
  }

  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    console.log('🤖 WhatsApp AI Blog Generator');
    console.log('=' .repeat(50));

    switch (command) {
      case 'analyze':
        this.prioritizeKeywords();
        break;

      case 'generate':
        const priority = args[1] || 'high';
        const count = parseInt(args[2]) || 3;
        const targetWords = parseInt(args[3]) || 2000;
        
        await this.generateBatchArticles(priority, count, { targetWords });
        this.generateSummaryReport();
        break;

      case 'single':
        const keyword = args[1];
        if (!keyword) {
          console.log('❌ Please provide a keyword: npm run whatsapp-ai single "keyword"');
          return;
        }
        
        const keywordData = this.keywordData.find(k => k.keyword.toLowerCase().includes(keyword.toLowerCase()));
        if (!keywordData) {
          console.log(`❌ Keyword "${keyword}" not found in CSV data`);
          return;
        }
        
        await this.generateArticleForKeyword(keywordData);
        this.generateSummaryReport();
        break;

      case 'all':
        console.log('🚀 Generating articles for ALL priority levels...\n');
        
        // Generate high priority first
        await this.generateBatchArticles('high', 10, { targetWords: 2000 });
        await this.delay(5000); // Longer delay between batches
        
        // Then medium priority
        await this.generateBatchArticles('medium', 5, { targetWords: 1800 });
        await this.delay(5000);
        
        // Finally low priority
        await this.generateBatchArticles('low', 3, { targetWords: 1500 });
        
        this.generateSummaryReport();
        break;

      default:
        console.log(`
Usage: node whatsapp-ai-blog-generator.js <command> [options]

Commands:
  analyze                    - Analyze and prioritize keywords
  generate [priority] [count] [words] - Generate articles (default: high, 3, 2000)
  single <keyword>          - Generate single article for specific keyword
  all                       - Generate articles for all priority levels
  help                      - Show this help message

Examples:
  node whatsapp-ai-blog-generator.js analyze
  node whatsapp-ai-blog-generator.js generate high 5 2000
  node whatsapp-ai-blog-generator.js single "whatsapp automation ai tool"
  node whatsapp-ai-blog-generator.js all

Priority Levels:
  high   - MEDIUM_PRIORITY keywords (92.5 opportunity score)
  medium - LONG_TERM keywords (87.5 opportunity score)  
  low    - CONSIDER keywords (72.5-77.5 opportunity score)
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new WhatsAppAIBlogGenerator();
  generator.runCLI().catch(console.error);
}

export default WhatsAppAIBlogGenerator;
