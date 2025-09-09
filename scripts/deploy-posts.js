#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PostDeployer {
  constructor() {
    this.sourceDir = path.join(__dirname, '../posts');
    this.distDir = path.join(__dirname, '../dist/posts');
  }

  async deployNewPosts() {
    try {
      console.log('🚀 Deploying blog posts to dist...');
      
      // Ensure dist/posts directory exists
      if (!fs.existsSync(this.distDir)) {
        fs.mkdirSync(this.distDir, { recursive: true });
        console.log('📁 Created dist/posts directory');
      }

      // Get all posts from source
      const sourcePosts = fs.readdirSync(this.sourceDir).filter(file => file.endsWith('.html'));
      
      // Get existing posts in dist
      const distPosts = fs.readdirSync(this.distDir).filter(file => file.endsWith('.html'));
      
      // Find new posts that need to be deployed
      const newPosts = sourcePosts.filter(post => !distPosts.includes(post));
      
      if (newPosts.length === 0) {
        console.log('✅ All posts are already deployed');
        return;
      }

      console.log(`📝 Found ${newPosts.length} new posts to deploy:`);
      
      // Copy new posts
      let deployedCount = 0;
      for (const post of newPosts) {
        const sourcePath = path.join(this.sourceDir, post);
        const distPath = path.join(this.distDir, post);
        
        try {
          fs.copyFileSync(sourcePath, distPath);
          console.log(`  ✅ ${post}`);
          deployedCount++;
        } catch (error) {
          console.log(`  ❌ Failed to copy ${post}: ${error.message}`);
        }
      }
      
      console.log(`\n🎉 Successfully deployed ${deployedCount}/${newPosts.length} posts!`);
      
      // Also update the 404.html in dist if it exists
      this.updateDistFiles();
      
    } catch (error) {
      console.error('❌ Error deploying posts:', error.message);
      throw error;
    }
  }

  updateDistFiles() {
    try {
      const source404 = path.join(__dirname, '../404.html');
      const dist404 = path.join(__dirname, '../dist/404.html');
      
      if (fs.existsSync(source404) && fs.existsSync(dist404)) {
        fs.copyFileSync(source404, dist404);
        console.log('✅ Updated dist/404.html with fixed links');
      }
    } catch (error) {
      console.log(`⚠️ Could not update 404.html: ${error.message}`);
    }
  }

  // List all posts and their status
  listPosts() {
    console.log('📊 Blog Posts Status:');
    console.log('='.repeat(50));
    
    const sourcePosts = fs.readdirSync(this.sourceDir).filter(file => file.endsWith('.html'));
    const distPosts = fs.existsSync(this.distDir) ? fs.readdirSync(this.distDir).filter(file => file.endsWith('.html')) : [];
    
    sourcePosts.forEach(post => {
      const isDeployed = distPosts.includes(post);
      const status = isDeployed ? '✅ Deployed' : '⏳ Pending';
      console.log(`${status} ${post}`);
    });
    
    console.log(`\nTotal: ${sourcePosts.length} posts, ${distPosts.length} deployed`);
  }

  // CLI interface
  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'deploy':
        await this.deployNewPosts();
        break;
        
      case 'list':
        this.listPosts();
        break;
        
      case 'force-all':
        console.log('🔄 Force deploying all posts...');
        // Remove dist posts and redeploy all
        if (fs.existsSync(this.distDir)) {
          fs.rmSync(this.distDir, { recursive: true });
        }
        await this.deployNewPosts();
        break;
        
      default:
        console.log(`
🚀 Post Deployment Tool

Usage:
  node deploy-posts.js deploy     - Deploy new posts to dist/
  node deploy-posts.js list       - List all posts and their status  
  node deploy-posts.js force-all  - Force redeploy all posts

Examples:
  node deploy-posts.js deploy     - Deploy latest AI-generated posts
  node deploy-posts.js list       - Check which posts need deployment
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployer = new PostDeployer();
  deployer.runCLI().catch(console.error);
}

export default PostDeployer;

