#!/usr/bin/env node

import { getKeywords, updateKeywordConfig } from './keyword-config.js';

console.log('🔑 Keyword Configuration Test\n');
console.log('=' .repeat(50));

// Test 1: Only primary keyword (current setting)
console.log('📝 Mode 1: Only Primary Keyword');
console.log('Input: "social media marketing"');
console.log('Output:', getKeywords('social media marketing'));
console.log('');

// Test 2: Enable base keywords
console.log('📝 Mode 2: Primary + Base Keywords');
updateKeywordConfig({ useBaseKeywords: true });
console.log('Input: "social media marketing"');
console.log('Output:', getKeywords('social media marketing'));
console.log('');

// Test 3: Enable related keywords
console.log('📝 Mode 3: Primary + Related Keywords');
updateKeywordConfig({ 
  useBaseKeywords: false, 
  useRelatedKeywords: true 
});
console.log('Input: "social media marketing"');
console.log('Output:', getKeywords('social media marketing'));
console.log('');

// Test 4: Different keyword with related
console.log('📝 Mode 4: Different Keyword with Related');
console.log('Input: "whatsapp automation"');
console.log('Output:', getKeywords('whatsapp automation'));
console.log('');

// Test 5: Keyword without related mapping
console.log('📝 Mode 5: Keyword without Related Mapping');
console.log('Input: "email marketing"');
console.log('Output:', getKeywords('email marketing'));
console.log('');

console.log('✅ Keyword configuration test complete!');
console.log('\nTo change the default behavior, edit scripts/keyword-config.js');
