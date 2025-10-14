#!/usr/bin/env node

/**
 * Keyword Configuration for Blog Generation
 * 
 * This file allows you to easily configure keyword behavior:
 * - Enable/disable base keywords
 * - Customize base keywords
 * - Set keyword generation mode
 */

export const KEYWORD_CONFIG = {
  // Set to true to include base keywords, false to use only primary keyword
  useBaseKeywords: false,
  
  // Base keywords that will be added to every article (when useBaseKeywords is true)
  baseKeywords: [
    'whatsapp automation',
    'business automation',
    'customer service automation',
    'lead generation',
    'business efficiency',
    'digital marketing',
    'customer engagement'
  ],
  
  // Alternative: Use only primary keyword + 2-3 related keywords
  useRelatedKeywords: false,
  
  // Related keywords mapping (when useRelatedKeywords is true)
  relatedKeywords: {
    'whatsapp automation': ['messaging automation', 'chat automation', 'customer communication'],
    'digital marketing': ['online marketing', 'internet marketing', 'web marketing'],
    'social media marketing': ['social media strategy', 'social media management', 'social media advertising'],
    'lead generation': ['prospect generation', 'customer acquisition', 'sales leads'],
    'customer service': ['customer support', 'client service', 'customer care'],
    'business automation': ['process automation', 'workflow automation', 'business efficiency']
  }
};

export function getKeywords(primaryKeyword, config = KEYWORD_CONFIG) {
  if (!config.useBaseKeywords && !config.useRelatedKeywords) {
    // Use only primary keyword
    return primaryKeyword;
  }
  
  if (config.useRelatedKeywords && config.relatedKeywords[primaryKeyword]) {
    // Use primary keyword + related keywords
    const related = config.relatedKeywords[primaryKeyword];
    return [primaryKeyword, ...related].join(', ');
  }
  
  if (config.useBaseKeywords) {
    // Use primary keyword + base keywords
    return [primaryKeyword, ...config.baseKeywords].join(', ');
  }
  
  return primaryKeyword;
}

export function updateKeywordConfig(newConfig) {
  Object.assign(KEYWORD_CONFIG, newConfig);
  return KEYWORD_CONFIG;
}
