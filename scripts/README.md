# 🚀 WittyReply Automated Blog Post Generator

An intelligent system for generating daily blog posts with keyword planning to boost SEO for your WhatsApp automation business.

## ✨ Features

- **🤖 Automated Content Generation**: Create blog posts daily without manual intervention
- **🎯 Smart Keyword Planning**: Generate SEO-optimized keywords and topics
- **📝 Content Templates**: Professional blog post templates with consistent styling
- **🔄 Content Variations**: Generate multiple angles for the same topic
- **📊 SEO Optimization**: Built-in meta tags, structured data, and sitemap updates
- **⏰ Scheduled Automation**: Set up cron jobs for daily execution
- **📈 Analytics & Reporting**: Track performance and generate daily reports

## 🏗️ System Architecture

```
scripts/
├── keyword-planner.js      # Keyword research and topic generation
├── blog-generator.js       # Blog post creation and HTML generation
├── daily-automation.js     # Main automation orchestrator
├── setup-cron.js          # Cron job setup and management
└── README.md              # This file

templates/
├── blog-template.html      # Main HTML template for blog posts
└── meta-template.html      # SEO meta tags template

data/                       # Generated data and keywords
logs/                       # Automation logs
reports/                    # Daily reports
config/                     # Configuration files
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Make sure you're in the landing-page directory
cd /path/to/your/landing-page

# Install Node.js dependencies (if not already installed)
npm install
```

### 2. Generate Your First Blog Post

```bash
# Generate 1 blog post
node scripts/daily-automation.js generate 1

# Generate multiple posts
node scripts/daily-automation.js generate 3
```

### 3. Set Up Daily Automation

```bash
# Set up automatic daily generation at 9:00 AM
node scripts/setup-cron.js setup

# Check automation status
node scripts/setup-cron.js status
```

## 📖 Detailed Usage

### Keyword Planning

Generate new topic ideas with SEO-optimized keywords:

```bash
# Generate 10 topic ideas
node scripts/keyword-planner.js 10

# Generate 5 topic ideas
node scripts/keyword-planner.js 5
```

**Output Example:**
```
🎯 Generated Topic Ideas:

1. How WhatsApp Automation Can Transform Your Business
   Keyword: whatsapp automation business efficiency
   Description: Discover how WhatsApp automation can transform your business operations and streamline your results.
   Difficulty: intermediate | Est. Words: 1500
   Outline: Introduction and Problem Statement → Why This Matters for Your Business → Key Benefits and ROI → Step-by-Step Implementation → Real Examples and Case Studies → Common Mistakes to Avoid → Tools and Resources Needed → Conclusion and Next Steps

2. 12 WhatsApp Lead Generation Strategies That Actually Work
   Keyword: whatsapp lead generation customer acquisition
   Description: Learn proven WhatsApp lead generation techniques that can help you acquire 45+ new customers monthly.
   Difficulty: beginner | Est. Words: 2000
   Outline: Introduction and Problem Statement → Why This Matters for Your Business → Lead Generation Statistics and Trends → Key Benefits and ROI → Lead Nurturing Strategies → Step-by-Step Implementation → Real Examples and Case Studies → Common Mistakes to Avoid → Tools and Resources Needed → Conclusion and Next Steps
```

### Blog Post Generation

Generate complete HTML blog posts:

```bash
# Generate 1 post today
node scripts/daily-automation.js generate 1

# Generate 3 posts today
node scripts/daily-automation.js generate 3
```

### Configuration Management

View and modify automation settings:

```bash
# Show current configuration
node scripts/daily-automation.js config show

# Set posts per day
node scripts/daily-automation.js config set postsPerDay 2

# Set content variation level
node scripts/daily-automation.js config set contentVariation high
```

**Available Configuration Options:**
- `postsPerDay`: Number of posts to generate daily (default: 1)
- `maxPostsInQueue`: Maximum posts to keep in queue (default: 30)
- `autoPublish`: Auto-publish posts (default: false)
- `notificationEmail`: Email for notifications (default: '')
- `keywordsPerPost`: Keywords per post (default: 3)
- `contentVariation`: Content variation level - 'low', 'medium', 'high' (default: 'high')
- `seoOptimization`: Enable SEO optimization (default: true)
- `socialSharing`: Enable social sharing (default: false)

### Automation Management

Set up and manage daily automation:

