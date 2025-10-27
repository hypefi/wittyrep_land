#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AIContentGenerator from './ai-title-generator.js';
import ImageGenerator from './image-generator.js';
import { getKeywords } from './keyword-config.js';
import InternalLinker from './internal-linker.js';
import ConfigManager from './config-manager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogPostGenerator {
  constructor(config = {}) {
    this.configManager = new ConfigManager();
    this.config = config.config || this.configManager.getConfig();
    this.wittyReplyMode = this.config.features?.wittyReplyBranding || false;
    this.enhancementLevel = this.config.features?.contentEnhancement || 'standard';
    this.templates = this.loadTemplates();
    this.contentBlocks = this.loadContentBlocks();
    this.enhancementData = this.loadEnhancementData();
    this.aiContentGenerator = new AIContentGenerator();
    this.imageGenerator = new ImageGenerator();
    this.internalLinker = new InternalLinker();
    this.keywordData = [];
    this.generatedArticles = [];
  }

  loadTemplates() {
    return {
      html: fs.readFileSync(path.join(__dirname, '../templates/blog-template.html'), 'utf8'),
      meta: fs.readFileSync(path.join(__dirname, '../templates/meta-template.html'), 'utf8')
    };
  }

  loadContentBlocks() {
    return {
      introductions: [
        "In today's fast-paced digital world, businesses need every advantage they can get to stay competitive and grow their customer base.",
        "As customer expectations continue to rise, businesses are looking for innovative ways to streamline operations and improve customer satisfaction.",
        "The digital transformation of business communication has made WhatsApp automation an essential tool for modern businesses.",
        "With the increasing demand for instant responses and personalized service, WhatsApp automation has become a game-changer for businesses of all sizes."
      ],
      benefits: [
        "Save 20+ hours per week on repetitive customer service tasks",
        "Improve response times from hours to seconds",
        "Increase customer satisfaction scores by 40%+",
        "Generate 3x more qualified leads through automated nurturing",
        "Reduce customer service costs by up to 60%",
        "Scale your business without proportional staff increases",
        "Provide 24/7 customer support without overtime costs",
        "Track and optimize every customer interaction"
      ],
      statistics: [
        "WhatsApp has over 2 billion active users worldwide",
        "90% of messages are read within 3 minutes",
        "Businesses using WhatsApp automation see 3x higher engagement rates",
        "Automated responses can reduce customer wait times by 95%",
        "WhatsApp Business API has 99.9% delivery rate",
        "Companies using automation report 40% increase in customer satisfaction"
      ],
      examples: [
        "Real estate agents automatically follow up with property inquiries",
        "E-commerce stores send order confirmations and tracking updates",
        "Service businesses schedule appointments and send reminders",
        "Restaurants take orders and confirm reservations automatically",
        "Consultants qualify leads and schedule discovery calls",
        "Healthcare providers send appointment reminders and health tips"
      ],
      tips: [
        "Start with simple automations and gradually increase complexity",
        "Always include a human handoff option for complex inquiries",
        "Test your automation flows with real customers before full deployment",
        "Monitor response rates and adjust messaging based on performance",
        "Use personalization tokens to make messages feel more human",
        "Regularly update your automation content to stay relevant"
      ],
      conclusions: [
        "WhatsApp automation isn't just a nice-to-have—it's becoming essential for businesses that want to compete in today's digital marketplace.",
        "The businesses that embrace WhatsApp automation today will be the ones leading their industries tomorrow.",
        "Don't let manual processes hold your business back. Start your WhatsApp automation journey today.",
        "The ROI of WhatsApp automation is clear: better customer service, increased efficiency, and sustainable business growth."
      ]
    };
  }

  loadEnhancementData() {
    const baseEnhancements = {
      heroSections: {
        'ai tool': {
          icon: '🤖',
          gradient: 'from-blue-600 to-purple-600',
          bgPattern: 'circuit',
          stats: ['50+ AI Tools Reviewed', '95% Accuracy Rate', '24/7 Automation'],
          visual: 'ai-dashboard'
        },
        'software': {
          icon: '⚙️',
          gradient: 'from-green-600 to-teal-600', 
          bgPattern: 'grid',
          stats: ['100+ Software Solutions', '99.9% Uptime', '3-Min Setup'],
          visual: 'software-interface'
        },
        'marketing': {
          icon: '📈',
          gradient: 'from-pink-600 to-rose-600',
          bgPattern: 'waves',
          stats: ['300% ROI Increase', '10M+ Messages Sent', '50K+ Businesses'],
          visual: 'marketing-dashboard'
        },
        'business': {
          icon: '💼',
          gradient: 'from-indigo-600 to-blue-600',
          bgPattern: 'dots',
          stats: ['500+ Businesses Served', '40% Cost Reduction', '24/7 Support'],
          visual: 'business-metrics'
        },
        'automation': {
          icon: '⚡',
          gradient: 'from-yellow-600 to-orange-600',
          bgPattern: 'hexagon',
          stats: ['1000+ Workflows', '80% Time Saved', 'Zero Downtime'],
          visual: 'automation-flow'
        }
      }
    };

    const wittyReplyEnhancements = {
      wittyReplyInfo: {
        productName: "WittyReply",
        tagline: "AI-Powered WhatsApp Automation Solution",
        description: "WittyReply is the leading AI-powered WhatsApp automation platform that helps businesses automate customer interactions, generate leads, and scale their operations with intelligent AI agents.",
        website: "https://wittyreply.com",
        keyFeatures: [
          "AI-Powered Conversations",
          "Multi-Agent System", 
          "Lead Generation Automation",
          "Customer Service Automation",
          "Sales Process Automation",
          "Analytics & Reporting",
          "Easy Integration",
          "24/7 Availability"
        ],
        benefits: [
          "Increase lead generation by 300%",
          "Reduce response time to under 30 seconds", 
          "Handle unlimited conversations simultaneously",
          "Integrate with 100+ business tools",
          "Scale without hiring additional staff",
          "Improve customer satisfaction scores",
          "Generate qualified leads automatically",
          "Reduce operational costs by 60%"
        ],
        useCases: [
          "Real Estate Lead Generation",
          "E-commerce Customer Support", 
          "Restaurant Order Management",
          "Healthcare Appointment Scheduling",
          "Education Course Inquiries",
          "Professional Services Consultation",
          "Event Management",
          "SaaS Customer Onboarding"
        ],
        competitors: [
          "Chatfuel",
          "ManyChat", 
          "Landbot",
          "Tidio",
          "Intercom",
          "Zendesk Chat"
        ],
        pricing: {
          starter: "$29/month",
          professional: "$79/month", 
          enterprise: "Custom pricing"
        }
      }
    };

    return this.wittyReplyMode 
      ? { ...baseEnhancements, ...wittyReplyEnhancements }
      : baseEnhancements;
  }

  async generateBlogPost(topic, options = {}) {
    try {
      console.log(`🤖 Generating complete AI article for: ${topic.keyword}`);
      
      // Generate complete article with OpenAI
      const targetWords = options.targetWords || this.config.generation?.targetWords || 4000;
      const article = await this.aiContentGenerator.generateCompleteArticle(topic.keyword, {
        industry: this.getIndustryFromKeyword(topic.keyword),
        difficulty: topic.difficulty || 'intermediate',
        targetWords: targetWords
      });

      // Structure the content for our template
      const structuredContent = this.aiContentGenerator.generateStructuredHTML(article);

      // Enhance content with WittyReply branding if enabled
      let enhancedContent = structuredContent;
      if (this.wittyReplyMode && this.enhancementLevel !== 'none') {
        enhancedContent = this.enhanceContentWithWittyReply(structuredContent, topic.keyword);
      }

      // Generate images for the blog post
      let images = [];
      if (this.config.features?.imageGeneration) {
        console.log(`🎨 Generating images for blog post...`);
        images = await this.imageGenerator.generateBlogImages({
          title: article.title,
          keyword: article.keyword,
          description: article.description
        }, enhancedContent);
      }

      // Integrate images into content
      const contentWithImages = this.integrateImagesIntoContent(enhancedContent, images);

      // Generate internal links
      let internalLinks = [];
      if (this.config.features?.internalLinking) {
        console.log(`🔗 Generating internal links...`);
        internalLinks = this.internalLinker.generateInternalLinks({
          title: article.title,
          keywords: [article.keyword],
          slug: this.generateSlug(article.title)
        }, 8);

        // Insert internal links into content
        const contentWithLinks = this.internalLinker.insertInternalLinks(contentWithImages, internalLinks);
      }

      const postData = {
        title: article.title,
        keyword: article.keyword,
        description: article.description,
        outline: article.outline,
        difficulty: topic.difficulty || 'intermediate',
        estimatedWords: article.wordCount,
        publishDate: new Date().toISOString().split('T')[0],
        slug: this.generateSlug(article.title),
        content: contentWithImages,
        meta: this.generateMeta({
          title: article.title,
          description: article.description,
          keyword: article.keyword
        }),
        isAIGenerated: true,
        wordCount: article.wordCount,
        rawContent: article.content,
        images: images,
        hasImages: images.length > 0,
        internalLinks: internalLinks,
        linkCount: internalLinks.length,
        wittyReplyMode: this.wittyReplyMode,
        enhancementLevel: this.enhancementLevel
      };

      console.log(`✅ AI article generated: "${article.title}" (${article.wordCount} words, ${images.length} images)`);
      return postData;
      
    } catch (error) {
      console.error('❌ Error generating AI content:', error.message);
      throw error; // Re-throw error instead of falling back to templates
    }
  }

  // CSV keyword loading functionality (from whatsapp-ai-blog-generator.js)
  loadKeywordsFromCSV(csvPath) {
    try {
      const fullPath = path.join(__dirname, '..', csvPath);
      const csvContent = fs.readFileSync(fullPath, 'utf8');
      
      const lines = csvContent.split('\n');
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
      this.keywordData = keywords;
      return keywords;
    } catch (error) {
      console.error('Error loading keyword data:', error);
      return [];
    }
  }

  // WittyReply content enhancement methods
  enhanceContentWithWittyReply(content, keyword) {
    let enhancedContent = content;

    // Add WittyReply mentions based on keyword context
    if (keyword.includes('best') || keyword.includes('platform') || keyword.includes('comparison')) {
      enhancedContent = this.addWittyReplyComparison(content);
    } else if (keyword.includes('free') || keyword.includes('trial')) {
      enhancedContent = this.addWittyReplyFreeTrial(content);
    } else if (keyword.includes('create') || keyword.includes('how to') || keyword.includes('tutorial')) {
      enhancedContent = this.addWittyReplyTutorial(content);
    } else if (keyword.includes('ai') || keyword.includes('chatbot') || keyword.includes('bot')) {
      enhancedContent = this.addWittyReplyAI(content);
    } else {
      enhancedContent = this.addWittyReplyGeneral(content);
    }

    return enhancedContent;
  }

  addWittyReplyComparison(content) {
    const wittyReplyInfo = this.enhancementData.wittyReplyInfo;
    const comparisonSection = `

## Why WittyReply Leads the WhatsApp Automation Market

When comparing WhatsApp automation platforms, **WittyReply** consistently emerges as the top choice for businesses serious about AI-powered communication. Here's why:

### Advanced AI Technology
Unlike basic chatbot platforms, WittyReply uses sophisticated AI agents that understand context, learn from conversations, and provide intelligent responses that feel genuinely human.

### Multi-Agent System
WittyReply's unique multi-agent architecture allows you to deploy specialized AI agents for different business functions:
- **Lead Generation Agent**: Qualifies prospects and captures contact information
- **Customer Service Agent**: Handles inquiries and provides support
- **Sales Agent**: Guides prospects through your sales funnel

### Key Differentiators
- **${wittyReplyInfo.benefits[0]}**
- **${wittyReplyInfo.benefits[1]}**
- **${wittyReplyInfo.benefits[2]}**

Ready to experience the difference? [Start your free trial with WittyReply](${wittyReplyInfo.website}) today.`;

    return content + comparisonSection;
  }

  addWittyReplyFreeTrial(content) {
    const wittyReplyInfo = this.enhancementData.wittyReplyInfo;
    const trialSection = `

## Get Started with WittyReply Today

Experience the power of AI-powered WhatsApp automation with WittyReply's free trial. No credit card required, no setup fees, just results.

### What You Get in Your Free Trial:
- **Full access to all AI agents**
- **Up to 1,000 messages per month**
- **Complete analytics dashboard**
- **24/7 customer support**
- **Easy integration with your existing tools**

### Pricing That Scales With You:
- **Starter Plan**: ${wittyReplyInfo.pricing.starter} - Perfect for small businesses
- **Professional Plan**: ${wittyReplyInfo.pricing.professional} - Advanced features for growing companies
- **Enterprise Plan**: ${wittyReplyInfo.pricing.enterprise} - Custom solutions for large organizations

[Start Your Free Trial Now](${wittyReplyInfo.website}) and see why thousands of businesses trust WittyReply for their WhatsApp automation needs.`;

    return content + trialSection;
  }

  addWittyReplyTutorial(content) {
    const wittyReplyInfo = this.enhancementData.wittyReplyInfo;
    const tutorialSection = `

## How to Set Up WittyReply in Minutes

Getting started with WittyReply is incredibly simple. Here's your step-by-step guide:

### Step 1: Create Your Account
Visit [WittyReply.com](${wittyReplyInfo.website}) and sign up for your free account. No credit card required.

### Step 2: Connect Your WhatsApp Business Account
WittyReply integrates seamlessly with WhatsApp Business API. Follow our guided setup process.

### Step 3: Configure Your AI Agents
Choose from pre-built agent templates or create custom agents for your specific needs:
- Lead generation workflows
- Customer service automation
- Sales process optimization

### Step 4: Test and Launch
Test your automation flows with real customers, then launch with confidence.

### Pro Tips for Success:
- Start with simple automations and gradually increase complexity
- Use WittyReply's analytics to optimize your conversations
- Leverage the multi-agent system for different business functions

Ready to transform your WhatsApp communication? [Get started with WittyReply](${wittyReplyInfo.website}) today.`;

    return content + tutorialSection;
  }

  addWittyReplyAI(content) {
    const wittyReplyInfo = this.enhancementData.wittyReplyInfo;
    const aiSection = `

## The Future of WhatsApp Automation: AI-Powered Intelligence

WittyReply represents the next generation of WhatsApp automation, powered by advanced artificial intelligence that goes far beyond simple chatbots.

### What Makes WittyReply's AI Different?

**Contextual Understanding**: Our AI agents don't just respond to keywords—they understand the full context of conversations, including previous interactions and customer history.

**Learning Capabilities**: WittyReply's AI continuously learns from your conversations, improving responses and adapting to your business needs over time.

**Multi-Agent Intelligence**: Deploy specialized AI agents for different functions, each optimized for specific tasks and customer interactions.

### Real-World AI Applications:
- **Intelligent Lead Qualification**: AI agents ask the right questions to identify high-value prospects
- **Contextual Customer Support**: Understand customer issues and provide relevant solutions
- **Sales Process Automation**: Guide prospects through your sales funnel with intelligent conversations

### The WittyReply Advantage:
- **${wittyReplyInfo.benefits[0]}**
- **${wittyReplyInfo.benefits[1]}**
- **${wittyReplyInfo.benefits[2]}**

Experience the power of AI-driven WhatsApp automation. [Try WittyReply free](${wittyReplyInfo.website}) and see the difference intelligent automation makes.`;

    return content + aiSection;
  }

  addWittyReplyGeneral(content) {
    const wittyReplyInfo = this.enhancementData.wittyReplyInfo;
    const generalSection = `

## Transform Your Business with WittyReply

Ready to take your WhatsApp automation to the next level? WittyReply offers the most advanced AI-powered automation platform available today.

### Why Choose WittyReply?

**Proven Results**: Thousands of businesses trust WittyReply to handle their WhatsApp communication, with measurable improvements in:
- Customer satisfaction scores
- Lead generation rates
- Operational efficiency
- Cost reduction

**Comprehensive Solution**: From lead generation to customer support, WittyReply's multi-agent system handles every aspect of your WhatsApp communication.

**Easy Integration**: Connect WittyReply with your existing business tools and workflows in minutes, not hours.

### Get Started Today

Join the businesses already using WittyReply to revolutionize their WhatsApp communication. [Start your free trial](${wittyReplyInfo.website}) and experience the difference AI-powered automation makes.

**No credit card required. No setup fees. Just results.**`;

    return content + generalSection;
  }

  integrateImagesIntoContent(content, images) {
    if (!images || images.length === 0) {
      return content;
    }

    let contentWithImages = content;
    let imageIndex = 0;

    // Add hero image after the first section
    const heroImage = images.find(img => img.type === 'hero');
    if (heroImage) {
      const heroImageHTML = this.createImageHTML(heroImage, 'hero');
      contentWithImages = contentWithImages.replace(
        /(<section class="section">[\s\S]*?<\/section>)/,
        `$1\n\n${heroImageHTML}`
      );
    }

    // Add section images
    const sectionImages = images.filter(img => img.type === 'section');
    if (sectionImages.length > 0) {
      // Find section breaks and add images
      const sectionRegex = /(<h2[^>]*class="[^"]*gradient-text[^"]*"[^>]*>.*?<\/h2>[\s\S]*?)(?=<h2|$)/g;
      contentWithImages = contentWithImages.replace(sectionRegex, (match, section) => {
        if (imageIndex < sectionImages.length) {
          const image = sectionImages[imageIndex];
          const imageHTML = this.createImageHTML(image, 'section');
          imageIndex++;
          return section + '\n\n' + imageHTML + '\n\n';
        }
        return match;
      });
    }

    // Add infographic at the end before conclusion
    const infographicImage = images.find(img => img.type === 'infographic');
    if (infographicImage) {
      const infographicHTML = this.createImageHTML(infographicImage, 'infographic');
      contentWithImages = contentWithImages.replace(
        /(<section class="section">[\s\S]*?<h2[^>]*>Conclusion<\/h2>)/,
        `${infographicHTML}\n\n$1`
      );
    }

    return contentWithImages;
  }

  createImageHTML(image, type) {
    const containerClass = type === 'hero' ? 'hero-image-container' : 
                          type === 'infographic' ? 'infographic-container' : 
                          'section-image-container';
    
    const imageClass = type === 'hero' ? 'hero-image' : 
                      type === 'infographic' ? 'infographic-image' : 
                      'section-image';

    return `
      <section class="image-section">
        <div class="container">
          <div class="max-w-4xl mx-auto">
            <div class="${containerClass}">
              <img 
                src="${image.url}" 
                alt="${image.alt}" 
                class="${imageClass} rounded-lg shadow-lg"
                loading="lazy"
              />
              ${image.caption ? `<p class="image-caption text-center text-gray-400 text-sm mt-4">${image.caption}</p>` : ''}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  generateContent(topic) {
    const sections = [];
    
    // Introduction
    sections.push(this.generateIntroduction(topic));
    
    // Main content sections with reduced spacing
    const mainSections = [];
    topic.outline.forEach((sectionTitle, index) => {
      if (index === 0) return; // Skip intro as it's already generated
      mainSections.push(this.generateSection(sectionTitle, topic, index));
    });
    
    // Wrap main sections in container with reduced spacing
    if (mainSections.length > 0) {
      sections.push(`
    <!-- Main Content Sections -->
    <div class="space-y-6">
      ${mainSections.join('\n')}
    </div>`);
    }
    
    // Conclusion
    sections.push(this.generateConclusion(topic));
    
    return sections.join('\n\n');
  }

  generateIntroduction(topic) {
    const intro = this.getRandomContent(this.contentBlocks.introductions);
    const problem = this.generateProblemStatement(topic.keyword);
    const hook = this.generateHook(topic.keyword);
    
    return `
      <section class="section">
        <div class="container">
          <div class="card">
            <h1 class="text-4xl md:text-5xl font-bold mb-6 gradient-text">${topic.title}</h1>
            <p class="text-xl text-gray-300 mb-6">${topic.description}</p>
            <p class="text-lg text-gray-400 mb-8">${intro} ${problem} ${hook}</p>
            
            <div class="bg-gray-800/50 p-6 rounded-lg border-l-4 border-green-500">
              <h3 class="text-xl font-semibold mb-3 text-green-400">📊 Quick Stats</h3>
              <ul class="space-y-2 text-gray-300">
                ${this.generateQuickStats(topic.keyword)}
              </ul>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  generateProblemStatement(keyword) {
    const problems = {
      'whatsapp automation': 'Many businesses struggle with managing high volumes of customer inquiries, leading to slow response times and lost opportunities.',
      'lead generation': 'Traditional lead generation methods are becoming less effective, while customers expect instant responses and personalized attention.',
      'customer service': 'Customer service teams are overwhelmed with repetitive questions, reducing their ability to handle complex issues effectively.',
      'small business': 'Small businesses often lack the resources to provide 24/7 customer support, putting them at a disadvantage against larger competitors.'
    };

    for (const [key, problem] of Object.entries(problems)) {
      if (keyword.toLowerCase().includes(key)) {
        return problem;
      }
    }
    
    return 'Businesses are struggling to keep up with customer demands while maintaining operational efficiency.';
  }

  generateHook(keyword) {
    const hooks = [
      'But what if there was a way to solve these challenges while actually improving your customer experience?',
      'The solution? WhatsApp automation that works while you sleep.',
      'Here\'s how forward-thinking businesses are turning these challenges into competitive advantages.',
      'The good news is that modern technology has made these problems solvable for businesses of any size.'
    ];
    
    return this.getRandomContent(hooks);
  }

  generateQuickStats(keyword) {
    const relevantStats = this.contentBlocks.statistics
      .slice(0, 3)
      .map(stat => `<li>• ${stat}</li>`)
      .join('');
    
    return relevantStats;
  }

  generateSection(sectionTitle, topic, index) {
    const sectionContent = this.getSectionContent(sectionTitle, topic);
    const sectionId = this.generateSectionId(sectionTitle);
    
    return `
      <section class="main-content-section" id="section-${index}">
        <div class="container">
          <div class="max-w-4xl mx-auto">
            <div class="card">
              <h2 class="text-3xl font-bold gradient-text mb-6">${sectionTitle}</h2>
              <div class="prose prose-invert prose-lg max-w-none">
                ${sectionContent}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  getSectionContent(sectionTitle, topic) {
    const lowerTitle = sectionTitle.toLowerCase();
    
    if (lowerTitle.includes('benefit') || lowerTitle.includes('roi')) {
      return this.generateBenefitsSection();
    } else if (lowerTitle.includes('implementation') || lowerTitle.includes('step')) {
      return this.generateImplementationSection(topic);
    } else if (lowerTitle.includes('example') || lowerTitle.includes('case study')) {
      return this.generateExamplesSection();
    } else if (lowerTitle.includes('mistake')) {
      return this.generateMistakesSection();
    } else if (lowerTitle.includes('tool') || lowerTitle.includes('resource')) {
      return this.generateToolsSection();
    } else {
      return this.generateGenericSection(sectionTitle, topic);
    }
  }

  generateBenefitsSection() {
    const benefits = this.shuffleArray([...this.contentBlocks.benefits]).slice(0, 6);
    
    return `
      <div class="grid md:grid-cols-2 gap-6">
        ${benefits.map((benefit, index) => `
          <div class="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <div class="flex items-center mb-3">
              <span class="text-2xl mr-3">${this.getBenefitIcon(index)}</span>
              <h3 class="text-lg font-semibold text-green-400">Benefit ${index + 1}</h3>
            </div>
            <p class="text-gray-300">${benefit}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateImplementationSection(topic) {
    const steps = this.generateImplementationSteps(topic.keyword);
    
    return `
      <div class="space-y-6">
        ${steps.map((step, index) => `
          <div class="flex items-start space-x-4">
            <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
              ${index + 1}
            </div>
            <div class="flex-1">
              <h4 class="text-lg font-semibold mb-2">${step.title}</h4>
              <p class="text-gray-300 mb-3">${step.description}</p>
              ${step.code ? `<pre class="bg-gray-800 p-3 rounded text-sm text-green-400 overflow-x-auto"><code>${step.code}</code></pre>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateImplementationSteps(keyword) {
    const baseSteps = [
      {
        title: "Set Up Your WhatsApp Business Account",
        description: "Create and verify your WhatsApp Business account to access automation features."
      },
      {
        title: "Define Your Automation Workflows",
        description: "Map out the customer journey and identify where automation can add value."
      },
      {
        title: "Create Your Message Templates",
        description: "Develop engaging, personalized messages that align with your brand voice."
      },
      {
        title: "Test and Optimize",
        description: "Run pilot programs and refine your automation based on customer feedback."
      }
    ];

    // Customize steps based on keyword
    if (keyword.includes('lead generation')) {
      baseSteps.splice(2, 0, {
        title: "Design Lead Nurturing Sequences",
        description: "Create multi-touch campaigns that guide prospects through your sales funnel."
      });
    }

    if (keyword.includes('customer service')) {
      baseSteps.splice(1, 0, {
        title: "Identify Common Customer Questions",
        description: "Analyze your support tickets to find frequently asked questions for automation."
      });
    }

    return baseSteps;
  }

  generateExamplesSection() {
    const examples = this.shuffleArray([...this.contentBlocks.examples]).slice(0, 4);
    
    return `
      <div class="grid md:grid-cols-2 gap-6">
        ${examples.map((example, index) => `
          <div class="bg-gray-800/30 p-6 rounded-lg border border-gray-700">
            <div class="flex items-center mb-4">
              <span class="text-2xl mr-3">${this.getExampleIcon(index)}</span>
              <h3 class="text-lg font-semibold text-blue-400">Example ${index + 1}</h3>
            </div>
            <p class="text-gray-300">${example}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateMistakesSection() {
    const mistakes = [
      "Over-automating without human oversight",
      "Using generic messages that don't resonate",
      "Failing to test automation flows thoroughly",
      "Ignoring customer feedback and metrics",
      "Not having a clear escalation path to humans"
    ];

    return `
      <div class="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-red-400 mb-4">🚫 Common Mistakes to Avoid</h3>
        <ul class="space-y-3">
          ${mistakes.map(mistake => `
            <li class="flex items-start space-x-3">
              <span class="text-red-400 mt-1">•</span>
              <span class="text-gray-300">${mistake}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  generateToolsSection() {
    return `
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-gray-800/30 p-6 rounded-lg border border-gray-700">
          <h3 class="text-lg font-semibold text-green-400 mb-3">🛠️ Essential Tools</h3>
          <ul class="space-y-2 text-gray-300">
            <li>• WhatsApp Business API</li>
            <li>• Automation platform (Zapier, Make, etc.)</li>
            <li>• CRM integration</li>
            <li>• Analytics and reporting tools</li>
          </ul>
        </div>
        <div class="bg-gray-800/30 p-6 rounded-lg border border-gray-700">
          <h3 class="text-lg font-semibold text-blue-400 mb-3">📚 Learning Resources</h3>
          <ul class="space-y-2 text-gray-300">
            <li>• WhatsApp Business documentation</li>
            <li>• Automation best practices guides</li>
            <li>• Customer service optimization</li>
            <li>• Industry case studies</li>
          </ul>
        </div>
      </div>
    `;
  }

  generateGenericSection(sectionTitle, topic) {
    const content = this.generateGenericContent(sectionTitle, topic.keyword);
    
    return `
      <div class="prose prose-invert max-w-none">
        <p class="text-lg text-gray-300 mb-4">${content}</p>
        <div class="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
          <h4 class="text-lg font-semibold text-yellow-400 mb-2">💡 Pro Tip</h4>
          <p class="text-gray-300">${this.getRandomContent(this.contentBlocks.tips)}</p>
        </div>
      </div>
    `;
  }

  generateGenericContent(sectionTitle, keyword) {
    const contentMap = {
      'introduction': 'This section introduces the key concepts and sets the stage for the detailed information that follows.',
      'why this matters': 'Understanding why this topic is crucial for your business success and how it impacts your bottom line.',
      'statistics and trends': 'Current data and insights that demonstrate the importance and effectiveness of these strategies.',
      'next steps': 'Actionable steps you can take immediately to implement these strategies in your business.'
    };

    for (const [key, content] of Object.entries(contentMap)) {
      if (sectionTitle.toLowerCase().includes(key)) {
        return content;
      }
    }

    return `This section covers important aspects of ${keyword} that every business owner should understand and implement.`;
  }

  generateConclusion(topic) {
    const conclusion = this.getRandomContent(this.contentBlocks.conclusions);
    const callToAction = this.generateCallToAction(topic.keyword);
    
    return `
      <section class="section">
        <div class="container">
          <div class="card">
            <h2 class="text-3xl font-bold mb-6 gradient-text">Conclusion</h2>
            <p class="text-lg text-gray-300 mb-6">${conclusion}</p>
            
            <div class="bg-green-900/20 border border-green-800 rounded-lg p-6 text-center">
              <h3 class="text-xl font-semibold text-green-400 mb-4">Ready to Get Started?</h3>
              <p class="text-gray-300 mb-6">${callToAction}</p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="../index.html#contact" class="btn-primary">Start Your Free Trial</a>
                <a href="../blog.html" class="btn-secondary">Read More Articles</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  generateCallToAction(keyword) {
    const actions = [
      "Join thousands of businesses already using WhatsApp automation to grow their customer base and improve efficiency.",
      "Don't let your competitors get ahead. Start implementing WhatsApp automation strategies today.",
      "The future of business communication is here. Are you ready to embrace it?",
      "Transform your business operations with proven WhatsApp automation strategies."
    ];
    
    return this.getRandomContent(actions);
  }

  generateMeta(topic) {
    const metaTemplate = this.templates.meta;
    
    return metaTemplate
      .replace(/\{\{TITLE\}\}/g, topic.title)
      .replace(/\{\{DESCRIPTION\}\}/g, topic.description)
      .replace(/\{\{KEYWORDS\}\}/g, this.generateKeywords(topic.keyword))
      .replace(/\{\{PUBLISH_DATE\}\}/g, new Date().toISOString())
      .replace(/\{\{MODIFIED_DATE\}\}/g, new Date().toISOString())
      .replace(/\{\{SLUG\}\}/g, this.generateSlug(topic.title));
  }

  generateKeywords(primaryKeyword) {
    // Use the centralized keyword configuration
    return getKeywords(primaryKeyword);
  }

  generateSectionId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }

  getBenefitIcon(index) {
    const icons = ['🚀', '⚡', '💡', '🎯', '📈', '🔧'];
    return icons[index % icons.length];
  }

  getExampleIcon(index) {
    const icons = ['🏢', '🛒', '🏥', '🍕', '💼', '🎓'];
    return icons[index % icons.length];
  }

  getRandomContent(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getIndustryFromKeyword(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword.includes('real estate')) return 'real estate';
    if (lowerKeyword.includes('ecommerce') || lowerKeyword.includes('online store')) return 'ecommerce';
    if (lowerKeyword.includes('consulting') || lowerKeyword.includes('professional services')) return 'consulting';
    if (lowerKeyword.includes('restaurant') || lowerKeyword.includes('food')) return 'food service';
    if (lowerKeyword.includes('healthcare') || lowerKeyword.includes('medical')) return 'healthcare';
    if (lowerKeyword.includes('small business')) return 'small business';
    return 'business automation';
  }

  saveBlogPost(postData) {
    try {
      const postsDir = path.join(__dirname, '../posts');
      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
      }

      const filename = `blog-${postData.slug}-${postData.publishDate}.html`;
      const filepath = path.join(postsDir, filename);

      // Generate full HTML content
      const fullHtml = this.templates.html
        .replace(/\{\{META\}\}/g, postData.meta)
        .replace(/\{\{TITLE\}\}/g, postData.title)
        .replace(/\{\{DESCRIPTION\}\}/g, postData.description)
        .replace(/\{\{CONTENT\}\}/g, postData.content)
        .replace(/\{\{PUBLISH_DATE\}\}/g, postData.publishDate)
        .replace(/\{\{KEYWORD\}\}/g, postData.keyword);

      fs.writeFileSync(filepath, fullHtml);
      console.log(`✅ Blog post saved: ${filename}`);
      
      return filepath;
    } catch (error) {
      console.error('Error saving blog post:', error);
      return null;
    }
  }

  // Enhanced CLI interface with all modes
  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    const value = args[2];

    switch (command) {
      case 'generate':
        const keyword = param || this.config.keywords[0];
        await this.generateEnhancedBlogPost(keyword);
        break;

      case 'generate-multiple':
        const count = parseInt(param) || 3;
        await this.generateMultiplePosts(count);
        break;

      case 'generate-csv':
        const priority = param || 'high';
        const csvCount = parseInt(value) || 3;
        await this.generateFromCSV(priority, csvCount);
        break;

      case 'generate-wittyreply':
        const wrKeyword = param || this.config.keywords[0];
        await this.generateWithWittyReplyBranding(wrKeyword);
        break;

      case 'test-images':
        await this.testImageGeneration();
        break;

      case 'config':
        console.log('\n📋 Current Configuration:');
        console.log(JSON.stringify(this.config, null, 2));
        break;

      case 'load-csv':
        const csvPath = param || this.config.csvKeywordPath;
        this.loadKeywordsFromCSV(csvPath);
        break;

      case 'analyze-keywords':
        this.analyzeKeywords();
        break;

      default:
        console.log(`
🚀 Unified Blog Post Generator

Usage:
  node blog-generator.js generate [keyword]           - Generate single blog post
  node blog-generator.js generate-multiple [count]    - Generate multiple posts
  node blog-generator.js generate-csv [priority] [n]  - Generate from CSV keywords
  node blog-generator.js generate-wittyreply [keyword] - Generate with WittyReply branding
  node blog-generator.js test-images                   - Test image generation
  node blog-generator.js config                        - Show current configuration
  node blog-generator.js load-csv [path]               - Load keywords from CSV
  node blog-generator.js analyze-keywords              - Analyze loaded keywords

Examples:
  node blog-generator.js generate "whatsapp automation"
  node blog-generator.js generate-multiple 5
  node blog-generator.js generate-csv high 3
  node blog-generator.js generate-wittyreply "best whatsapp chatbot"
  node blog-generator.js load-csv wittyreply_seo/whatsapp_ai_ENHANCED.csv

Features:
  ✨ AI-powered content generation (4000+ words)
  🎨 Automatic image generation
  🔗 Smart internal linking
  🎯 WittyReply branding integration
  📊 CSV keyword support
  📱 Mobile-optimized output
  🔧 Configurable features

Environment Variables Required:
  OPENAI_API_KEY     - For content generation
  REPLICATE_API_TOKEN - For image generation (optional)
        `);
    }
  }

  // Enhanced blog post generation (from enhanced-blog-automation.js)
  async generateEnhancedBlogPost(keyword, options = {}) {
    try {
      console.log(`\n🚀 Starting enhanced blog generation for: "${keyword}"`);
      console.log('=' .repeat(60));
      
      // Validate API keys
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required for content generation');
      }
      
      if (!process.env.REPLICATE_API_TOKEN) {
        console.warn('⚠️  REPLICATE_API_TOKEN not found - images will be skipped');
      }

      const startTime = Date.now();
      
      // Generate the blog post
      const topic = {
        keyword: keyword,
        title: this.generateTitleFromKeyword(keyword),
        description: `Comprehensive guide to ${keyword} for modern businesses`,
        difficulty: 'intermediate',
        estimatedWords: this.config.generation?.targetWords || 4000
      };

      const postData = await this.generateBlogPost(topic, options);
      
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Save the blog post
      const filepath = this.saveBlogPost(postData);
      
      if (filepath) {
        console.log(`\n✅ Enhanced blog post generated successfully!`);
        console.log(`📝 Title: ${postData.title}`);
        console.log(`📊 Word Count: ${postData.wordCount} words`);
        console.log(`🎨 Images: ${postData.images ? postData.images.length : 0} generated`);
        console.log(`🔗 Internal Links: ${postData.linkCount || 0} added`);
        console.log(`⏱️  Generation Time: ${generationTime}s`);
        console.log(`📁 Saved to: ${filepath}`);
        
        // Generate summary report
        this.generateSummaryReport(postData, generationTime);
        
        return {
          success: true,
          postData,
          filepath,
          generationTime: parseFloat(generationTime)
        };
      } else {
        throw new Error('Failed to save blog post');
      }
      
    } catch (error) {
      console.error(`❌ Error generating enhanced blog post: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate multiple posts (from enhanced-blog-automation.js)
  async generateMultiplePosts(count = 3) {
    console.log(`\n🚀 Generating ${count} enhanced blog posts...`);
    console.log('=' .repeat(60));
    
    const results = [];
    const keywords = this.config.keywords.slice(0, count);
    
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      console.log(`\n📝 Generating post ${i + 1}/${count}: "${keyword}"`);
      
      try {
        const result = await this.generateEnhancedBlogPost(keyword);
        results.push(result);
        
        // Add delay between posts to avoid rate limiting
        if (i < keywords.length - 1) {
          console.log('⏳ Waiting 30 seconds before next post...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to generate post for "${keyword}": ${error.message}`);
        results.push({
          success: false,
          keyword,
          error: error.message
        });
      }
    }
    
    // Generate final summary
    this.generateFinalSummary(results);
    
    return results;
  }

  // Generate from CSV keywords (from whatsapp-ai-blog-generator.js)
  async generateFromCSV(priorityLevel = 'high', maxArticles = 5, options = {}) {
    if (this.keywordData.length === 0) {
      console.log('📊 Loading keywords from CSV...');
      this.loadKeywordsFromCSV(this.config.csvKeywordPath);
    }

    const prioritized = this.prioritizeKeywords();
    const keywordsToProcess = prioritized[priorityLevel].slice(0, maxArticles);

    console.log(`\n🚀 Starting batch generation for ${priorityLevel} priority keywords`);
    console.log(`📝 Generating ${keywordsToProcess.length} articles...\n`);

    const results = [];

    for (let i = 0; i < keywordsToProcess.length; i++) {
      const keywordData = keywordsToProcess[i];
      console.log(`\n📝 Progress: ${i + 1}/${keywordsToProcess.length}`);
      
      const topic = this.createTopicFromKeyword(keywordData, options);
      const result = await this.generateBlogPost(topic);
      
      if (result) {
        const filepath = this.saveBlogPost(result);
        results.push({
          success: true,
          keyword: keywordData.keyword,
          title: result.title,
          filepath: filepath,
          opportunityScore: keywordData.opportunityScore
        });
      } else {
        results.push({
          success: false,
          keyword: keywordData.keyword,
          error: 'Failed to generate content'
        });
      }

      // Add delay between generations to avoid API rate limits
      if (i < keywordsToProcess.length - 1) {
        console.log('⏱️  Waiting 2 seconds before next generation...');
        await this.delay(2000);
      }
    }

    return results.filter(result => result.success);
  }

  // Generate with WittyReply branding
  async generateWithWittyReplyBranding(keyword) {
    const originalMode = this.wittyReplyMode;
    this.wittyReplyMode = true;
    
    try {
      const result = await this.generateEnhancedBlogPost(keyword);
      return result;
    } finally {
      this.wittyReplyMode = originalMode;
    }
  }

  // Utility methods
  generateTitleFromKeyword(keyword) {
    return keyword
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  prioritizeKeywords() {
    const prioritized = {
      high: this.keywordData.filter(k => k.recommendation === 'MEDIUM_PRIORITY'),
      medium: this.keywordData.filter(k => k.recommendation === 'LONG_TERM'),
      low: this.keywordData.filter(k => k.recommendation === 'CONSIDER')
    };

    Object.keys(prioritized).forEach(priority => {
      prioritized[priority].sort((a, b) => b.opportunityScore - a.opportunityScore);
    });

    return prioritized;
  }

  createTopicFromKeyword(keywordData, options = {}) {
    const keyword = keywordData.keyword;
    const difficulty = this.mapDifficultyScore(keywordData.difficultyScore);
    const industry = this.extractIndustryFromKeyword(keyword);
    
    const title = this.generateTitleForKeyword(keyword, keywordData.opportunityScore);
    const description = this.generateDescriptionForKeyword(keyword, keywordData);
    const outline = this.generateOutlineForKeyword(keyword);

    return {
      title: title,
      keyword: keyword,
      description: description,
      outline: outline,
      difficulty: difficulty,
      estimatedWords: options.targetWords || this.config.generation?.targetWords || 4000,
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
      ]
    };

    if (titleTemplates[keyword]) {
      return titleTemplates[keyword][Math.floor(Math.random() * titleTemplates[keyword].length)];
    }

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
      'best whatsapp automation software': 'Compare top WhatsApp automation software solutions and find the perfect fit for your business needs.'
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
      ]
    };

    for (const [key, outline] of Object.entries(baseOutlines)) {
      if (keyword.includes(key)) {
        return outline;
      }
    }

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

  analyzeKeywords() {
    if (this.keywordData.length === 0) {
      console.log('No keywords loaded. Use "load-csv" command first.');
      return;
    }

    const prioritized = this.prioritizeKeywords();
    console.log(`🎯 Priority breakdown:`);
    console.log(`   High Priority (MEDIUM_PRIORITY): ${prioritized.high.length} keywords`);
    console.log(`   Medium Priority (LONG_TERM): ${prioritized.medium.length} keywords`);
    console.log(`   Low Priority (CONSIDER): ${prioritized.low.length} keywords`);
  }

  generateSummaryReport(postData, generationTime) {
    const report = {
      timestamp: new Date().toISOString(),
      title: postData.title,
      keyword: postData.keyword,
      wordCount: postData.wordCount,
      imageCount: postData.images ? postData.images.length : 0,
      generationTime: parseFloat(generationTime),
      isAIGenerated: postData.isAIGenerated,
      hasImages: postData.hasImages,
      wittyReplyMode: postData.wittyReplyMode,
      slug: postData.slug,
      publishDate: postData.publishDate
    };

    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `enhanced-blog-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📊 Report saved: ${reportFile}`);
  }

  generateFinalSummary(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 ENHANCED BLOG GENERATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📝 Total Posts: ${results.length}`);
    
    if (successful.length > 0) {
      const totalWords = successful.reduce((sum, r) => sum + (r.postData?.wordCount || 0), 0);
      const totalImages = successful.reduce((sum, r) => sum + (r.postData?.images?.length || 0), 0);
      const avgGenerationTime = successful.reduce((sum, r) => sum + (r.generationTime || 0), 0) / successful.length;
      
      console.log(`📊 Total Words Generated: ${totalWords.toLocaleString()}`);
      console.log(`🎨 Total Images Generated: ${totalImages}`);
      console.log(`⏱️  Average Generation Time: ${avgGenerationTime.toFixed(2)}s`);
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Posts:');
      failed.forEach(f => console.log(`  - ${f.keyword}: ${f.error}`));
    }
    
    console.log('\n🎉 Enhanced blog generation complete!');
  }

  async testImageGeneration() {
    console.log('\n🎨 Testing image generation...');
    
    try {
      const testPrompt = "Professional business team using modern technology, clean office environment, digital transformation concept";
      const image = await this.imageGenerator.generateImage(testPrompt, {
        aspectRatio: "16:9",
        megapixels: "1",
        outputQuality: 80
      });
      
      if (image) {
        console.log(`✅ Test image generated successfully: ${image.filename}`);
        console.log(`📁 Saved to: ${image.filepath}`);
        return true;
      } else {
        console.log('❌ Test image generation failed');
        return false;
      }
    } catch (error) {
      console.error(`❌ Image generation test failed: ${error.message}`);
      return false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new BlogPostGenerator();
  generator.runCLI().catch(console.error);
}

export default BlogPostGenerator;
