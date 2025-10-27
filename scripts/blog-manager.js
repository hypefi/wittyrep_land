#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AIContentGenerator from './ai-title-generator.js';
import ImageGenerator from './image-generator.js';
import InternalLinker from './internal-linker.js';
import ConfigManager from './config-manager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Consolidated Blog Manager
 * Combines functionality from article-manager.js and custom-blog-manager.js
 */
class BlogManager {
  constructor() {
    this.configManager = new ConfigManager();
    this.config = this.configManager.getConfig();
    this.aiContentGenerator = new AIContentGenerator();
    this.imageGenerator = new ImageGenerator();
    this.internalLinker = new InternalLinker();
    this.templates = this.loadTemplates();
    this.articles = this.loadArticles();
    this.customArticles = this.loadCustomArticles();
  }

  loadTemplates() {
    return {
      html: fs.readFileSync(path.join(__dirname, '../templates/blog-template.html'), 'utf8'),
      meta: fs.readFileSync(path.join(__dirname, '../templates/meta-template.html'), 'utf8')
    };
  }

  loadArticles() {
    const articlesFile = path.join(__dirname, '../data/articles.json');
    try {
      if (fs.existsSync(articlesFile)) {
        return JSON.parse(fs.readFileSync(articlesFile, 'utf8'));
      }
    } catch (error) {
      console.log('No existing articles file found, starting fresh');
    }
    return [];
  }

  loadCustomArticles() {
    const customArticlesFile = path.join(__dirname, '../data/custom-articles.json');
    try {
      if (fs.existsSync(customArticlesFile)) {
        return JSON.parse(fs.readFileSync(customArticlesFile, 'utf8'));
      }
    } catch (error) {
      console.log('No existing custom articles file found, starting fresh');
    }
    return [];
  }

