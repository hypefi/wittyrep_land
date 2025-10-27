#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '../config/automation.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        return this.validateAndMergeConfig(configData);
      }
    } catch (error) {
      console.log('Error loading config file, using defaults:', error.message);
    }
    
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      generation: {
        targetWords: 4000,
        postsPerDay: 1,
        maxPostsInQueue: 30,
        contentVariation: 'high',
        keywordsPerPost: 3,
        autoPublish: false,
        autoDeploy: true
      },
      features: {
        wittyReplyBranding: false,
        contentEnhancement: true,
        imageGeneration: true,
        internalLinking: true,
        planning: true,
        seoOptimization: true,
        socialSharing: false,
        qualityCheck: true,
        backupEnabled: true
      },
      keywordSources: ['built-in', 'csv'],
      csvKeywordPath: 'wittyreply_seo/whatsapp_ai_ENHANCED.csv',
      industries: [
        'business automation',
        'customer service',
        'lead generation',
        'small business',
        'real estate',
        'ecommerce',
        'healthcare',
        'education'
      ],
      keywords: [
        'whatsapp automation for small business',
        'customer service automation strategies',
        'lead generation automation tools',
        'business process automation',
        'whatsapp marketing automation',
        'automated customer support',
        'business efficiency automation',
        'digital transformation strategies'
      ],
      planning: {
        autoPlan: true,
        planWeeks: 4,
        postsPerWeek: 3,
        autoGenerate: true,
        generateDays: 7
      },
      notifications: {
        email: '',
        enabled: false
      },
      api: {
        openai: {
          required: true,
          timeout: 30000
        },
        replicate: {
          required: false,
          timeout: 60000
        }
      },
      paths: {
        postsDir: 'posts',
        distDir: 'dist',
        imagesDir: 'public/images/blog',
        logsDir: 'logs',
        reportsDir: 'reports',
        templatesDir: 'templates'
      }
    };
  }

  validateAndMergeConfig(userConfig) {
    const defaultConfig = this.getDefaultConfig();
    
    // Deep merge user config with defaults
    const mergedConfig = this.deepMerge(defaultConfig, userConfig);
    
    // Validate required fields
    this.validateConfig(mergedConfig);
    
    return mergedConfig;
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  validateConfig(config) {
    const requiredSections = ['generation', 'features', 'keywordSources'];
    
    for (const section of requiredSections) {
      if (!config[section]) {
        throw new Error(`Missing required config section: ${section}`);
      }
    }

    // Validate generation settings
    if (config.generation.targetWords < 500 || config.generation.targetWords > 10000) {
      console.warn('Warning: targetWords should be between 500 and 10000');
    }

    if (config.generation.postsPerDay < 1 || config.generation.postsPerDay > 10) {
      console.warn('Warning: postsPerDay should be between 1 and 10');
    }

    // Validate keyword sources
    const validSources = ['built-in', 'csv', 'api'];
    for (const source of config.keywordSources) {
      if (!validSources.includes(source)) {
        throw new Error(`Invalid keyword source: ${source}. Valid sources: ${validSources.join(', ')}`);
      }
    }

    // Validate CSV path if CSV source is enabled
    if (config.keywordSources.includes('csv') && !config.csvKeywordPath) {
      throw new Error('csvKeywordPath is required when using CSV keyword source');
    }
  }

  saveConfig() {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log(`Configuration saved to: ${this.configPath}`);
      return true;
    } catch (error) {
      console.error('Error saving configuration:', error);
      return false;
    }
  }

  updateConfig(updates) {
    this.config = this.deepMerge(this.config, updates);
    this.validateConfig(this.config);
    return this.config;
  }

  getConfig() {
    return this.config;
  }

  getFeature(featureName) {
    return this.config.features[featureName];
  }

  setFeature(featureName, value) {
    if (this.config.features.hasOwnProperty(featureName)) {
      this.config.features[featureName] = value;
      return true;
    }
    return false;
  }

  getGenerationSetting(settingName) {
    return this.config.generation[settingName];
  }

  setGenerationSetting(settingName, value) {
    if (this.config.generation.hasOwnProperty(settingName)) {
      this.config.generation[settingName] = value;
      return true;
    }
    return false;
  }

  isWittyReplyMode() {
    return this.config.features.wittyReplyBranding;
  }

  isPlanningEnabled() {
    return this.config.features.planning;
  }

  isImageGenerationEnabled() {
    return this.config.features.imageGeneration;
  }

  isContentEnhancementEnabled() {
    return this.config.features.contentEnhancement;
  }

  getKeywordSources() {
    return this.config.keywordSources;
  }

  getCSVKeywordPath() {
    return this.config.csvKeywordPath;
  }

  getIndustries() {
    return this.config.industries;
  }

  getKeywords() {
    return this.config.keywords;
  }

  getPlanningConfig() {
    return this.config.planning;
  }

  getPaths() {
    return this.config.paths;
  }

  getAPIConfig() {
    return this.config.api;
  }

  // CLI interface
  runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    const value = args[2];

    switch (command) {
      case 'show':
        console.log('\n📋 Current Configuration:');
        console.log(JSON.stringify(this.config, null, 2));
        break;

      case 'set':
        if (!param || !value) {
          console.log('Usage: node config-manager.js set <key> <value>');
          console.log('Example: node config-manager.js set generation.postsPerDay 2');
          break;
        }
        
        const keys = param.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        const lastKey = keys[keys.length - 1];
        const parsedValue = this.parseValue(value);
        current[lastKey] = parsedValue;
        
        this.validateConfig(this.config);
        this.saveConfig();
        console.log(`✅ Set ${param} = ${parsedValue}`);
        break;

      case 'feature':
        if (!param) {
          console.log('Available features:');
          Object.keys(this.config.features).forEach(feature => {
            console.log(`  ${feature}: ${this.config.features[feature]}`);
          });
          break;
        }
        
        if (value !== undefined) {
          const boolValue = value.toLowerCase() === 'true';
          if (this.setFeature(param, boolValue)) {
            this.saveConfig();
            console.log(`✅ Set feature ${param} = ${boolValue}`);
          } else {
            console.log(`❌ Unknown feature: ${param}`);
          }
        } else {
          console.log(`${param}: ${this.getFeature(param)}`);
        }
        break;

      case 'save':
        if (this.saveConfig()) {
          console.log('✅ Configuration saved successfully');
        } else {
          console.log('❌ Failed to save configuration');
        }
        break;

      case 'validate':
        try {
          this.validateConfig(this.config);
          console.log('✅ Configuration is valid');
        } catch (error) {
          console.log(`❌ Configuration validation failed: ${error.message}`);
        }
        break;

      case 'reset':
        this.config = this.getDefaultConfig();
        this.saveConfig();
        console.log('✅ Configuration reset to defaults');
        break;

      default:
        console.log(`
🔧 Configuration Manager

Usage:
  node config-manager.js show                    - Show current configuration
  node config-manager.js set <key> <value>       - Set configuration value
  node config-manager.js feature [name] [value]   - Get/set feature flags
  node config-manager.js save                     - Save configuration
  node config-manager.js validate                 - Validate configuration
  node config-manager.js reset                    - Reset to defaults

Examples:
  node config-manager.js set generation.postsPerDay 2
  node config-manager.js feature wittyReplyBranding true
  node config-manager.js set generation.targetWords 3000
  node config-manager.js show

Configuration Structure:
  generation.*     - Blog generation settings
  features.*       - Feature flags
  keywordSources   - Available keyword sources
  industries       - Target industries
  keywords         - Base keywords
  planning.*       - Content planning settings
  paths.*          - Directory paths
  api.*            - API configuration
        `);
    }
  }

  parseValue(value) {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // If not JSON, return as string or boolean
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      if (!isNaN(value)) return Number(value);
      return value;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const configManager = new ConfigManager();
  configManager.runCLI();
}

export default ConfigManager;
