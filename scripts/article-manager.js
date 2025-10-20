#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CustomBlogManager from './custom-blog-manager.js';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ArticleManager {
  constructor() {
    this.blogManager = new CustomBlogManager();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('\n🎯 WITTYREPLY ARTICLE MANAGER');
    console.log('Full Control Over Titles, Keywords & 4000-Word Articles');
    console.log('=' .repeat(60));
    
    while (true) {
      await this.showMenu();
      const choice = await this.askQuestion('\nEnter your choice: ');
      
      switch (choice) {
        case '1':
          await this.addArticle();
          break;
        case '2':
          await this.listArticles();
          break;
        case '3':
          await this.generateArticle();
          break;
        case '4':
          await this.updateArticle();
          break;
        case '5':
          await this.deleteArticle();
          break;
        case '6':
          await this.exportArticles();
          break;
        case '7':
          await this.bulkAddArticles();
          break;
        case '8':
          await this.showStatus();
          break;
        case '9':
          console.log('\n👋 Goodbye!');
          this.rl.close();
          return;
        default:
          console.log('\n❌ Invalid choice. Please try again.');
      }
    }
  }

  async showMenu() {
    console.log('\n📋 MAIN MENU');
    console.log('-'.repeat(20));
    console.log('1. ➕ Add New Article');
    console.log('2. 📝 List All Articles');
    console.log('3. 🚀 Generate Article');
    console.log('4. ✏️  Update Article');
    console.log('5. 🗑️  Delete Article');
    console.log('6. 📤 Export Articles');
    console.log('7. 📦 Bulk Add Articles');
    console.log('8. 📊 Show Status');
    console.log('9. 🚪 Exit');
  }

  async addArticle() {
    console.log('\n➕ ADD NEW ARTICLE');
    console.log('-'.repeat(20));
    
    const title = await this.askQuestion('📝 Article Title: ');
    const keyword = await this.askQuestion('🔑 Primary Keyword: ');
    const description = await this.askQuestion('📄 Description (optional): ') || `Complete guide to ${keyword}`;
    
    console.log('\n📊 Category Options:');
    console.log('1. whatsapp_automation (High Priority)');
    console.log('2. business_growth (High Priority)');
    console.log('3. industry_specific (Medium Priority)');
    console.log('4. seasonal_topics (Medium Priority)');
    console.log('5. case_studies (Medium Priority)');
    console.log('6. tutorials (High Priority)');
    console.log('7. comparisons (Low Priority)');
    
    const categoryChoice = await this.askQuestion('Choose category (1-7): ');
    const categories = ['whatsapp_automation', 'business_growth', 'industry_specific', 'seasonal_topics', 'case_studies', 'tutorials', 'comparisons'];
    const category = categories[parseInt(categoryChoice) - 1] || 'whatsapp_automation';
    
    console.log('\n⭐ Priority Options:');
    console.log('1. High (🔴)');
    console.log('2. Medium (🟡)');
    console.log('3. Low (🟢)');
    
    const priorityChoice = await this.askQuestion('Choose priority (1-3): ');
    const priorities = ['high', 'medium', 'low'];
    const priority = priorities[parseInt(priorityChoice) - 1] || 'high';
    
    const scheduledDate = await this.askQuestion('📅 Scheduled Date (YYYY-MM-DD, optional): ') || new Date().toISOString().split('T')[0];
    const customInstructions = await this.askQuestion('💡 Custom Instructions (optional): ') || '';
    
    const articleData = {
      title,
      keyword,
      description,
      category,
      priority,
      scheduledDate,
      customInstructions
    };
    
    const article = this.blogManager.addArticle(articleData);
    
    console.log(`\n✅ Article added successfully!`);
    console.log(`📝 ID: ${article.id}`);
    console.log(`📊 Target Words: ${article.targetWords}`);
    console.log(`🎨 Images: ${article.imageCount}`);
  }

  async listArticles() {
    console.log('\n📝 ALL ARTICLES');
    console.log('=' .repeat(40));
    
    const articles = this.blogManager.articles;
    if (articles.length === 0) {
      console.log('No articles found. Add some articles first!');
      return;
    }
    
    articles.forEach((article, index) => {
      const status = article.status === 'completed' ? '✅' : 
                   article.status === 'failed' ? '❌' : '📋';
      const priority = article.priority === 'high' ? '🔴' : 
                      article.priority === 'medium' ? '🟡' : '🟢';
      
      console.log(`\n${index + 1}. ${status} ${priority} ${article.title}`);
      console.log(`   📝 Keyword: ${article.keyword}`);
      console.log(`   📅 Scheduled: ${article.scheduledDate}`);
      console.log(`   📊 Status: ${article.status}`);
      console.log(`   🆔 ID: ${article.id}`);
      
      if (article.wordCount) {
        console.log(`   📊 Words: ${article.wordCount}`);
      }
      if (article.imageCount) {
        console.log(`   🎨 Images: ${article.imageCount}`);
      }
      if (article.generationTime) {
        console.log(`   ⏱️  Generation Time: ${article.generationTime}s`);
      }
    });
  }

  async generateArticle() {
    console.log('\n🚀 GENERATE ARTICLE');
    console.log('-'.repeat(20));
    
    const articles = this.blogManager.articles.filter(a => a.status === 'planned');
    if (articles.length === 0) {
      console.log('No planned articles found. Add some articles first!');
      return;
    }
    
    console.log('\n📋 Planned Articles:');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.keyword})`);
    });
    
    const choice = await this.askQuestion('\nEnter article number to generate: ');
    const articleIndex = parseInt(choice) - 1;
    
    if (articleIndex >= 0 && articleIndex < articles.length) {
      const article = articles[articleIndex];
      console.log(`\n🚀 Generating: "${article.title}"`);
      
      try {
        const result = await this.blogManager.generateArticle(article.id);
        if (result.success) {
          console.log(`\n✅ Article generated successfully!`);
          console.log(`📁 File: ${result.filename}`);
        } else {
          console.log(`\n❌ Failed to generate article: ${result.error}`);
        }
      } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
      }
    } else {
      console.log('❌ Invalid article number');
    }
  }

  async updateArticle() {
    console.log('\n✏️  UPDATE ARTICLE');
    console.log('-'.repeat(20));
    
    const articles = this.blogManager.articles;
    if (articles.length === 0) {
      console.log('No articles found. Add some articles first!');
      return;
    }
    
    console.log('\n📋 All Articles:');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.id})`);
    });
    
    const choice = await this.askQuestion('\nEnter article number to update: ');
    const articleIndex = parseInt(choice) - 1;
    
    if (articleIndex >= 0 && articleIndex < articles.length) {
      const article = articles[articleIndex];
      console.log(`\n📝 Updating: "${article.title}"`);
      
      const newTitle = await this.askQuestion(`New title (current: ${article.title}): `) || article.title;
      const newKeyword = await this.askQuestion(`New keyword (current: ${article.keyword}): `) || article.keyword;
      const newDescription = await this.askQuestion(`New description (current: ${article.description}): `) || article.description;
      
      const updates = {
        title: newTitle,
        keyword: newKeyword,
        description: newDescription,
        updatedAt: new Date().toISOString()
      };
      
      this.blogManager.updateArticle(article.id, updates);
      console.log(`\n✅ Article updated successfully!`);
    } else {
      console.log('❌ Invalid article number');
    }
  }

  async deleteArticle() {
    console.log('\n🗑️  DELETE ARTICLE');
    console.log('-'.repeat(20));
    
    const articles = this.blogManager.articles;
    if (articles.length === 0) {
      console.log('No articles found. Add some articles first!');
      return;
    }
    
    console.log('\n📋 All Articles:');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.id})`);
    });
    
    const choice = await this.askQuestion('\nEnter article number to delete: ');
    const articleIndex = parseInt(choice) - 1;
    
    if (articleIndex >= 0 && articleIndex < articles.length) {
      const article = articles[articleIndex];
      const confirm = await this.askQuestion(`\n⚠️  Are you sure you want to delete "${article.title}"? (y/N): `);
      
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        this.blogManager.deleteArticle(article.id);
        console.log(`\n✅ Article deleted successfully!`);
      } else {
        console.log('❌ Deletion cancelled');
      }
    } else {
      console.log('❌ Invalid article number');
    }
  }

  async exportArticles() {
    console.log('\n📤 EXPORT ARTICLES');
    console.log('-'.repeat(20));
    
    console.log('Export formats:');
    console.log('1. JSON');
    console.log('2. CSV');
    
    const formatChoice = await this.askQuestion('Choose format (1-2): ');
    const format = formatChoice === '2' ? 'csv' : 'json';
    
    const filepath = this.blogManager.exportArticles(format);
    console.log(`\n✅ Articles exported to: ${filepath}`);
  }

  async bulkAddArticles() {
    console.log('\n📦 BULK ADD ARTICLES');
    console.log('-'.repeat(20));
    
    console.log('This will add multiple articles at once.');
    console.log('Enter articles one by one, or type "done" when finished.');
    
    let count = 0;
    while (true) {
      console.log(`\n--- Article ${count + 1} ---`);
      const title = await this.askQuestion('Title (or "done" to finish): ');
      
      if (title.toLowerCase() === 'done') {
        break;
      }
      
      const keyword = await this.askQuestion('Keyword: ');
      const description = await this.askQuestion('Description (optional): ') || `Complete guide to ${keyword}`;
      
      const articleData = {
        title,
        keyword,
        description,
        category: 'whatsapp_automation',
        priority: 'high'
      };
      
      this.blogManager.addArticle(articleData);
      count++;
    }
    
    console.log(`\n✅ Added ${count} articles successfully!`);
  }

  async showStatus() {
    console.log('\n📊 SYSTEM STATUS');
    console.log('-'.repeat(20));
    
    const articles = this.blogManager.articles;
    const total = articles.length;
    const completed = articles.filter(a => a.status === 'completed').length;
    const planned = articles.filter(a => a.status === 'planned').length;
    const failed = articles.filter(a => a.status === 'failed').length;
    
    console.log(`📝 Total Articles: ${total}`);
    console.log(`✅ Completed: ${completed}`);
    console.log(`📋 Planned: ${planned}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (total > 0) {
      const completionRate = ((completed / total) * 100).toFixed(1);
      console.log(`📈 Completion Rate: ${completionRate}%`);
    }
    
    const totalWords = articles.reduce((sum, a) => sum + (a.wordCount || 0), 0);
    const totalImages = articles.reduce((sum, a) => sum + (a.imageCount || 0), 0);
    
    console.log(`📊 Total Words Generated: ${totalWords.toLocaleString()}`);
    console.log(`🎨 Total Images Generated: ${totalImages}`);
    
    if (completed > 0) {
      const avgWords = (totalWords / completed).toFixed(0);
      const avgImages = (totalImages / completed).toFixed(1);
      console.log(`📊 Average Words per Article: ${avgWords}`);
      console.log(`🎨 Average Images per Article: ${avgImages}`);
    }
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ArticleManager();
  manager.start().catch(console.error);
}

export default ArticleManager;
