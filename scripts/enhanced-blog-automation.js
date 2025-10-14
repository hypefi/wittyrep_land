#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BlogPostGenerator from './blog-generator.js';
import AIContentGenerator from './ai-title-generator.js';
import ImageGenerator from './image-generator.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedBlogAutomation {
  constructor() {
    this.blogGenerator = new BlogPostGenerator();
    this.aiContentGenerator = new AIContentGenerator();
    this.imageGenerator = new ImageGenerator();
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../config/automation.json');
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.log('Using default configuration');
    }
    
    return {
      targetWords: 4000,
      includeImages: true,
      imageCount: 4,
      useBaseKeywords: false, // Set to false to disable base keywords
      industries: ['business automation', 'customer service', 'lead generation', 'small business'],
      keywords: [
        'whatsapp automation for small business',
        'customer service automation strategies',
        'lead generation automation tools',
        'business process automation',
        'whatsapp marketing automation',
        'automated customer support',
        'business efficiency automation',
        'digital transformation strategies'
      ]
    };
  }

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
      
      // Generate the blog post with images
      const postData = await this.blogGenerator.generateBlogPost({
        keyword: keyword,
        title: this.generateTitleFromKeyword(keyword),
        description: `Comprehensive guide to ${keyword} for modern businesses`,
        difficulty: 'intermediate',
        estimatedWords: this.config.targetWords
      });

      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Save the blog post
      const filepath = this.blogGenerator.saveBlogPost(postData);
      
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

  generateTitleFromKeyword(keyword) {
    // Convert keyword to a more readable title
    return keyword
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      slug: postData.slug,
      publishDate: postData.publishDate
    };

    // Save report to logs
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `enhanced-blog-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📊 Report saved: ${reportFile}`);
  }

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

  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    
    switch (command) {
      case 'generate':
        const keyword = param || this.config.keywords[0];
        await this.generateEnhancedBlogPost(keyword);
        break;
        
      case 'generate-multiple':
        const count = parseInt(param) || 3;
        await this.generateMultiplePosts(count);
        break;
        
      case 'test-images':
        await this.testImageGeneration();
        break;
        
      case 'config':
        console.log('\n📋 Current Configuration:');
        console.log(JSON.stringify(this.config, null, 2));
        break;
        
      default:
        console.log(`
🚀 Enhanced Blog Automation Tool

Usage:
  node enhanced-blog-automation.js generate [keyword]     - Generate single enhanced blog post
  node enhanced-blog-automation.js generate-multiple [n] - Generate multiple posts (default: 3)
  node enhanced-blog-automation.js test-images           - Test image generation
  node enhanced-blog-automation.js config                - Show current configuration

Features:
  ✨ 4000-word comprehensive articles
  🎨 AI-generated images using Flux Dev
  📊 Detailed analytics and reporting
  🔄 Automated deployment ready
  📱 Mobile-optimized HTML output

Examples:
  node enhanced-blog-automation.js generate "whatsapp automation"
  node enhanced-blog-automation.js generate-multiple 5
  node enhanced-blog-automation.js test-images

Environment Variables Required:
  OPENAI_API_KEY     - For content generation
  REPLICATE_API_TOKEN - For image generation (optional)
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new EnhancedBlogAutomation();
  automation.runCLI().catch(console.error);
}

export default EnhancedBlogAutomation;
