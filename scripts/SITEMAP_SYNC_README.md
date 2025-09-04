# Sitemap Synchronization Tool

This tool automatically synchronizes all blog posts from the `posts/` directory to your sitemap.xml files, ensuring that search engines can discover all your content.

## Features

- ✅ **Automatic Discovery**: Scans the `posts/` directory for all HTML files
- ✅ **Smart Date Detection**: Extracts dates from filenames or uses file modification dates
- ✅ **Dual Sync**: Updates both root `sitemap.xml` and `public/sitemap.xml`
- ✅ **SEO Optimized**: Proper priority and changefreq settings for different content types
- ✅ **Safe Operation**: Dry-run mode to preview changes before applying
- ✅ **Clean Output**: Colored, informative console output

## Quick Start

### Using npm scripts (Recommended)
```bash
# Preview what would be updated
npm run sitemap:preview

# Sync the sitemap
npm run sitemap:sync
```

### Using the Node.js script directly
```bash
# Preview changes
node scripts/sync-sitemap.js --dry-run

# Sync the sitemap
node scripts/sync-sitemap.js

# Show help
node scripts/sync-sitemap.js --help
```

### Using the shell wrapper
```bash
# Preview changes
./sync-sitemap.sh --dry-run

# Sync the sitemap
./sync-sitemap.sh

# Show help
./sync-sitemap.sh --help
```

## Configuration

The script is configured in `scripts/sync-sitemap.js`:

```javascript
const CONFIG = {
  baseUrl: 'https://wittyrep.com',           // Your website's base URL
  postsDir: path.join(__dirname, '../posts'), // Blog posts directory
  sitemapPath: path.join(__dirname, '../sitemap.xml'), // Root sitemap
  publicSitemapPath: path.join(__dirname, '../public/sitemap.xml'), // Public sitemap
  blogPostPriority: '0.6',                   // SEO priority for blog posts
  blogPostChangefreq: 'monthly'              // How often blog posts change
};
```

## Sitemap Structure

The generated sitemap includes:

### Static Pages (High Priority)
- Homepage (priority: 1.0, weekly updates)
- Language versions (priority: 0.8, monthly updates)
- Blog listing page (priority: 0.8, weekly updates)
- Legal pages (priority: 0.3, yearly updates)

### Blog Posts (Medium Priority)
- All HTML files from `posts/` directory
- Priority: 0.6
- Change frequency: monthly
- Sorted by date (newest first)

## Date Detection

The script intelligently determines the last modification date:

1. **Filename dates**: Extracts dates in `YYYY-MM-DD` format from filenames
   - Example: `blog-post-2025-09-04.html` → `2025-09-04`
2. **File modification dates**: Falls back to actual file modification time
3. **Current date**: Used for static pages

## Output Files

The script updates two sitemap files:
- `/sitemap.xml` (root level)
- `/public/sitemap.xml` (for static serving)

Both files contain identical content to ensure consistency across different serving configurations.

## Integration with Build Process

You can integrate this script into your build/deployment process:

### Manual Integration
```bash
# Add to your deployment script
npm run sitemap:sync
git add sitemap.xml public/sitemap.xml
git commit -m "Update sitemap with latest blog posts"
```

### Automated Integration
Add to your existing automation scripts or CI/CD pipeline:

```javascript
// In your automation script
import { syncSitemap } from './scripts/sync-sitemap.js';

// Sync sitemap after generating new blog posts
await syncSitemap();
```

## Troubleshooting

### Common Issues

**"require is not defined"**
- The script uses ES modules. Make sure your `package.json` has `"type": "module"`

**"Posts directory not found"**
- Ensure the `posts/` directory exists and contains HTML files
- Check the `postsDir` configuration in the script

**"Permission denied"**
- Make sure the script has execute permissions: `chmod +x scripts/sync-sitemap.js`

### Verification

After running the sync, verify the results:

```bash
# Check the number of URLs in the sitemap
grep -c "<url>" sitemap.xml

# View the latest blog posts in the sitemap
grep -A 4 "posts/" sitemap.xml | tail -20
```

## Examples

### Dry Run Output
```bash
$ npm run sitemap:preview

🧪 DRY RUN MODE - No files will be modified
📝 Would add 17 blog posts to sitemap:
   - https://wittyrep.com/posts/blog-latest-post.html (2025-09-04)
   - https://wittyrep.com/posts/blog-older-post.html (2025-08-28)
📊 Total URLs would be: 23
```

### Successful Sync
```bash
$ npm run sitemap:sync

🔄 Starting sitemap synchronization...
📁 Scanning posts directory: /path/to/posts
📝 Found 17 blog posts
✓ Updated sitemap: /path/to/sitemap.xml
✓ Updated sitemap: /path/to/public/sitemap.xml
✅ Sitemap synchronization completed successfully!
🌐 Base URL: https://wittyrep.com
📊 Total URLs in sitemap: 23 (6 static pages + 17 blog posts)
```

## Best Practices

1. **Run after content changes**: Sync the sitemap whenever you add, remove, or modify blog posts
2. **Use dry-run first**: Always preview changes with `--dry-run` before applying
3. **Commit changes**: Include sitemap updates in your version control
4. **Automate**: Integrate into your content generation workflow
5. **Verify**: Check that search engines can access your updated sitemap

## Contributing

To modify the script:

1. Edit `scripts/sync-sitemap.js`
2. Test with `--dry-run` first
3. Update this README if you change functionality
4. Test both npm scripts and direct execution
