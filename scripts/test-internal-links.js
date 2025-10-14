#!/usr/bin/env node

import InternalLinker from './internal-linker.js';

console.log('🔗 Internal Linking System Test\n');
console.log('=' .repeat(50));

const linker = new InternalLinker();

// Show link database stats
const stats = linker.getLinkStats();
console.log('📚 Link Database Statistics:');
console.log(`Total Articles: ${stats.totalArticles}`);
console.log(`Total Keywords: ${stats.totalKeywords}`);
console.log('\n📂 Categories:');
stats.categories.forEach(cat => {
  if (cat.count > 0) {
    console.log(`  ${cat.name}: ${cat.count} articles`);
  }
});

console.log('\n' + '=' .repeat(50));

// Test internal link generation for different keywords
const testKeywords = [
  'whatsapp ai agent free',
  'digital marketing strategies',
  'social media marketing',
  'customer service automation'
];

testKeywords.forEach(keyword => {
  console.log(`\n🔍 Testing internal links for: "${keyword}"`);
  console.log('-'.repeat(40));
  
  const links = linker.generateInternalLinks({
    title: `Complete Guide to ${keyword}`,
    keywords: [keyword],
    slug: keyword.toLowerCase().replace(/\s+/g, '-')
  }, 5);
  
  if (links.length > 0) {
    console.log(`Found ${links.length} relevant articles:`);
    links.forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.anchorText}`);
      console.log(`     URL: ${link.distUrl}`);
      console.log(`     Relevance: ${(link.relevance * 100).toFixed(1)}%`);
      console.log(`     Keywords: ${link.keywords.slice(0, 3).join(', ')}`);
      console.log('');
    });
  } else {
    console.log('No relevant articles found for internal linking.');
  }
});

console.log('\n✅ Internal linking system test complete!');
console.log('\nTo use internal linking in blog generation:');
console.log('node scripts/enhanced-blog-automation.js generate "your keyword"');
