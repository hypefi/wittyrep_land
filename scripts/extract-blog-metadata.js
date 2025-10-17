#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractBlogMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract title
    const titleMatch = content.match(/<title>(.*?) - WittyReply Blog<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    
    // Extract description
    const descMatch = content.match(/<meta name="description" content="(.*?)">/);
    const description = descMatch ? descMatch[1] : '';
    
    // Extract keywords
    const keywordsMatch = content.match(/<meta name="keywords" content="(.*?)">/);
    const keywords = keywordsMatch ? keywordsMatch[1].split(', ') : [];
    
    // Extract main heading
    const headingMatch = content.match(/<h1[^>]*class="[^"]*gradient-text[^"]*"[^>]*>(.*?)<\/h1>/);
    const mainHeading = headingMatch ? headingMatch[1].replace(/<[^>]*>/g, '') : title;
    
    // Extract filename
    const filename = path.basename(filePath);
    
    // Extract date from filename
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    const publishDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    
    // Determine category and color based on keywords
    const category = determineCategory(keywords, title);
    
    // Estimate reading time (rough calculation)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(5, Math.ceil(wordCount / 200));
    
    return {
      title: mainHeading,
      description,
      keywords,
      filename,
      publishDate,
      category,
      readingTime,
      wordCount
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error);
    return null;
  }
}

function determineCategory(keywords, title) {
  const text = `${title} ${keywords.join(' ')}`.toLowerCase();
  
  if (text.includes('ai') || text.includes('artificial intelligence')) {
    return { name: 'AI Tools', color: 'purple' };
  } else if (text.includes('api') || text.includes('integration')) {
    return { name: 'API', color: 'blue' };
  } else if (text.includes('free') || text.includes('cost')) {
    return { name: 'Free Tools', color: 'green' };
  } else if (text.includes('business') || text.includes('growth')) {
    return { name: 'Business', color: 'green' };
  } else if (text.includes('marketing') || text.includes('digital')) {
    return { name: 'Marketing', color: 'blue' };
  } else if (text.includes('automation') || text.includes('chatbot')) {
    return { name: 'Automation', color: 'green' };
  } else {
    return { name: 'Tips', color: 'gray' };
  }
}

function generateBlogCard(metadata) {
  const { title, description, filename, publishDate, category, readingTime, keywords } = metadata;
  
  // Format date
  const date = new Date(publishDate);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Get top 3 keywords for tags
  const topKeywords = keywords.slice(0, 3);
  
  return `
          <article class="card">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <span class="bg-${category.color}-500/20 text-${category.color}-400 px-3 py-1 rounded-full text-sm font-medium">${category.name}</span>
                <span class="text-gray-400 text-sm">${formattedDate}</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 leading-tight">
                <a href="posts/${filename}" class="text-white hover:text-primary-400 transition-colors">
                  ${title}
                </a>
              </h3>
              <p class="text-gray-300 mb-4">
                ${description}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-400">📖 ${readingTime} min read</span>
                  <div class="flex space-x-2">
                    ${topKeywords.map(keyword => 
                      `<span class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">${keyword}</span>`
                    ).join('')}
                  </div>
                </div>
                <a href="posts/${filename}" class="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                  Read More →
                </a>
              </div>
            </div>
          </article>`;
}

// Main execution
const postsDir = path.join(__dirname, '../posts');
const newPosts = fs.readdirSync(postsDir)
  .filter(file => file.includes('2025-10-14') && file.endsWith('.html'))
  .map(file => path.join(postsDir, file));

console.log('📝 Extracting metadata from new blog posts...\n');

const blogCards = [];
newPosts.forEach(postPath => {
  const metadata = extractBlogMetadata(postPath);
  if (metadata) {
    console.log(`✅ ${metadata.title}`);
    console.log(`   Category: ${metadata.category.name}`);
    console.log(`   Keywords: ${metadata.keywords.slice(0, 3).join(', ')}`);
    console.log(`   Reading Time: ${metadata.readingTime} min\n`);
    
    blogCards.push(generateBlogCard(metadata));
  }
});

console.log(`\n🎉 Generated ${blogCards.length} blog cards!`);
console.log('\n📋 Blog Cards HTML:');
console.log('=' .repeat(50));
blogCards.forEach((card, index) => {
  console.log(`\n<!-- Card ${index + 1} -->`);
  console.log(card);
});

// Save to file
const outputFile = path.join(__dirname, '../new-blog-cards.html');
fs.writeFileSync(outputFile, blogCards.join('\n\n'));
console.log(`\n💾 Blog cards saved to: ${outputFile}`);

