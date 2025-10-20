#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CustomBlogManager from './custom-blog-manager.js';
import WittyReplyContentEnhancer from './wittyreply-content-enhancer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WittyReplyArticleGenerator {
  constructor() {
    this.blogManager = new CustomBlogManager();
    this.contentEnhancer = new WittyReplyContentEnhancer();
  }

  async generateAllArticles() {
    console.log('\n🎯 GENERATING ALL WITTYREPLY ARTICLES');
    console.log('=' .repeat(50));
    
    const articles = this.blogManager.articles.filter(a => a.status === 'planned');
    console.log(`📝 Found ${articles.length} articles to generate`);
    
    const results = [];
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n🚀 Generating ${i + 1}/${articles.length}: "${article.title}"`);
      console.log(`   📝 Keyword: ${article.keyword}`);
      console.log(`   📊 Category: ${article.category}`);
      console.log(`   ⭐ Priority: ${article.priority}`);
      
      try {
        const result = await this.generateArticle(article);
        results.push(result);
        
        // Add delay between articles to avoid rate limiting
        if (i < articles.length - 1) {
          console.log('⏳ Waiting 30 seconds before next article...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to generate article "${article.title}": ${error.message}`);
        results.push({
          success: false,
          article,
          error: error.message
        });
      }
    }
    
    this.printSummary(results);
    return results;
  }

  async generateArticle(article) {
    try {
      // Generate the article using the blog manager
      const result = await this.blogManager.generateArticle(article.id);
      
      if (result.success) {
        // Enhance content with WittyReply-specific information
        const enhancedContent = this.contentEnhancer.enhanceContentWithWittyReply(
          result.postData.content, 
          article.keyword
        );
        
        // Update the article with enhanced content
        const updatedArticle = this.blogManager.updateArticle(article.id, {
          content: enhancedContent,
          enhanced: true,
          enhancedAt: new Date().toISOString()
        });
        
        console.log(`✅ Successfully generated: "${article.title}"`);
        console.log(`   📊 Words: ${result.wordCount || 'N/A'}`);
        console.log(`   🎨 Images: ${result.imageCount || 0}`);
        console.log(`   🔗 Links: ${result.linkCount || 0}`);
        console.log(`   ✨ Enhanced with WittyReply content`);
        
        return {
          success: true,
          article: updatedArticle,
          result,
          enhanced: true
        };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error(`❌ Error generating article: ${error.message}`);
      return {
        success: false,
        article,
        error: error.message
      };
    }
  }

  printSummary(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 WITTYREPLY ARTICLE GENERATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📝 Total Articles: ${results.length}`);
    
    if (successful.length > 0) {
      const totalWords = successful.reduce((sum, r) => sum + (r.result?.wordCount || 0), 0);
      const totalImages = successful.reduce((sum, r) => sum + (r.result?.imageCount || 0), 0);
      const totalLinks = successful.reduce((sum, r) => sum + (r.result?.linkCount || 0), 0);
      
      console.log(`📊 Total Words Generated: ${totalWords.toLocaleString()}`);
      console.log(`🎨 Total Images Generated: ${totalImages}`);
      console.log(`🔗 Total Internal Links: ${totalLinks}`);
      console.log(`✨ All articles enhanced with WittyReply content`);
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Articles:');
      failed.forEach(f => console.log(`  - ${f.article.title}: ${f.error}`));
    }
    
    console.log('\n🎉 WittyReply article generation complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review generated articles in the posts/ directory');
    console.log('2. Customize WittyReply mentions as needed');
    console.log('3. Publish articles to your blog');
    console.log('4. Share on social media and track performance');
  }

  async generateSpecificArticle(keyword) {
    const article = this.blogManager.articles.find(a => 
      a.keyword === keyword && a.status === 'planned'
    );
    
    if (!article) {
      console.log(`❌ Article not found for keyword: ${keyword}`);
      return;
    }
    
    console.log(`\n🚀 Generating specific article: "${article.title}"`);
    return await this.generateArticle(article);
  }

  runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const keyword = args[1];
    
    switch (command) {
      case 'all':
        this.generateAllArticles();
        break;
        
      case 'specific':
        if (keyword) {
          this.generateSpecificArticle(keyword);
        } else {
          console.log('Please provide a keyword to generate specific article');
        }
        break;
        
      case 'list':
        this.listPlannedArticles();
        break;
        
      default:
        console.log(`
🎯 WittyReply Article Generator

Usage:
  node generate-wittyreply-articles.js all                    - Generate all planned articles
  node generate-wittyreply-articles.js specific [keyword]     - Generate specific article
  node generate-wittyreply-articles.js list                   - List planned articles

Examples:
  node generate-wittyreply-articles.js all
  node generate-wittyreply-articles.js specific "best whatsapp chatbot platform"
  node generate-wittyreply-articles.js list

Features:
  ✨ Generates ~4000-word articles with 4 images each
  🎯 Enhanced with WittyReply product positioning
  🔗 Includes internal linking and SEO optimization
  📊 Comprehensive analytics and reporting
        `);
    }
  }

  listPlannedArticles() {
    console.log('\n📝 PLANNED WITTYREPLY ARTICLES');
    console.log('=' .repeat(40));
    
    const articles = this.blogManager.articles.filter(a => a.status === 'planned');
    
    if (articles.length === 0) {
      console.log('No planned articles found.');
      return;
    }
    
    articles.forEach((article, index) => {
      const priority = article.priority === 'high' ? '🔴' : 
                      article.priority === 'medium' ? '🟡' : '🟢';
      
      console.log(`\n${index + 1}. ${priority} ${article.title}`);
      console.log(`   📝 Keyword: ${article.keyword}`);
      console.log(`   📊 Category: ${article.category}`);
      console.log(`   🆔 ID: ${article.id}`);
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new WittyReplyArticleGenerator();
  generator.runCLI();
}

export default WittyReplyArticleGenerator;
