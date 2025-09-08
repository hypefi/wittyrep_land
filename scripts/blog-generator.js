#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AIContentGenerator from './ai-title-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogPostGenerator {
  constructor() {
    this.templates = this.loadTemplates();
    this.contentBlocks = this.loadContentBlocks();
    this.aiContentGenerator = new AIContentGenerator();
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

  async generateBlogPost(topic) {
    try {
      console.log(`🤖 Generating complete AI article for: ${topic.keyword}`);
      
      // Generate complete article with OpenAI
      const article = await this.aiContentGenerator.generateCompleteArticle(topic.keyword, {
        industry: this.getIndustryFromKeyword(topic.keyword),
        difficulty: topic.difficulty || 'intermediate',
        targetWords: topic.estimatedWords || 2000
      });

      // Structure the content for our template
      const structuredContent = this.aiContentGenerator.generateStructuredHTML(article);

      const postData = {
        title: article.title,
        keyword: article.keyword,
        description: article.description,
        outline: article.outline,
        difficulty: topic.difficulty || 'intermediate',
        estimatedWords: article.wordCount,
        publishDate: new Date().toISOString().split('T')[0],
        slug: this.generateSlug(article.title),
        content: structuredContent,
        meta: this.generateMeta({
          title: article.title,
          description: article.description,
          keyword: article.keyword
        }),
        isAIGenerated: true,
        wordCount: article.wordCount,
        rawContent: article.content // Keep original for debugging
      };

      console.log(`✅ AI article generated: "${article.title}" (${article.wordCount} words)`);
      return postData;
      
    } catch (error) {
      console.error('❌ Error generating AI content:', error.message);
      console.log('🔄 Falling back to template-based generation...');
      
      // Fallback to original template-based method
      const postData = {
        title: topic.title,
        keyword: topic.keyword,
        description: topic.description,
        outline: topic.outline,
        difficulty: topic.difficulty,
        estimatedWords: topic.estimatedWords,
        publishDate: new Date().toISOString().split('T')[0],
        slug: this.generateSlug(topic.title),
        content: this.generateContent(topic),
        meta: this.generateMeta(topic),
        isAIGenerated: false,
        fallbackReason: error.message
      };

      return postData;
    }
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
    
    // Main content based on outline
    topic.outline.forEach((sectionTitle, index) => {
      if (index === 0) return; // Skip intro as it's already generated
      sections.push(this.generateSection(sectionTitle, topic, index));
    });
    
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
      <section class="section" id="${sectionId}">
        <div class="container">
          <div class="card">
            <h2 class="text-3xl font-bold mb-6 gradient-text">${sectionTitle}</h2>
            ${sectionContent}
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
    const baseKeywords = [
      'whatsapp automation',
      'business automation',
      'customer service automation',
      'lead generation',
      'business efficiency',
      'digital marketing',
      'customer engagement'
    ];
    
    const allKeywords = [primaryKeyword, ...baseKeywords];
    return allKeywords.join(', ');
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
}

export default BlogPostGenerator;
