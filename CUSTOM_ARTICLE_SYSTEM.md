# 🎯 Custom Article Management System

A complete system for managing blog articles with full control over titles, keywords, and ensuring every article is approximately 4000 words with images.

## 🚀 Quick Start

### 1. Start the Article Manager
```bash
node scripts/article-manager.js
```

### 2. Add Your First Article
- Choose option 1: "Add New Article"
- Enter your custom title
- Enter your primary keyword
- Choose category and priority
- Set scheduled date

### 3. Generate the Article
- Choose option 3: "Generate Article"
- Select the article to generate
- Wait for approximately 4000-word article with images to be created

## 📋 System Features

### ✅ Full Control
- **Custom Titles**: Enter any title you want
- **Custom Keywords**: Specify exact keywords for SEO
- **Custom Descriptions**: Write your own descriptions
- **Custom Instructions**: Add specific instructions for AI generation

### ✅ Guaranteed Quality
- **~4000 Words**: Every article is approximately 4000 words (±200 words)
- **4 Images**: Hero + 2 section images + 1 infographic
- **SEO Optimized**: Complete meta tags and structured data
- **Internal Linking**: 8+ internal links automatically added

### ✅ Easy Management
- **Interactive Interface**: Simple menu-driven system
- **Bulk Operations**: Add multiple articles at once
- **Export Options**: JSON and CSV export
- **Status Tracking**: Track completion and progress

## 🎯 Article Categories

1. **WhatsApp Automation** (High Priority)
   - Core automation concepts
   - Implementation guides
   - Best practices

2. **Business Growth** (High Priority)
   - Lead generation strategies
   - Customer acquisition
   - Sales automation

3. **Industry-Specific** (Medium Priority)
   - Restaurant automation
   - Real estate automation
   - E-commerce automation
   - Healthcare automation
   - Education automation

4. **Seasonal Topics** (Medium Priority)
   - Holiday marketing
   - Back-to-school campaigns
   - New year planning

5. **Case Studies** (Medium Priority)
   - Success stories
   - Real-world examples
   - ROI demonstrations

6. **Tutorials** (High Priority)
   - Step-by-step guides
   - Technical implementation
   - Troubleshooting

7. **Comparisons** (Low Priority)
   - Tool comparisons
   - Feature analysis
   - Pricing reviews

## 📊 Priority Levels

- **🔴 High Priority**: Strategic content, tutorials, core topics
- **🟡 Medium Priority**: Industry-specific, case studies, seasonal
- **🟢 Low Priority**: Comparisons, supplementary content

## 🛠️ Usage Examples

### Example 1: Restaurant Automation Article
```
Title: "Complete Guide to WhatsApp Automation for Restaurants"
Keyword: "whatsapp automation for restaurants"
Description: "Transform your restaurant operations with WhatsApp automation. Complete guide to implementing smart chatbots for orders, reservations, and delivery management."
Category: industry_specific
Priority: high
```

### Example 2: Lead Generation Tutorial
```
Title: "10 Proven WhatsApp Lead Generation Strategies That Actually Work"
Keyword: "whatsapp lead generation strategies"
Description: "Learn proven WhatsApp lead generation techniques that can help you acquire 50+ new customers monthly."
Category: tutorials
Priority: high
```

### Example 3: Business Growth Guide
```
Title: "How WhatsApp Automation Can Transform Your Business in 2024"
Keyword: "whatsapp automation business transformation"
Description: "Discover how WhatsApp automation can revolutionize your business operations and drive sustainable growth."
Category: whatsapp_automation
Priority: high
```

## 📝 Article Structure

Every article follows this structure:

1. **Introduction** - Problem statement and hook
2. **Quick Stats** - Relevant statistics and data
3. **Main Content** - 6-8 detailed sections
4. **Examples** - Real-world use cases
5. **Implementation** - Step-by-step guides
6. **Conclusion** - Summary and call-to-action

## 🎨 Image Generation

Each article includes 4 images:

1. **Hero Image** (16:9) - Main visual for the article
2. **Section Image 1** (16:9) - Supporting content visual
3. **Section Image 2** (16:9) - Additional content visual
4. **Infographic** (1:1) - Statistics and benefits summary

## 🔗 Internal Linking

Every article includes 8+ internal links to:
- Related blog posts
- Product pages
- Service pages
- Other relevant content

## 📊 Quality Assurance

### Word Count Verification
- Target: Approximately 4000 words (±200 words)
- Range: 3800-4200 words
- Verification: Automatic word count checking
- Flexibility: Natural content length within acceptable range

### Image Quality
- High-resolution images
- Relevant to content
- Professional appearance
- Optimized for web

### SEO Optimization
- Title optimization
- Meta description (150-160 chars)
- H1, H2, H3 structure
- Schema markup
- Internal linking

## 🚀 Advanced Features

### Bulk Article Addition
```bash
# Add multiple articles at once
node scripts/article-manager.js
# Choose option 7: "Bulk Add Articles"
```

### Custom Instructions
Add specific instructions for AI generation:
- "Focus on practical implementation steps"
- "Include real-world examples from restaurant industry"
- "Emphasize ROI and business benefits"

### Export Options
```bash
# Export to JSON
node scripts/custom-blog-manager.js export json

# Export to CSV
node scripts/custom-blog-manager.js export csv
```

## 📈 Performance Tracking

### Status Tracking
- **📋 Planned**: Article added, ready to generate
- **✅ Completed**: Article generated successfully
- **❌ Failed**: Generation failed (check logs)

### Metrics
- Total articles created
- Completion rate
- Average generation time
- Word count accuracy
- Image generation success

## 🔧 Troubleshooting

### Common Issues

1. **Article Not Generating**
   - Check API keys in `.env`
   - Verify article status
   - Check logs for errors

2. **Word Count Issues**
   - System automatically ensures ~4000 words (±200)
   - Natural content length within acceptable range
   - Manual review if needed

3. **Image Generation Failed**
   - Check Replicate API token
   - Verify image prompts
   - Check network connection

### Debug Commands
```bash
# Check article status
node scripts/article-manager.js
# Choose option 8: "Show Status"

# List all articles
node scripts/article-manager.js
# Choose option 2: "List All Articles"
```

## 📚 Best Practices

### Title Creation
- Use power words: "Complete", "Proven", "Ultimate"
- Include target keyword
- Keep under 60 characters
- Make it compelling and clickable

### Keyword Selection
- Use long-tail keywords
- Include primary keyword in title
- Consider search volume and competition
- Use related keywords naturally

### Content Planning
- Plan 4-8 weeks ahead
- Mix different categories
- Balance high/medium/low priority
- Include seasonal content

### Quality Control
- Review generated content
- Check word count is within range (3800-4200)
- Verify image relevance
- Test internal links

## 🎉 Success Tips

1. **Start Simple**: Begin with 3-5 articles
2. **Be Specific**: Use detailed custom instructions
3. **Monitor Quality**: Review generated content
4. **Stay Consistent**: Generate articles regularly
5. **Track Performance**: Monitor completion rates

## 📞 Support

### Getting Help
1. Check article status in the manager
2. Review logs for error messages
3. Verify API keys and configuration
4. Test with simple articles first

### Configuration Files
- `data/custom-articles.json` - Article database
- `config/automation.json` - System configuration
- `logs/` - Error and activity logs

---

**Happy Content Creation! 🚀📝**

*This system gives you complete control over your content while ensuring consistent quality and SEO optimization. Use it to create a steady stream of high-quality, approximately 4000-word articles with professional images.*