  saveArticles() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const articlesFile = path.join(dataDir, 'articles.json');
    fs.writeFileSync(articlesFile, JSON.stringify(this.articles, null, 2));
  }

  saveCustomArticles() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const customArticlesFile = path.join(dataDir, 'custom-articles.json');
    fs.writeFileSync(customArticlesFile, JSON.stringify(this.customArticles, null, 2));
  }

  // Article Management (from article-manager.js)
  addArticle(articleData) {
    const article = {
      id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: articleData.title,
      keyword: articleData.keyword,
      description: articleData.description || `Complete guide to ${articleData.keyword}`,
      category: articleData.category || 'whatsapp_automation',
      priority: articleData.priority || 'high',
      status: 'planned',
      targetWords: this.config.generation?.targetWords || 4000,
      includeImages: this.config.features?.imageGeneration || true,
      imageCount: 4,
      createdAt: new Date().toISOString(),
      scheduledDate: articleData.scheduledDate || new Date().toISOString().split('T')[0],
      customInstructions: articleData.customInstructions || '',
      tags: articleData.tags || this.generateTags(articleData.keyword),
      outline: articleData.outline || this.generateOutline(articleData.keyword),
      ...articleData
    };

    this.articles.push(article);
    this.saveArticles();
    
    console.log(`✅ Article added: "${article.title}"`);
    return article;
  }

  updateArticleStatus(articleId, status) {
    const article = this.articles.find(a => a.id === articleId);
    if (article) {
      article.status = status;
      article.updatedAt = new Date().toISOString();
      this.saveArticles();
      console.log(`✅ Article status updated: ${article.title} -> ${status}`);
      return true;
    }
    return false;
  }

  getArticlesByStatus(status) {
    return this.articles.filter(article => article.status === status);
  }

  getUpcomingArticles(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return this.articles.filter(article => {
      const scheduledDate = new Date(article.scheduledDate);
      return scheduledDate <= cutoffDate && article.status === 'planned';
    });
  }

  // Custom Article Management (from custom-blog-manager.js)
  addCustomArticle(articleData) {
    const article = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: articleData.title,
      keyword: articleData.keyword,
      description: articleData.description || `Complete guide to ${articleData.keyword}`,
      category: articleData.category || 'whatsapp_automation',
      priority: articleData.priority || 'high',
      status: 'planned',
      targetWords: this.config.generation?.targetWords || 4000,
      includeImages: this.config.features?.imageGeneration || true,
      imageCount: this.config.features?.imageGeneration ? 4 : 0,
      createdAt: new Date().toISOString(),
      scheduledDate: articleData.scheduledDate || new Date().toISOString().split('T')[0],
      customInstructions: articleData.customInstructions || '',
      tags: articleData.tags || this.generateTags(articleData.keyword),
      outline: articleData.outline || this.generateOutline(articleData.keyword),
      wittyReplyMode: articleData.wittyReplyMode || false,
      ...articleData
    };

    this.customArticles.push(article);
    this.saveCustomArticles();
    
    console.log(`✅ Custom article added: "${article.title}"`);
    return article;
  }

  generateCustomArticle(articleId) {
    const article = this.customArticles.find(a => a.id === articleId);
    if (!article) {
      console.error(`Article not found: ${articleId}`);
      return null;
    }

    console.log(`🤖 Generating custom article: "${article.title}"`);
    
    try {
      // Generate content using AI
      const content = this.generateArticleContent(article);
      
      // Generate images if enabled
      let images = [];
      if (article.includeImages && this.config.features?.imageGeneration) {
        images = this.generateArticleImages(article, content);
      }

      // Generate internal links
      let internalLinks = [];
      if (this.config.features?.internalLinking) {
        internalLinks = this.generateInternalLinks(article, content);
      }

      // Create blog post data
      const postData = {
        title: article.title,
        keyword: article.keyword,
        description: article.description,
        outline: article.outline,
        difficulty: article.difficulty || 'intermediate',
        estimatedWords: article.targetWords,
        publishDate: new Date().toISOString().split('T')[0],
        slug: this.generateSlug(article.title),
        content: content,
        meta: this.generateMeta({
          title: article.title,
          description: article.description,
          keyword: article.keyword
        }),
        isAIGenerated: true,
        wordCount: this.estimateWordCount(content),
        images: images,
        hasImages: images.length > 0,
        internalLinks: internalLinks,
        linkCount: internalLinks.length,
        wittyReplyMode: article.wittyReplyMode,
        customInstructions: article.customInstructions,
        tags: article.tags
      };

      // Update article status
      article.status = 'generated';
      article.generatedAt = new Date().toISOString();
      article.wordCount = postData.wordCount;
      article.imageCount = images.length;
      this.saveCustomArticles();

      console.log(`✅ Custom article generated: "${article.title}" (${postData.wordCount} words, ${images.length} images)`);
      return postData;

    } catch (error) {
      console.error(`❌ Error generating custom article: ${error.message}`);
      article.status = 'failed';
      article.error = error.message;
      this.saveCustomArticles();
      return null;
    }
  }

  // Content Generation Methods
  generateArticleContent(article) {
    // Use AI content generator for custom articles
    const topic = {
      keyword: article.keyword,
      title: article.title,
      description: article.description,
      outline: article.outline,
      difficulty: article.difficulty || 'intermediate',
      estimatedWords: article.targetWords,
      customInstructions: article.customInstructions
    };

    // Generate structured content
    const structuredContent = this.aiContentGenerator.generateStructuredHTML({
      title: article.title,
      content: this.generateContentFromOutline(article.outline, article.keyword),
      keyword: article.keyword,
      description: article.description
    });

    return structuredContent;
  }

  generateContentFromOutline(outline, keyword) {
    let content = '';
    
    outline.forEach((section, index) => {
      content += `\n## ${section}\n\n`;
      
      // Generate section content based on section type
      if (section.toLowerCase().includes('introduction')) {
        content += this.generateIntroductionContent(keyword);
      } else if (section.toLowerCase().includes('benefit')) {
        content += this.generateBenefitsContent(keyword);
      } else if (section.toLowerCase().includes('implementation')) {
        content += this.generateImplementationContent(keyword);
      } else if (section.toLowerCase().includes('conclusion')) {
        content += this.generateConclusionContent(keyword);
      } else {
        content += this.generateGenericSectionContent(section, keyword);
      }
    });

    return content;
  }

  generateIntroductionContent(keyword) {
    const introductions = [
      `In today's fast-paced digital world, ${keyword} has become an essential tool for businesses looking to streamline operations and improve customer engagement.`,
      `The digital transformation of business communication has made ${keyword} a game-changer for modern enterprises seeking competitive advantages.`,
      `As customer expectations continue to rise, businesses are turning to ${keyword} to deliver exceptional service and drive growth.`,
      `The evolution of business automation has positioned ${keyword} as a critical component of successful digital strategies.`
    ];
    
    return introductions[Math.floor(Math.random() * introductions.length)];
  }

  generateBenefitsContent(keyword) {
    const benefits = [
      `Implementing ${keyword} offers numerous advantages for businesses of all sizes.`,
      `The benefits of ${keyword} extend far beyond simple automation, providing comprehensive solutions for modern business challenges.`,
      `Organizations that embrace ${keyword} typically see significant improvements in efficiency, customer satisfaction, and operational costs.`,
      `The strategic implementation of ${keyword} can transform how businesses interact with customers and manage internal processes.`
    ];
    
    return benefits[Math.floor(Math.random() * benefits.length)];
  }

  generateImplementationContent(keyword) {
    const implementations = [
      `Getting started with ${keyword} requires careful planning and strategic implementation.`,
      `The successful deployment of ${keyword} involves understanding your business needs and choosing the right approach.`,
      `Implementing ${keyword} effectively requires a step-by-step approach that considers your specific business requirements.`,
      `To maximize the benefits of ${keyword}, businesses should follow proven implementation strategies and best practices.`
    ];
    
    return implementations[Math.floor(Math.random() * implementations.length)];
  }

  generateConclusionContent(keyword) {
    const conclusions = [
      `${keyword} represents a significant opportunity for businesses to enhance their operations and customer experience.`,
      `The future of business automation lies in solutions like ${keyword} that provide comprehensive, intelligent capabilities.`,
      `Organizations that invest in ${keyword} today will be better positioned to compete in tomorrow's digital marketplace.`,
      `The benefits of ${keyword} are clear: improved efficiency, better customer service, and sustainable business growth.`
    ];
    
    return conclusions[Math.floor(Math.random() * conclusions.length)];
  }

  generateGenericSectionContent(section, keyword) {
    return `This section explores ${section.toLowerCase()} in the context of ${keyword}, providing valuable insights and practical guidance for implementation.`;
  }

  generateArticleImages(article, content) {
    // Generate images for custom articles
    const images = [];
    
    try {
      // Hero image
      const heroPrompt = this.generateHeroPrompt(article.title, article.keyword);
      const heroImage = this.imageGenerator.generateImage(heroPrompt, {
        aspectRatio: "16:9",
        megapixels: "1",
        outputQuality: 90
      });
      
      if (heroImage) {
        images.push({
          ...heroImage,
          type: 'hero',
          alt: `Hero image for ${article.title}`,
          caption: `Visual representation of ${article.keyword} concepts`
        });
      }

      // Section images based on outline
      article.outline.forEach((section, index) => {
        if (index < 3) { // Limit to 3 section images
          const sectionPrompt = this.generateSectionPrompt(section, article.keyword);
          const sectionImage = this.imageGenerator.generateImage(sectionPrompt, {
            aspectRatio: "16:9",
            megapixels: "1",
            outputQuality: 80
          });
          
          if (sectionImage) {
            images.push({
              ...sectionImage,
              type: 'section',
              alt: `Section image: ${section}`,
              caption: `Visual representation of ${section}`,
              sectionTitle: section
            });
          }
        }
      });

    } catch (error) {
      console.error('Error generating article images:', error);
    }

    return images;
  }

  generateHeroPrompt(title, keyword) {
    return `Professional business illustration showing ${keyword} concepts. Modern corporate environment with technology integration, clean design, business growth elements, professional color scheme, high quality, 16:9 aspect ratio`;
  }

  generateSectionPrompt(section, keyword) {
    return `Business infographic illustrating ${section} in the context of ${keyword}. Modern corporate design with workflow elements, professional color scheme, clean layout, high quality, 16:9 aspect ratio`;
  }

  generateInternalLinks(article, content) {
    return this.internalLinker.generateInternalLinks({
      title: article.title,
      keywords: [article.keyword],
      slug: this.generateSlug(article.title)
    }, 6);
  }

  // Utility Methods
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  generateMeta(data) {
    return this.templates.meta
      .replace(/\{\{title\}\}/g, data.title)
      .replace(/\{\{description\}\}/g, data.description)
      .replace(/\{\{keyword\}\}/g, data.keyword);
  }

  generateTags(keyword) {
    const baseTags = ['whatsapp', 'automation', 'business'];
    const keywordTags = keyword.split(' ').slice(0, 3);
    return [...new Set([...baseTags, ...keywordTags])];
  }

  generateOutline(keyword) {
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

  estimateWordCount(content) {
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textContent.split(' ').length;
  }

  // CLI Interface
  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    const value = args[2];

    switch (command) {
      case 'add':
        const articleData = {
          title: param || 'New Article',
          keyword: value || 'whatsapp automation',
          description: `Complete guide to ${value || 'whatsapp automation'}`,
          priority: 'high'
        };
        this.addArticle(articleData);
        break;

      case 'add-custom':
        const customData = {
          title: param || 'Custom Article',
          keyword: value || 'whatsapp automation',
          description: `Custom guide to ${value || 'whatsapp automation'}`,
          priority: 'high',
          wittyReplyMode: false
        };
        this.addCustomArticle(customData);
        break;

      case 'list':
        const status = param || 'all';
        if (status === 'all') {
          console.log('\n📝 All Articles:');
          console.log(`Regular: ${this.articles.length}`);
          console.log(`Custom: ${this.customArticles.length}`);
        } else {
          const articles = this.getArticlesByStatus(status);
          console.log(`\n📝 Articles with status "${status}": ${articles.length}`);
          articles.forEach(article => {
            console.log(`  - ${article.title} (${article.keyword})`);
          });
        }
        break;

      case 'upcoming':
        const days = parseInt(param) || 7;
        const upcoming = this.getUpcomingArticles(days);
        console.log(`\n📅 Upcoming articles (next ${days} days): ${upcoming.length}`);
        upcoming.forEach(article => {
          console.log(`  - ${article.title} (${article.scheduledDate})`);
        });
        break;

      case 'generate':
        const articleId = param;
        if (articleId) {
          this.generateCustomArticle(articleId);
        } else {
          console.log('Please provide an article ID');
        }
        break;

      case 'status':
        const id = param;
        const newStatus = value;
        if (id && newStatus) {
          this.updateArticleStatus(id, newStatus);
        } else {
          console.log('Please provide article ID and new status');
        }
        break;

      default:
        console.log(`
📚 Blog Manager

Usage:
  node blog-manager.js add [title] [keyword]           - Add new article
  node blog-manager.js add-custom [title] [keyword]    - Add custom article
  node blog-manager.js list [status]                   - List articles by status
  node blog-manager.js upcoming [days]                  - Show upcoming articles
  node blog-manager.js generate [article-id]            - Generate custom article
  node blog-manager.js status [id] [status]             - Update article status

Examples:
  node blog-manager.js add "WhatsApp AI Guide" "whatsapp ai"
  node blog-manager.js add-custom "Custom Guide" "automation"
  node blog-manager.js list planned
  node blog-manager.js upcoming 14
  node blog-manager.js generate custom-1234567890-abc123
  node blog-manager.js status article-1234567890-abc123 generated

Features:
  📝 Article lifecycle management
  🎯 Custom article generation
  📊 Status tracking
  📅 Scheduling system
  🏷️  Tag and category management
  📈 Progress monitoring
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new BlogManager();
  manager.runCLI().catch(console.error);
}

export default BlogManager;
