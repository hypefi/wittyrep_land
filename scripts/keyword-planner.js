#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keyword categories for WhatsApp automation and business topics
const KEYWORD_CATEGORIES = {
  whatsapp_automation: {
    primary: [
      'whatsapp automation',
      'whatsapp chatbot',
      'whatsapp business automation',
      'whatsapp marketing automation',
      'whatsapp customer service automation'
    ],
    secondary: [
      'whatsapp lead generation',
      'whatsapp sales automation',
      'whatsapp workflow automation',
      'whatsapp integration',
      'whatsapp api automation'
    ],
    long_tail: [
      'how to automate whatsapp business',
      'whatsapp automation for small business',
      'whatsapp automation tools',
      'whatsapp automation examples',
      'whatsapp automation benefits'
    ]
  },
  business_growth: {
    primary: [
      'lead generation',
      'customer acquisition',
      'business automation',
      'digital marketing',
      'customer engagement'
    ],
    secondary: [
      'small business marketing',
      'business efficiency',
      'customer service automation',
      'sales automation',
      'marketing automation'
    ],
    long_tail: [
      'lead generation strategies for small business',
      'how to automate customer service',
      'business automation tools',
      'customer engagement strategies',
      'sales automation for small business'
    ]
  },
  industry_specific: {
    real_estate: [
      'real estate whatsapp automation',
      'property lead generation',
      'real estate marketing automation',
      'property management whatsapp',
      'real estate customer engagement'
    ],
    ecommerce: [
      'ecommerce whatsapp automation',
      'online store customer service',
      'ecommerce lead generation',
      'online business automation',
      'ecommerce customer engagement'
    ],
    services: [
      'service business automation',
      'consulting whatsapp automation',
      'professional services marketing',
      'service industry lead generation',
      'consulting business automation'
    ]
  }
};

// Seasonal and trending topics
const TRENDING_TOPICS = {
  q1: ['new year business planning', 'business automation trends', 'digital transformation'],
  q2: ['spring business growth', 'summer marketing strategies', 'mid-year business review'],
  q3: ['back-to-school marketing', 'fall business planning', 'holiday preparation'],
  q4: ['holiday marketing', 'year-end business review', 'new year preparation']
};

class KeywordPlanner {
  constructor() {
    this.keywords = [];
    this.usedKeywords = this.loadUsedKeywords();
    this.topicIdeas = [];
  }

  loadUsedKeywords() {
    try {
      const usedFile = path.join(__dirname, '../data/used-keywords.json');
      if (fs.existsSync(usedFile)) {
        return JSON.parse(fs.readFileSync(usedFile, 'utf8'));
      }
    } catch (error) {
      console.log('No existing used keywords file found, starting fresh');
    }
    return [];
  }

  saveUsedKeywords() {
    try {
      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const usedFile = path.join(dataDir, 'used-keywords.json');
      fs.writeFileSync(usedFile, JSON.stringify(this.usedKeywords, null, 2));
    } catch (error) {
      console.error('Error saving used keywords:', error);
    }
  }

  generateKeywordCombinations() {
    const combinations = [];
    
    // Mix primary and secondary keywords
    KEYWORD_CATEGORIES.whatsapp_automation.primary.forEach(primary => {
      KEYWORD_CATEGORIES.business_growth.secondary.forEach(secondary => {
        combinations.push(`${primary} ${secondary}`);
      });
    });

    // Add industry-specific combinations
    Object.values(KEYWORD_CATEGORIES.industry_specific).forEach(industry => {
      industry.forEach(industryKeyword => {
        KEYWORD_CATEGORIES.business_growth.primary.forEach(business => {
          combinations.push(`${industryKeyword} ${business}`);
        });
      });
    });

    // Add seasonal topics
    const currentQuarter = this.getCurrentQuarter();
    TRENDING_TOPICS[currentQuarter].forEach(topic => {
      KEYWORD_CATEGORIES.whatsapp_automation.primary.forEach(whatsapp => {
        combinations.push(`${whatsapp} ${topic}`);
      });
    });

    return combinations;
  }

  getCurrentQuarter() {
    const month = new Date().getMonth();
    if (month <= 2) return 'q1';
    if (month <= 5) return 'q2';
    if (month <= 8) return 'q3';
    return 'q4';
  }

