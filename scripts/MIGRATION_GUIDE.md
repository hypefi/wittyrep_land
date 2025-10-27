# Script Consolidation Migration Guide

## Overview

This guide documents the consolidation of 31 scripts down to 16 core scripts, reducing redundancy by 48% while maintaining all functionality through unified interfaces and feature flags.

## What Changed

### Deleted Scripts (11 total)

The following scripts have been **deleted** and their functionality merged into consolidated scripts:

1. `enhanced-blog-automation.js` → Merged into `blog-generator.js`
2. `smart-blog-automation.js` → Merged into `daily-automation.js`
3. `whatsapp-ai-blog-generator.js` → Merged into `blog-generator.js`
4. `generate-wittyreply-articles.js` → Merged into `blog-generator.js`
5. `blog-content-enhancer.js` → Merged into `blog-generator.js`
6. `wittyreply-content-enhancer.js` → Merged into `blog-generator.js`
7. `update-blog-organization.js` → Merged into `auto-blog-organizer.js`
8. `generate-blog-images.js` → Merged into `image-generator.js`
9. `update-blog-images.js` → Merged into `image-generator.js`
10. `article-manager.js` → Merged into `blog-manager.js`
11. `custom-blog-manager.js` → Merged into `blog-manager.js`

### New Consolidated Scripts

#### 1. `config-manager.js` (NEW)
**Purpose**: Unified configuration management
**Features**:
- Centralized configuration loading and validation
- Feature flag management
- CLI interface for configuration updates
- Schema validation and defaults

**Usage**:
```bash
node config-manager.js show                    # Show current config
node config-manager.js set generation.postsPerDay 2
node config-manager.js feature wittyReplyBranding true
```

#### 2. `blog-generator.js` (ENHANCED)
**Purpose**: Unified blog post generation with all modes
**Features**:
- AI-powered content generation (4000+ words)
- WittyReply branding integration
- CSV keyword loading
- Multiple generation modes
- Image generation integration
- Internal linking

**Usage**:
```bash
node blog-generator.js generate "whatsapp automation"
node blog-generator.js generate-multiple 5
node blog-generator.js generate-csv high 3
node blog-generator.js generate-wittyreply "best chatbot"
```

#### 3. `image-generator.js` (ENHANCED)
**Purpose**: Unified image generation with batch processing
**Features**:
- Single image generation
- Batch image generation
- Blog post image updating
- Multiple AI models support

**Usage**:
```bash
node image-generator.js batch                    # Generate batch images
node image-generator.js test                     # Test generation
node image-generator.js update posts/blog.html  # Update blog images
```

#### 4. `auto-blog-organizer.js` (ENHANCED)
**Purpose**: Blog organization with quick and full modes
**Features**:
- Full organization with comprehensive analysis
- Quick update mode for fast processing
- Smart categorization
- Metadata extraction

**Usage**:
```bash
node auto-blog-organizer.js quick    # Quick update
node auto-blog-organizer.js full     # Full organization
```

#### 5. `blog-manager.js` (NEW)
**Purpose**: Consolidated article and custom article management
**Features**:
- Article lifecycle management
- Custom article generation
- Status tracking and scheduling
- Progress monitoring

**Usage**:
```bash
node blog-manager.js add "Title" "keyword"
node blog-manager.js add-custom "Custom Title" "keyword"
node blog-manager.js list planned
node blog-manager.js generate article-id
```

#### 6. `daily-automation.js` (ENHANCED)
**Purpose**: Main orchestrator with planning integration
**Features**:
- Planning system integration
- Auto-planning for upcoming content
- Smart scheduling
- Feature flag support

**Usage**:
```bash
node daily-automation.js generate 2
node daily-automation.js plan
node daily-automation.js planning enable
```

## Migration Commands

