#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIContentGenerator {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.usedTitles = this.loadUsedTitles();
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.BLOG_AI_MODEL || 'gpt-4o';
    this.temperature = parseFloat(process.env.BLOG_TEMPERATURE) || 0.8;
    this.targetWords = parseInt(process.env.BLOG_TARGET_WORDS) || 2000;
    
    if (!this.apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
      console.warn('   Please set your API key in .env file or as environment variable');
    }
  }

  loadUsedTitles() {
    try {
      const titlesFile = path.join(__dirname, '../data/used-titles.json');
      if (fs.existsSync(titlesFile)) {
        return JSON.parse(fs.readFileSync(titlesFile, 'utf8'));
      }
    } catch (error) {
      console.log('No existing used titles file found, starting fresh');
    }
    return [];
  }

  saveUsedTitles() {
    try {
      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const titlesFile = path.join(dataDir, 'used-titles.json');
      fs.writeFileSync(titlesFile, JSON.stringify(this.usedTitles, null, 2));
    } catch (error) {
      console.error('Error saving used titles:', error);
    }
  }

  async generateCreativeTitles(keyword, context = {}) {
    if (!this.apiKey) {
      console.warn('No OpenAI API key found. Using fallback title generation.');
      return this.generateFallbackTitles(keyword, context);
    }

    try {
      const prompt = this.buildPrompt(keyword, context);
      const response = await this.callOpenAI(prompt);
      const titles = this.parseTitlesFromResponse(response);
      
      // Filter out already used titles
      const uniqueTitles = titles.filter(title => 
        !this.usedTitles.some(used => 
          this.normalizeTitleForComparison(used) === this.normalizeTitleForComparison(title)
        )
      );

      return uniqueTitles.length > 0 ? uniqueTitles : this.generateFallbackTitles(keyword, context);
    } catch (error) {
      console.error('Error calling OpenAI API:', error.message);
      return this.generateFallbackTitles(keyword, context);
    }
  }

  buildPrompt(keyword, context) {
    const industryContext = context.industry || 'general business';
    const difficulty = context.difficulty || 'intermediate';
    const contentType = context.contentType || 'comprehensive guide';
    
    return `Generate 5 unique, engaging blog post titles about "${keyword}" for ${industryContext}. 

Requirements:
- Target ${difficulty} level audience
- Focus on ${contentType} style content
- Titles should be SEO-friendly (50-60 characters)
- Include power words and emotional triggers
- Make them actionable and benefit-focused
- Avoid generic phrases like "Complete Guide" or "Ultimate Guide"
- Each title must be completely different and creative

Avoid these already used titles:
${this.usedTitles.slice(-10).map(title => `- ${title}`).join('\n')}

Format your response as a numbered list:
1. [Title 1]
2. [Title 2]
3. [Title 3]
4. [Title 4]
5. [Title 5]`;
  }

  async callOpenAI(prompt) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert content marketing specialist and technical writer who creates compelling, comprehensive blog content. You write engaging, informative articles that provide real value to readers while being optimized for SEO.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000, // Increased for full content
        temperature: this.temperature, // From environment variables
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  parseTitlesFromResponse(response) {
    const lines = response.split('\n');
    const titles = [];
    
    for (const line of lines) {
      // Match numbered list items
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        const title = match[1].trim();
        // Remove any quotes or extra formatting
        const cleanTitle = title.replace(/^["']|["']$/g, '').trim();
        if (cleanTitle && cleanTitle.length > 10) {
          titles.push(cleanTitle);
        }
      }
    }
    
    return titles;
  }

  generateFallbackTitles(keyword, context) {
    const templates = [
      `${this.getRandomNumber(5, 15)} ${keyword} Strategies That ${this.getRandomVerb()} Results`,
      `Why ${keyword} ${this.getRandomVerb()} Your Business (And How to Start)`,
      `The ${keyword} Revolution: ${this.getRandomNumber(3, 7)} Game-Changing Insights`,
      `From Zero to Hero: ${keyword} Success in ${this.getRandomNumber(30, 90)} Days`,
      `${keyword} Secrets: What Industry Leaders Don't Want You to Know`
    ];

    return templates.map(template => this.processTemplate(template, keyword, context));
  }

  processTemplate(template, keyword, context) {
    return template
      .replace(/\${keyword}/g, keyword)
      .replace(/\${getRandomNumber\((\d+), (\d+)\)}/g, (match, min, max) => 
        this.getRandomNumber(parseInt(min), parseInt(max))
      )
      .replace(/\${getRandomVerb\(\)}/g, () => this.getRandomVerb());
  }

  getRandomVerb() {
    const verbs = [
      'Transform', 'Revolutionize', 'Supercharge', 'Accelerate', 'Optimize',
      'Streamline', 'Boost', 'Enhance', 'Maximize', 'Scale', 'Automate'
    ];
    return verbs[Math.floor(Math.random() * verbs.length)];
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  normalizeTitleForComparison(title) {
    return title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  markTitleAsUsed(title) {
    if (!this.usedTitles.includes(title)) {
      this.usedTitles.push(title);
      this.saveUsedTitles();
    }
  }

  async selectBestTitle(keyword, context = {}) {
    const titles = await this.generateCreativeTitles(keyword, context);
    
    if (titles.length === 0) {
      throw new Error('No unique titles could be generated');
    }

    // Select the first title (they're already ranked by creativity)
    const selectedTitle = titles[0];
    this.markTitleAsUsed(selectedTitle);
    
    return {
      title: selectedTitle,
      alternatives: titles.slice(1),
      isAIGenerated: this.apiKey !== null
    };
  }

  // Generate description based on title
  async generateDescription(title, keyword) {
    if (!this.apiKey) {
      return this.generateFallbackDescription(title, keyword);
    }

    try {
      const prompt = `Write a compelling 120-140 character meta description for a blog post titled "${title}" about ${keyword}. 
      
      Make it:
      - Action-oriented and benefit-focused
      - Include the main keyword naturally
      - Create urgency or curiosity
      - End with a clear value proposition
      
      Return only the description, no quotes or extra text.`;

      const response = await this.callOpenAI(prompt);
      return response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Error generating description:', error.message);
      return this.generateFallbackDescription(title, keyword);
    }
  }

  generateFallbackDescription(title, keyword) {
    const templates = [
      `Discover proven ${keyword} strategies that deliver real results. Learn from industry experts and transform your business today.`,
      `Master ${keyword} with our step-by-step approach. Join thousands of successful businesses already seeing incredible growth.`,
      `Unlock the power of ${keyword} for your business. Get actionable insights and start seeing results in just days.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Generate complete blog post with OpenAI
  async generateCompleteArticle(keyword, context = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required for full article generation');
    }

    const prompt = this.buildArticlePrompt(keyword, context);
    
    try {
      const response = await this.callOpenAI(prompt);
      const article = this.parseArticleResponse(response, keyword);
      
      // Track the title to prevent duplicates
      this.markTitleAsUsed(article.title);
      
      return article;
    } catch (error) {
      console.error('Error generating complete article:', error);
      throw error;
    }
  }

  buildArticlePrompt(keyword, context) {
    const industryContext = context.industry || 'general business';
    const difficulty = context.difficulty || 'intermediate';
    const targetWords = context.targetWords || this.targetWords;
    
    return `You are writing a blog post about "${keyword}" for ${industryContext}. 

CRITICAL: You must follow the EXACT format below. Do not include DOCTYPE, html, head, or body tags.

REQUIREMENTS:
- Target audience: ${difficulty} level professionals  
- Article length: ${targetWords} words approximately
- SEO optimized with natural keyword integration
- Include actionable insights and practical tips
- Use engaging, conversational tone

AVOID these overused titles:
${this.usedTitles.slice(-10).map(title => `- ${title}`).join('\n')}

RESPOND IN THIS EXACT FORMAT (no other text before or after):

TITLE: [Your creative, unique title here - no HTML tags]

DESCRIPTION: [SEO meta description 140-160 characters - no HTML tags]

CONTENT:
<h2>🚀 Introduction</h2>
<p>Your engaging introduction paragraph that hooks the reader...</p>

<h2>💡 Main Section Title</h2>
<p>Your content here with proper HTML formatting...</p>
<ul>
<li>Bullet point 1</li>
<li>Bullet point 2</li>
</ul>

<h2>🎯 Another Main Section</h2>
<p>More valuable content...</p>

<h2>✅ Conclusion and Next Steps</h2>
<p>Wrap up with actionable next steps...</p>

OUTLINE: Section 1, Section 2, Section 3, Conclusion

Remember: Use only HTML content tags (h2, h3, p, ul, li, strong, em). Include emojis in headings. Make it scannable and valuable.`;
  }

  parseArticleResponse(response, keyword) {
    console.log('🔍 Parsing OpenAI response...');
    console.log('📝 Response preview:', response.substring(0, 200) + '...');
    
    const lines = response.split('\n');
    let title = '';
    let description = '';
    let content = '';
    let outline = [];
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
        console.log('✅ Found title:', title);
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.replace('DESCRIPTION:', '').trim();
        console.log('✅ Found description:', description);
      } else if (line.startsWith('CONTENT:')) {
        currentSection = 'content';
        console.log('✅ Found content section start');
        continue;
      } else if (line.startsWith('OUTLINE:')) {
        const outlineText = line.replace('OUTLINE:', '').trim();
        outline = outlineText.split(',').map(item => item.trim()).filter(item => item);
        console.log('✅ Found outline:', outline);
        currentSection = '';
      } else if (currentSection === 'content' && line) {
        content += line + '\n';
      }
    }
    
    // Clean up content
    content = content.trim();
    console.log('📊 Content length:', content.length, 'characters');
    
    // If outline is empty, extract from content
    if (outline.length === 0) {
      outline = this.extractOutlineFromContent(content);
      console.log('🔍 Extracted outline from content:', outline);
    }
    
    // If content is still empty, use the whole response as content (fallback)
    if (!content && response.trim()) {
      console.log('⚠️ No structured content found, using entire response');
      content = response.trim();
    }
    
    return {
      title: title || `AI-Generated Article: ${keyword}`,
      description: description || `Comprehensive guide to ${keyword} for modern businesses.`,
      content: content,
      outline: outline,
      keyword: keyword,
      isAIGenerated: true,
      wordCount: content.split(' ').length
    };
  }

  extractOutlineFromContent(content) {
    const headings = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    return headings.map(heading => 
      heading.replace(/<\/?h2[^>]*>/gi, '').replace(/[^\w\s]/gi, '').trim()
    ).filter(heading => heading);
  }

  // Generate structured HTML content for the blog template
  generateStructuredHTML(article) {
    const sections = this.splitContentIntoSections(article.content);
    let structuredHTML = '';
    
    sections.forEach((section, index) => {
      const sectionId = this.generateSectionId(section.heading);
      
      structuredHTML += `
      <section class="section" id="${sectionId}">
        <div class="container">
          <div class="card">
            <h2 class="text-3xl font-bold mb-6 gradient-text">${section.heading}</h2>
            ${section.content}
          </div>
        </div>
      </section>
    `;
    });
    
    return structuredHTML;
  }

  splitContentIntoSections(content) {
    const sections = [];
    const parts = content.split(/<h2[^>]*>/i);
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const headingMatch = part.match(/^([^<]+)<\/h2>/i);
      
      if (headingMatch) {
        const heading = headingMatch[1].trim();
        const sectionContent = part.replace(/^[^<]+<\/h2>/i, '').trim();
        
        sections.push({
          heading: heading,
          content: sectionContent
        });
      }
    }
    
    return sections;
  }

  generateSectionId(heading) {
    return heading
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  // CLI interface for testing
  async runCLI() {
    const args = process.argv.slice(2);
    const keyword = args[0] || 'whatsapp automation';
    const count = parseInt(args[1]) || 5;

    console.log(`🤖 AI Content Generator for: "${keyword}"`);
    console.log('='.repeat(50));
    console.log(`🔧 Model: ${this.model}`);
    console.log(`🎚️  Temperature: ${this.temperature}`);
    console.log(`📝 Target Words: ${this.targetWords}`);
    console.log(`🔑 API Key: ${this.apiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log('='.repeat(50));

    try {
      const result = await this.selectBestTitle(keyword, {
        industry: 'business automation',
        difficulty: 'intermediate',
        contentType: 'actionable guide'
      });

      console.log(`\n✨ Selected Title: ${result.title}`);
      console.log(`🔧 AI Generated: ${result.isAIGenerated ? 'Yes' : 'No (Fallback)'}`);
      
      const description = await this.generateDescription(result.title, keyword);
      console.log(`📝 Description: ${description}`);
      
      if (result.alternatives.length > 0) {
        console.log('\n💡 Alternative Titles:');
        result.alternatives.forEach((alt, i) => {
          console.log(`   ${i + 1}. ${alt}`);
        });
      }

      console.log(`\n📊 Total Used Titles: ${this.usedTitles.length}`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new AIContentGenerator();
  
  // Test full article generation if --full flag is provided
  if (process.argv.includes('--full')) {
    // Get keyword from arguments, skipping the --full flag
    const args = process.argv.slice(2).filter(arg => arg !== '--full');
    const keyword = args[0] || 'whatsapp automation';
    console.log(`🚀 Generating full article for: "${keyword}"`);
    
    generator.generateCompleteArticle(keyword, {
      industry: 'business automation',
      difficulty: 'intermediate',
      targetWords: 2000
    }).then(article => {
      console.log(`\n✨ Generated Article:`);
      console.log(`📝 Title: ${article.title}`);
      console.log(`📄 Description: ${article.description}`);
      console.log(`📊 Word Count: ${article.wordCount}`);
      console.log(`🗂️ Sections: ${article.outline.join(', ')}`);
      console.log(`\n📝 Content Preview:`);
      console.log(article.content.substring(0, 500) + '...');
    }).catch(console.error);
  } else {
    generator.runCLI().catch(console.error);
  }
}

export default AIContentGenerator;
