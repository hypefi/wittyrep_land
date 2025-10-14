#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InternalLinker {
  constructor() {
    this.postsDir = path.join(__dirname, '../posts');
    this.distPostsDir = path.join(__dirname, '../dist/posts');
    this.linkDatabase = this.buildLinkDatabase();
  }

  buildLinkDatabase() {
    const database = {
      articles: [],
      categories: {
        'whatsapp automation': [],
        'ai automation': [],
        'customer service': [],
        'lead generation': [],
        'digital marketing': [],
        'business automation': [],
        'small business': [],
        'social media': [],
        'email marketing': [],
        'chatbot': [],
        'free tools': [],
        'ai agent': []
      },
      keywords: new Map()
    };

    try {
      // Scan posts directory for existing articles
      const posts = fs.readdirSync(this.postsDir).filter(file => file.endsWith('.html'));
      
      posts.forEach(postFile => {
        const postPath = path.join(this.postsDir, postFile);
        const content = fs.readFileSync(postPath, 'utf8');
        
        // Extract article metadata
        const article = this.extractArticleMetadata(content, postFile);
        if (article) {
          database.articles.push(article);
          
          // Categorize by keywords
          this.categorizeArticle(article, database);
        }
      });

      console.log(`📚 Built link database with ${database.articles.length} articles`);
      return database;
    } catch (error) {
      console.error('Error building link database:', error);
      return database;
    }
  }

  extractArticleMetadata(content, filename) {
    try {
      // Extract title
      const titleMatch = content.match(/<title>(.*?) - WittyReply Blog<\/title>/);
      const title = titleMatch ? titleMatch[1] : filename.replace('.html', '');

      // Extract description
      const descMatch = content.match(/<meta name="description" content="(.*?)">/);
      const description = descMatch ? descMatch[1] : '';

      // Extract keywords
      const keywordsMatch = content.match(/<meta name="keywords" content="(.*?)">/);
      const keywords = keywordsMatch ? keywordsMatch[1].split(', ') : [];

      // Extract slug from filename
      const slug = filename.replace('blog-', '').replace(/-\d{4}-\d{2}-\d{2}\.html$/, '');

      // Extract main heading
      const headingMatch = content.match(/<h1[^>]*class="[^"]*gradient-text[^"]*"[^>]*>(.*?)<\/h1>/);
      const mainHeading = headingMatch ? headingMatch[1].replace(/<[^>]*>/g, '') : title;

      return {
        title,
        description,
        keywords,
        slug,
        filename,
        mainHeading,
        url: `../posts/${filename}`,
        distUrl: `posts/${filename}`
      };
    } catch (error) {
      console.error(`Error extracting metadata from ${filename}:`, error);
      return null;
    }
  }

  categorizeArticle(article, database) {
    const titleLower = article.title.toLowerCase();
    const keywordsLower = article.keywords.map(k => k.toLowerCase());
    const allText = `${titleLower} ${keywordsLower.join(' ')}`;

    // Categorize by keywords
    Object.keys(database.categories).forEach(category => {
      if (allText.includes(category)) {
        database.categories[category].push(article);
      }
    });

    // Index by individual keywords
    article.keywords.forEach(keyword => {
      const key = keyword.toLowerCase();
      if (!database.keywords.has(key)) {
        database.keywords.set(key, []);
      }
      database.keywords.get(key).push(article);
    });
  }

  generateInternalLinks(currentArticle, targetCount = 8) {
    const links = [];
    const currentKeywords = currentArticle.keywords || [];
    const currentTitle = currentArticle.title || '';
    const currentText = `${currentTitle} ${currentKeywords.join(' ')}`.toLowerCase();

    // Get relevant articles based on keyword matching
    const relevantArticles = this.findRelevantArticles(currentText, currentKeywords);
    
    // Remove current article from suggestions
    const filteredArticles = relevantArticles.filter(article => 
      article.slug !== currentArticle.slug
    );

    // Select diverse links
    const selectedLinks = this.selectDiverseLinks(filteredArticles, targetCount);

    // Generate link objects with context
    selectedLinks.forEach(article => {
      const linkContext = this.generateLinkContext(article, currentText);
      links.push({
        ...article,
        context: linkContext,
        anchorText: this.generateAnchorText(article),
        relevance: this.calculateRelevance(article, currentText)
      });
    });

    return links.sort((a, b) => b.relevance - a.relevance);
  }

  findRelevantArticles(currentText, currentKeywords) {
    const relevant = new Set();

    // Find by keyword matching (more flexible)
    currentKeywords.forEach(keyword => {
      const key = keyword.toLowerCase();
      if (this.linkDatabase.keywords.has(key)) {
        this.linkDatabase.keywords.get(key).forEach(article => {
          relevant.add(article);
        });
      }
    });

    // Find by partial keyword matching
    currentKeywords.forEach(keyword => {
      const key = keyword.toLowerCase();
      this.linkDatabase.keywords.forEach((articles, dbKeyword) => {
        if (dbKeyword.includes(key) || key.includes(dbKeyword)) {
          articles.forEach(article => {
            relevant.add(article);
          });
        }
      });
    });

    // Find by category matching
    Object.keys(this.linkDatabase.categories).forEach(category => {
      if (currentText.includes(category)) {
        this.linkDatabase.categories[category].forEach(article => {
          relevant.add(article);
        });
      }
    });

    // Find by title similarity (lower threshold)
    this.linkDatabase.articles.forEach(article => {
      if (this.calculateSimilarity(currentText, article.title.toLowerCase()) > 0.2) {
        relevant.add(article);
      }
    });

    // Find by content similarity in keywords
    this.linkDatabase.articles.forEach(article => {
      article.keywords.forEach(articleKeyword => {
        currentKeywords.forEach(currentKeyword => {
          if (this.calculateSimilarity(currentKeyword.toLowerCase(), articleKeyword.toLowerCase()) > 0.3) {
            relevant.add(article);
          }
        });
      });
    });

    // If still no results, get some random relevant articles
    if (relevant.size === 0) {
      const whatsappArticles = this.linkDatabase.categories['whatsapp automation'] || [];
      const automationArticles = this.linkDatabase.categories['ai automation'] || [];
      const businessArticles = this.linkDatabase.categories['business automation'] || [];
      
      [...whatsappArticles, ...automationArticles, ...businessArticles]
        .slice(0, 5)
        .forEach(article => relevant.add(article));
    }

    return Array.from(relevant);
  }

  selectDiverseLinks(articles, targetCount) {
    if (articles.length <= targetCount) {
      return articles;
    }

    const selected = [];
    const used = new Set();

    // First, select by relevance
    const sorted = articles.sort((a, b) => b.relevance - a.relevance);
    
    for (let i = 0; i < Math.min(targetCount, sorted.length); i++) {
      selected.push(sorted[i]);
      used.add(sorted[i].slug);
    }

    return selected;
  }

  generateLinkContext(article, currentText) {
    const contexts = [
      `Learn more about ${article.title.toLowerCase()}`,
      `Discover ${article.title.toLowerCase()}`,
      `Read our guide on ${article.title.toLowerCase()}`,
      `Explore ${article.title.toLowerCase()}`,
      `Check out our ${article.title.toLowerCase()} guide`,
      `Find out more about ${article.title.toLowerCase()}`,
      `See how ${article.title.toLowerCase()} works`,
      `Understand ${article.title.toLowerCase()} better`
    ];

    return contexts[Math.floor(Math.random() * contexts.length)];
  }

  generateAnchorText(article) {
    // Use main heading or title, truncated if too long
    const text = article.mainHeading || article.title;
    return text.length > 60 ? text.substring(0, 57) + '...' : text;
  }

  calculateRelevance(article, currentText) {
    let score = 0;
    const articleText = `${article.title} ${article.keywords.join(' ')}`.toLowerCase();

    // Keyword overlap
    const currentWords = currentText.split(/\s+/);
    const articleWords = articleText.split(/\s+/);
    const commonWords = currentWords.filter(word => articleWords.includes(word));
    score += commonWords.length * 0.1;

    // Title similarity
    score += this.calculateSimilarity(currentText, article.title.toLowerCase()) * 0.3;

    // Keyword match
    article.keywords.forEach(keyword => {
      if (currentText.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    });

    return Math.min(score, 1);
  }

  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  insertInternalLinks(content, links) {
    if (!links || links.length === 0) {
      return content;
    }

    let contentWithLinks = content;
    let linkIndex = 0;

    // Insert links in paragraphs within prose sections
    const proseRegex = /<div class="prose prose-invert[^"]*"[^>]*>(.*?)<\/div>/gs;
    contentWithLinks = contentWithLinks.replace(proseRegex, (match, proseContent) => {
      if (linkIndex < links.length && proseContent.includes('<p>')) {
        const link = links[linkIndex];
        const linkHtml = `<a href="${link.distUrl}" class="text-green-400 hover:text-green-300 underline" title="${link.description}">${link.anchorText}</a>`;
        
        // Insert link after first paragraph
        const firstParagraphEnd = proseContent.indexOf('</p>') + 4;
        if (firstParagraphEnd > 4) {
          proseContent = proseContent.substring(0, firstParagraphEnd) + 
                        ` <span class="inline-block mt-2 text-sm text-gray-400">${link.context}: ${linkHtml}</span>` +
                        proseContent.substring(firstParagraphEnd);
          linkIndex++;
        }
        
        return match.replace(proseContent, proseContent);
      }
      return match;
    });

    // Insert links in list items
    const listItemRegex = /<li[^>]*>(.*?)<\/li>/g;
    contentWithLinks = contentWithLinks.replace(listItemRegex, (match, listContent) => {
      if (linkIndex < links.length && listContent.length > 50) {
        const link = links[linkIndex];
        const linkHtml = `<a href="${link.distUrl}" class="text-green-400 hover:text-green-300 underline" title="${link.description}">${link.anchorText}</a>`;
        
        // Insert link at the end of the list item
        listContent = listContent + ` <span class="text-sm text-gray-400">(${link.context}: ${linkHtml})</span>`;
        linkIndex++;
        
        return match.replace(listContent, listContent);
      }
      return match;
    });

    // Insert links in regular paragraphs
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/g;
    contentWithLinks = contentWithLinks.replace(paragraphRegex, (match, paragraphContent) => {
      if (linkIndex < links.length && paragraphContent.length > 100 && !paragraphContent.includes('<a href')) {
        const link = links[linkIndex];
        const linkHtml = `<a href="${link.distUrl}" class="text-green-400 hover:text-green-300 underline" title="${link.description}">${link.anchorText}</a>`;
        
        // Insert link in the middle of the paragraph
        const words = paragraphContent.split(' ');
        const insertIndex = Math.floor(words.length / 2);
        words.splice(insertIndex, 0, linkHtml);
        
        linkIndex++;
        return match.replace(paragraphContent, words.join(' '));
      }
      return match;
    });

    // Add related articles section if we have remaining links
    if (linkIndex < links.length) {
      const remainingLinks = links.slice(linkIndex);
      const relatedSection = this.generateRelatedArticlesSection(remainingLinks);
      
      // Insert before conclusion
      const conclusionRegex = /(<h2[^>]*>Conclusion<\/h2>)/i;
      contentWithLinks = contentWithLinks.replace(conclusionRegex, `${relatedSection}\n\n$1`);
    }

    return contentWithLinks;
  }

  generateRelatedArticlesSection(links) {
    if (links.length === 0) return '';

    return `
      <section class="section">
        <div class="container">
          <div class="max-w-4xl mx-auto">
            <div class="card">
              <h2 class="text-3xl font-bold gradient-text mb-6">📚 Related Articles</h2>
              <div class="grid md:grid-cols-2 gap-6">
                ${links.map(link => `
                  <div class="bg-gray-800/30 p-4 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
                    <h3 class="text-lg font-semibold mb-2">
                      <a href="${link.distUrl}" class="text-green-400 hover:text-green-300">
                        ${link.anchorText}
                      </a>
                    </h3>
                    <p class="text-gray-400 text-sm mb-3">${link.description}</p>
                    <div class="flex flex-wrap gap-2">
                      ${link.keywords.slice(0, 3).map(keyword => 
                        `<span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">${keyword}</span>`
                      ).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Update the link database when new articles are added
  updateLinkDatabase(newArticle) {
    const article = this.extractArticleMetadata(
      fs.readFileSync(path.join(this.postsDir, newArticle.filename), 'utf8'),
      newArticle.filename
    );
    
    if (article) {
      this.linkDatabase.articles.push(article);
      this.categorizeArticle(article, this.linkDatabase);
    }
  }

  // Get link statistics
  getLinkStats() {
    return {
      totalArticles: this.linkDatabase.articles.length,
      categories: Object.keys(this.linkDatabase.categories).map(cat => ({
        name: cat,
        count: this.linkDatabase.categories[cat].length
      })),
      totalKeywords: this.linkDatabase.keywords.size
    };
  }
}

export default InternalLinker;