  generateTopicIdeas(count = 10) {
    const combinations = this.generateKeywordCombinations();
    const unusedCombinations = combinations.filter(combo => 
      !this.usedKeywords.includes(combo)
    );

    // Shuffle and select unique topics
    const shuffled = this.shuffleArray([...unusedCombinations]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // Generate detailed topic ideas
    this.topicIdeas = selected.map(keyword => {
      const topic = this.generateTopicFromKeyword(keyword);
      return {
        keyword: keyword,
        title: topic.title,
        description: topic.description,
        outline: topic.outline,
        difficulty: topic.difficulty,
        estimatedWords: topic.estimatedWords
      };
    });

    return this.topicIdeas;
  }

  generateTopicFromKeyword(keyword) {
    const templates = [
      {
        pattern: /whatsapp automation/i,
        title: `How WhatsApp Automation Can ${this.getRandomBenefit()} Your Business`,
        description: `Discover how WhatsApp automation can transform your business operations and ${this.getRandomBenefit().toLowerCase()} your results.`,
        difficulty: 'intermediate',
        estimatedWords: 1500
      },
      {
        pattern: /lead generation/i,
        title: `${this.getRandomNumber(5, 15)} WhatsApp Lead Generation Strategies That Actually Work`,
        description: `Learn proven WhatsApp lead generation techniques that can help you acquire ${this.getRandomNumber(20, 100)}+ new customers monthly.`,
        difficulty: 'beginner',
        estimatedWords: 2000
      },
      {
        pattern: /customer service/i,
        title: `Transform Your Customer Service with WhatsApp Automation: A Complete Guide`,
        description: `See how businesses are using WhatsApp automation to improve customer satisfaction and reduce response times.`,
        difficulty: 'intermediate',
        estimatedWords: 1800
      },
      {
        pattern: /small business/i,
        title: `WhatsApp Automation for Small Business: ${this.getRandomNumber(3, 7)} Game-Changing Strategies`,
        description: `Small business owners, discover how WhatsApp automation can level the playing field and boost your growth.`,
        difficulty: 'beginner',
        estimatedWords: 1600
      }
    ];

    // Find matching template
    const template = templates.find(t => t.pattern.test(keyword)) || templates[0];
    
    return {
      title: template.title,
      description: template.description,
      outline: this.generateOutline(keyword),
      difficulty: template.difficulty,
      estimatedWords: template.estimatedWords
    };
  }

  generateOutline(keyword) {
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

    // Customize outline based on keyword
    if (keyword.includes('lead generation')) {
      baseOutline.splice(2, 0, 'Lead Generation Statistics and Trends');
      baseOutline.splice(4, 0, 'Lead Nurturing Strategies');
    }

    if (keyword.includes('customer service')) {
      baseOutline.splice(2, 0, 'Customer Service Metrics to Track');
      baseOutline.splice(4, 0, 'Response Time Optimization');
    }

    return baseOutline;
  }

  getRandomBenefit() {
    const benefits = [
      'Revolutionize', 'Transform', 'Accelerate', 'Optimize', 'Streamline',
      'Boost', 'Enhance', 'Improve', 'Maximize', 'Scale'
    ];
    return benefits[Math.floor(Math.random() * benefits.length)];
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

  markKeywordAsUsed(keyword) {
    if (!this.usedKeywords.includes(keyword)) {
      this.usedKeywords.push(keyword);
      this.saveUsedKeywords();
    }
  }

  exportKeywords(filename = null) {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `keywords-${timestamp}.json`;
    const outputFile = filename || path.join(__dirname, '../data', defaultFilename);
    
    try {
      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const exportData = {
        generated: timestamp,
        topics: this.topicIdeas,
        totalTopics: this.topicIdeas.length,
        categories: Object.keys(KEYWORD_CATEGORIES)
      };
      
      fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
      console.log(`Keywords exported to: ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.error('Error exporting keywords:', error);
      return null;
    }
  }

  printTopicIdeas() {
    console.log('\n🎯 Generated Topic Ideas:\n');
    this.topicIdeas.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.title}`);
      console.log(`   Keyword: ${topic.keyword}`);
      console.log(`   Description: ${topic.description}`);
      console.log(`   Difficulty: ${topic.difficulty} | Est. Words: ${topic.estimatedWords}`);
      console.log(`   Outline: ${topic.outline.join(' → ')}`);
      console.log('');
    });
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const planner = new KeywordPlanner();
  const count = process.argv[2] ? parseInt(process.argv[2]) : 10;
  
  console.log('🚀 WhatsApp Business Keyword Planner');
  console.log('=====================================\n');
  
  const topics = planner.generateTopicIdeas(count);
  planner.printTopicIdeas();
  
  const exportFile = planner.exportKeywords();
  if (exportFile) {
    console.log(`\n✅ Topics exported to: ${exportFile}`);
  }
  
  console.log('\n💡 Use these topics to generate daily blog posts!');
}

export default KeywordPlanner;
