# 🚀 WittyReply Automated Blog Post Generator

An intelligent, consolidated system for generating daily blog posts with advanced keyword planning, AI-powered content generation, and comprehensive automation features.

## ✨ Features

- **🤖 AI-Powered Content Generation**: Create 4000+ word blog posts with OpenAI integration
- **🎯 Smart Keyword Planning**: Generate SEO-optimized keywords and track usage
- **📋 Content Planning System**: Schedule and manage upcoming content
- **🎨 Automatic Image Generation**: AI-generated images for blog posts
- **🔗 Smart Internal Linking**: Automatic internal link generation
- **📊 SEO Optimization**: Built-in meta tags, structured data, and sitemap updates
- **⚡ Quick & Full Modes**: Choose between fast updates or comprehensive analysis
- **🎯 WittyReply Branding**: Optional WittyReply product integration
- **📈 Analytics & Reporting**: Track performance and generate detailed reports
- **🔧 Feature Flags**: Flexible configuration through feature toggles

## 🏗️ Consolidated System Architecture

```
scripts/
├── config-manager.js          # Unified configuration management
├── blog-generator.js          # Unified blog post generation (all modes)
├── daily-automation.js        # Main orchestrator with planning
├── keyword-planner.js         # Keyword management and tracking
├── internal-linker.js         # SEO internal linking
├── sync-sitemap.js           # Sitemap management
├── image-generator.js         # Unified image generation
├── auto-blog-organizer.js     # Blog organization (quick/full modes)
├── blog-manager.js           # Article lifecycle management
├── ai-title-generator.js     # AI title generation
├── blog-planner.js           # Content planning
├── wittyreply-article-planner.js # WittyReply-specific planning
├── blog-dashboard.js         # Blog management dashboard
├── deploy-posts.js           # Post deployment
├── update-blog-page.js       # Blog page updates
├── extract-blog-metadata.js  # Metadata extraction
├── test-*.js                 # Testing utilities
└── MIGRATION_GUIDE.md        # Migration documentation

templates/
├── blog-template.html         # Main HTML template for blog posts
└── meta-template.html         # SEO meta tags template

data/                          # Generated data and keywords
├── used-keywords.json         # Keyword tracking
├── used-titles.json          # Title tracking
├── articles.json             # Article management
├── custom-articles.json     # Custom articles
└── generated-images-*.json   # Image metadata

logs/                          # Automation logs
reports/                       # Daily reports
config/                        # Configuration files
└── automation.json           # Consolidated configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Make sure you're in the landing-page directory
cd /path/to/your/landing-page

# Install Node.js dependencies (if not already installed)
npm install
```

### 2. Configure the System

```bash
# Show current configuration
node config-manager.js show

# Set posts per day
node config-manager.js set generation.postsPerDay 2

# Enable WittyReply branding
node config-manager.js feature wittyReplyBranding true

# Enable planning system
node config-manager.js feature planning true
```

### 3. Generate Your First Blog Post

```bash
# Generate 1 blog post with AI
node blog-generator.js generate "whatsapp automation"

# Generate multiple posts
node blog-generator.js generate-multiple 3

# Generate with WittyReply branding
node blog-generator.js generate-wittyreply "best chatbot"

# Generate from CSV keywords
node blog-generator.js generate-csv high 3
```

### 4. Test Image Generation

```bash
# Test image generation
node image-generator.js test

# Generate batch images
node image-generator.js batch

# Update blog post images
node image-generator.js update posts/blog-post.html
```

### 5. Organize Your Blog

```bash
# Quick blog organization update
node auto-blog-organizer.js quick

# Full blog organization with analysis
node auto-blog-organizer.js full
```

## 📋 Content Planning System

### Enable Planning

```bash
# Enable planning system
node daily-automation.js planning enable

# Auto-plan content for upcoming weeks
node daily-automation.js plan

# Generate planned content
node daily-automation.js generate
```

### Manage Articles

```bash
# Add new article
node blog-manager.js add "WhatsApp AI Guide" "whatsapp ai"

# Add custom article
node blog-manager.js add-custom "Custom Guide" "automation"

# List articles by status
node blog-manager.js list planned

# Show upcoming articles
node blog-manager.js upcoming 14

# Generate custom article
node blog-manager.js generate article-id
```

## 🔧 Configuration Options

### Feature Flags

Control functionality through feature flags:

```bash
# Content generation features
node config-manager.js feature contentEnhancement true
node config-manager.js feature imageGeneration true
node config-manager.js feature internalLinking true

# Planning features
node config-manager.js feature planning true

# Branding features
node config-manager.js feature wittyReplyBranding false

# Quality features
node config-manager.js feature qualityCheck true
node config-manager.js feature backupEnabled true
```

### Generation Settings

```bash
# Word count per post
node config-manager.js set generation.targetWords 4000

# Posts per day
node config-manager.js set generation.postsPerDay 2

# Content variation level
node config-manager.js set generation.contentVariation high

# Auto-deployment
node config-manager.js set generation.autoDeploy true
```

### Planning Settings

```bash
# Planning configuration
node config-manager.js set planning.autoPlan true
node config-manager.js set planning.planWeeks 4
node config-manager.js set planning.postsPerWeek 3
node config-manager.js set planning.generateDays 7
```

## 🎯 Usage Examples

### Daily Automation

```bash
# Generate daily posts with planning
node daily-automation.js generate 2

# Generate report
node daily-automation.js report

# Clean up old posts
node daily-automation.js cleanup

# Update blog organization
node daily-automation.js organize
```

### Keyword Management

```bash
# Generate new keywords
node keyword-planner.js generate 10

# Show keyword statistics
node keyword-planner.js stats

# Mark keyword as used
node keyword-planner.js mark "whatsapp automation"
```

### Blog Organization

```bash
# Quick update (faster)
node auto-blog-organizer.js quick

# Full organization (comprehensive)
node auto-blog-organizer.js full
```

### Image Generation

```bash
# Test image generation
node image-generator.js test

# Generate batch images
node image-generator.js batch

# Update specific blog post
node image-generator.js update posts/my-blog-post.html
```

## 📊 Monitoring & Reports

### View Logs

```bash
# Check automation logs
tail -f logs/automation.log

# Check cron logs
tail -f logs/cron.log
```

### Generate Reports

```bash
# Daily automation report
node daily-automation.js report

# Blog organization report
node auto-blog-organizer.js report
```

## 🔄 Automation Setup

### Cron Job Setup

```bash
# Set up daily automation
node setup-cron.js

# Manual cron setup
# Add to crontab: 0 9 * * * cd /path/to/landing-page && node scripts/daily-automation.js generate
```

### Smart Cron (Recommended)

```bash
# Use smart cron for intelligent scheduling
chmod +x smart-blog-cron.sh
# Add to crontab: 0 9 * * * /path/to/landing-page/smart-blog-cron.sh
```

## 🎨 Customization

### Templates

Modify templates in the `templates/` directory:
- `blog-template.html`: Main blog post template
- `meta-template.html`: SEO meta tags template

### Content Blocks

Customize content blocks in `blog-generator.js`:
- Introductions
- Benefits
- Statistics
- Examples
- Tips
- Conclusions

### WittyReply Integration

Enable WittyReply branding for product-focused content:

```bash
node config-manager.js feature wittyReplyBranding true
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Issues**
   ```bash
   # Check environment variables
   echo $OPENAI_API_KEY
   echo $REPLICATE_API_TOKEN
   ```

2. **Configuration Issues**
   ```bash
   # Validate configuration
   node config-manager.js validate
   
   # Reset to defaults
   node config-manager.js reset
   ```

3. **Import Errors**
   ```bash
   # Reinstall dependencies
   npm install
   ```

### Getting Help

- Check script help: `node <script-name>.js` (no arguments)
- Review logs in `logs/` directory
- Check migration guide: `scripts/MIGRATION_GUIDE.md`

## 📈 Performance Optimization

### Quick Mode vs Full Mode

- **Quick Mode**: Fast updates, basic metadata extraction
- **Full Mode**: Comprehensive analysis, detailed categorization

### Batch Processing

Use batch commands for multiple operations:
```bash
node blog-generator.js generate-multiple 5
node image-generator.js batch
```

## 🔒 Security

- API keys stored in environment variables
- No sensitive data in configuration files
- Secure file handling and validation

## 📝 Migration from Old System

If upgrading from the previous system, see `MIGRATION_GUIDE.md` for detailed migration instructions.

## 🤝 Contributing

1. Follow the consolidated architecture
2. Use feature flags for new functionality
3. Maintain backward compatibility
4. Update documentation

## 📄 License

This project is part of the WittyReply landing page system.

---

**Need Help?** Check the migration guide or run any script without arguments for help.