### Old → New Command Mapping

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| `node enhanced-blog-automation.js generate 1` | `node blog-generator.js generate "keyword"` | Use specific keyword |
| `node smart-blog-automation.js generate` | `node daily-automation.js generate` | Planning integrated |
| `node whatsapp-ai-blog-generator.js generate` | `node blog-generator.js generate-csv high 3` | CSV mode |
| `node generate-wittyreply-articles.js all` | `node blog-generator.js generate-wittyreply "keyword"` | WittyReply mode |
| `node update-blog-organization.js` | `node auto-blog-organizer.js quick` | Quick mode |
| `node generate-blog-images.js` | `node image-generator.js batch` | Batch generation |
| `node update-blog-images.js` | `node image-generator.js update` | Update mode |
| `node article-manager.js add` | `node blog-manager.js add` | Same interface |
| `node custom-blog-manager.js generate` | `node blog-manager.js generate` | Same interface |

## Configuration Changes

### New Configuration Structure

The `config/automation.json` file has been updated with a new structure:

```json
{
  "generation": {
    "targetWords": 4000,
    "postsPerDay": 2,
    "maxPostsInQueue": 30,
    "contentVariation": "high",
    "keywordsPerPost": 3,
    "autoPublish": false,
    "autoDeploy": true
  },
  "features": {
    "wittyReplyBranding": false,
    "contentEnhancement": true,
    "imageGeneration": true,
    "internalLinking": true,
    "planning": true,
    "seoOptimization": true,
    "socialSharing": false,
    "qualityCheck": true,
    "backupEnabled": true
  },
  "keywordSources": ["built-in", "csv"],
  "csvKeywordPath": "wittyreply_seo/whatsapp_ai_ENHANCED.csv",
  "planning": {
    "autoPlan": true,
    "planWeeks": 4,
    "postsPerWeek": 3,
    "autoGenerate": true,
    "generateDays": 7
  }
}
```

### Feature Flags

You can now control functionality through feature flags:

```bash
# Enable WittyReply branding
node config-manager.js feature wittyReplyBranding true

# Enable planning system
node config-manager.js feature planning true

# Disable image generation
node config-manager.js feature imageGeneration false
```

## Benefits of Consolidation

### 1. **Reduced Complexity**
- 31 scripts → 16 scripts (48% reduction)
- Single entry points for related functionality
- Unified configuration management

### 2. **Improved Maintainability**
- Centralized configuration
- Consistent interfaces
- Reduced code duplication

### 3. **Enhanced Features**
- Feature flags for flexible control
- Planning system integration
- Better error handling and logging

### 4. **Better Performance**
- Reduced script loading overhead
- Optimized resource usage
- Faster execution

## Testing the New System

### 1. Test Configuration Management
```bash
node config-manager.js show
node config-manager.js validate
```

### 2. Test Blog Generation
```bash
node blog-generator.js generate "whatsapp automation"
node blog-generator.js test-images
```

### 3. Test Planning System
```bash
node daily-automation.js planning enable
node daily-automation.js plan
node daily-automation.js generate
```

### 4. Test Image Generation
```bash
node image-generator.js test
node image-generator.js batch
```

### 5. Test Blog Organization
```bash
node auto-blog-organizer.js quick
node auto-blog-organizer.js full
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
   ```bash
   npm install
   ```

2. **Configuration Issues**: Reset to defaults if needed
   ```bash
   node config-manager.js reset
   ```

3. **Missing Features**: Check feature flags
   ```bash
   node config-manager.js show
   ```

### Getting Help

- Check script help: `node <script-name>.js` (no arguments)
- Review logs in `logs/` directory
- Validate configuration: `node config-manager.js validate`

## Next Steps

1. **Update Cron Jobs**: Update any cron jobs to use new command syntax
2. **Test Workflows**: Run through your typical workflows to ensure everything works
3. **Update Documentation**: Update any internal documentation with new commands
4. **Monitor Performance**: Watch for any performance improvements or issues

## Support

If you encounter any issues during migration:

1. Check this migration guide
2. Review the script help text (`node <script>.js`)
3. Check the logs in `logs/` directory
4. Validate your configuration with `node config-manager.js validate`

The consolidated system maintains all previous functionality while providing a cleaner, more maintainable codebase.