```bash
# Set up daily cron job (9:00 AM)
node scripts/setup-cron.js setup

# Check automation status
node scripts/setup-cron.js status

# Remove automation
node scripts/setup-cron.js remove
```

### Reports and Monitoring

Generate reports and monitor performance:

```bash
# Generate daily report
node scripts/daily-automation.js report

# Clean up old posts
node scripts/daily-automation.js cleanup
```

## 🎨 Content Generation

### Topic Categories

The system generates content around these key areas:

1. **WhatsApp Automation**
   - Business automation strategies
   - Customer service optimization
   - Lead generation techniques
   - Workflow automation

2. **Business Growth**
   - Digital marketing
   - Customer acquisition
   - Business efficiency
   - Sales automation

3. **Industry-Specific**
   - Real estate automation
   - E-commerce optimization
   - Service business automation
   - Healthcare automation

### Content Structure

Each blog post includes:

- **SEO-Optimized Title**: Based on target keywords
- **Meta Description**: Compelling summary for search results
- **Introduction**: Problem statement and hook
- **Quick Stats**: Relevant statistics and data
- **Main Content**: Structured sections based on outline
- **Examples**: Real-world use cases
- **Implementation Steps**: Actionable guidance
- **Conclusion**: Summary and call-to-action
- **SEO Meta Tags**: Complete optimization

### Content Variations

When `contentVariation` is set to 'high', the system generates:

- **Main Post**: Comprehensive guide
- **How-To Variation**: Step-by-step tutorial
- **Tips Variation**: Pro tips and best practices
- **Case Study Variation**: Real examples and success stories

## 🔧 Customization

### Adding New Keywords

Edit `scripts/keyword-planner.js` to add new keyword categories:

```javascript
const KEYWORD_CATEGORIES = {
  // Add your new category
  your_industry: [
    'your industry whatsapp automation',
    'your industry lead generation',
    // ... more keywords
  ]
};
```

### Customizing Content Blocks

Modify `scripts/blog-generator.js` to add new content variations:

```javascript
loadContentBlocks() {
  return {
    // Add new content blocks
    your_topic: [
      "Your content variation 1",
      "Your content variation 2",
      // ... more variations
    ]
  };
}
```

### Template Customization

Edit the HTML templates in `templates/` directory:

- `blog-template.html`: Main blog post structure
- `meta-template.html`: SEO meta tags and structured data

## 📊 Monitoring and Analytics

### Log Files

- **Automation Logs**: `logs/automation.log`
- **Cron Logs**: `logs/cron.log`

### Daily Reports

Generated in `reports/` directory with:
- Posts generated today
- Total posts count
- Keywords used
- Configuration settings
- Generated post details

### Performance Tracking

Monitor your blog's SEO performance:
- Keyword rankings
- Organic traffic
- Engagement metrics
- Conversion rates

## 🚨 Troubleshooting

### Common Issues

1. **Script Permission Denied**
   ```bash
   chmod +x scripts/*.js
   ```

2. **Cron Job Not Running**
   ```bash
   # Check cron service
   sudo service cron status
   
   # Check cron logs
   tail -f /var/log/cron
   ```

3. **Template Files Missing**
   ```bash
   # Ensure templates directory exists
   mkdir -p templates
   ```

4. **Posts Not Generating**
   ```bash
   # Check logs
   tail -f logs/automation.log
   
   # Test manually
   node scripts/daily-automation.js generate 1
   ```

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable for debug
DEBUG=true node scripts/daily-automation.js generate 1
```

## 🔒 Security Considerations

- **File Permissions**: Ensure scripts are not world-writable
- **Cron Security**: Use specific user accounts for cron jobs
- **Log Rotation**: Implement log rotation to prevent disk space issues
- **Backup**: Regularly backup generated content and configuration

## 📈 Best Practices

1. **Keyword Research**: Regularly update keyword categories based on trends
2. **Content Quality**: Review generated posts before publishing
3. **SEO Monitoring**: Track keyword performance and adjust strategies
4. **Regular Updates**: Keep the system updated with new content variations
5. **Performance**: Monitor system performance and optimize as needed

## 🤝 Support

For issues or questions:

1. Check the logs in `logs/` directory
2. Review this README for common solutions
3. Test individual components manually
4. Check system requirements and dependencies

## 📝 License

This system is part of the WittyReply landing page project.

---

**Happy Blogging! 🚀📝**
