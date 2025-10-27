#!/usr/bin/env node

import Replicate from "replicate";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageGenerator {
  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    this.imagesDir = path.join(__dirname, '../public/images/blog');
    this.ensureImagesDirectory();
  }

  ensureImagesDirectory() {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
      console.log('📁 Created blog images directory');
    }
  }

  async generateImage(prompt, options = {}) {
    try {
      console.log(`🎨 Generating image: "${prompt}"`);
      
      const input = {
        prompt: prompt,
        go_fast: options.goFast !== false,
        guidance: options.guidance || 3.5,
        megapixels: options.megapixels || "1",
        num_outputs: options.numOutputs || 1,
        aspect_ratio: options.aspectRatio || "16:9",
        output_format: options.outputFormat || "webp",
        output_quality: options.outputQuality || 80,
        prompt_strength: options.promptStrength || 0.8,
        num_inference_steps: options.numInferenceSteps || 28
      };

      const output = await this.replicate.run("black-forest-labs/flux-dev", { input });
      
      if (!output || !output[0]) {
        throw new Error('No image generated');
      }

      // Download and save the image
      const imageUrl = output[0];
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Generate filename
      const filename = this.generateFilename(prompt, options.aspectRatio || "16:9");
      const filepath = path.join(this.imagesDir, filename);
      
      // Save image
      fs.writeFileSync(filepath, imageBuffer);
      
      console.log(`✅ Image saved: ${filename}`);
      
      return {
        filename,
        filepath,
        url: `images/blog/${filename}`,
        prompt,
        aspectRatio: options.aspectRatio || "16:9"
      };
      
    } catch (error) {
      console.error('❌ Error generating image:', error.message);
      return null;
    }
  }

  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('❌ Error downloading image:', error.message);
      throw error;
    }
  }

  generateFilename(prompt, aspectRatio) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const slug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const ratio = aspectRatio.replace(':', 'x');
    return `blog-${slug}-${ratio}-${timestamp}.webp`;
  }

  async generateBlogImages(topic, articleContent) {
    try {
      console.log(`🎨 Generating images for blog: "${topic.title}"`);
      
      const images = [];
      
      // 1. Hero image for the article
      const heroPrompt = this.generateHeroPrompt(topic);
      const heroImage = await this.generateImage(heroPrompt, {
        aspectRatio: "16:9",
        megapixels: "1",
        outputQuality: 90
      });
      
      if (heroImage) {
        images.push({
          ...heroImage,
          type: 'hero',
          alt: `Hero image for ${topic.title}`,
          caption: `Visual representation of ${topic.keyword} concepts`
        });
      }

      // 2. Section images based on content
      const sectionImages = await this.generateSectionImages(topic, articleContent);
      images.push(...sectionImages);

      // 3. Infographic or diagram image
      const infographicPrompt = this.generateInfographicPrompt(topic);
      const infographicImage = await this.generateImage(infographicPrompt, {
        aspectRatio: "1:1",
        megapixels: "1",
        outputQuality: 85
      });
      
      if (infographicImage) {
        images.push({
          ...infographicImage,
          type: 'infographic',
          alt: `Infographic about ${topic.keyword}`,
          caption: `Key statistics and benefits of ${topic.keyword}`
        });
      }

      console.log(`✅ Generated ${images.length} images for blog post`);
      return images;
      
    } catch (error) {
      console.error('❌ Error generating blog images:', error.message);
      return [];
    }
  }

  generateHeroPrompt(topic) {
    const industry = this.getIndustryFromTopic(topic);
    const keyword = topic.keyword.toLowerCase();
    
    const prompts = {
      'whatsapp automation': `Professional business team using WhatsApp automation on mobile devices, modern office setting, clean and professional, business technology, digital transformation, high quality, corporate style`,
      'lead generation': `Business professionals generating leads through digital channels, modern marketing dashboard, growth charts, professional office environment, digital marketing tools, clean and modern`,
      'customer service': `Happy customer service representative helping clients, modern call center, professional support team, customer satisfaction, digital communication tools, clean office environment`,
      'small business': `Small business owner using digital tools for growth, modern workspace, laptop and mobile devices, professional small business environment, clean and inspiring`,
      'business automation': `Modern business automation dashboard, digital transformation, professional office, technology integration, clean and modern design, corporate environment`
    };

    for (const [key, prompt] of Object.entries(prompts)) {
      if (keyword.includes(key)) {
        return prompt;
      }
    }

    return `Professional business concept related to ${topic.keyword}, modern office environment, clean and professional, digital technology, high quality business photography`;
  }

  generateSectionImages(topic, articleContent) {
    const images = [];
    const sections = this.extractSections(articleContent);
    
    // Generate 2-3 section images
    const maxImages = Math.min(3, sections.length);
    
    for (let i = 0; i < maxImages; i++) {
      const section = sections[i];
      if (section) {
        const prompt = this.generateSectionPrompt(topic, section);
        images.push({
          prompt,
          type: 'section',
          sectionTitle: section.title
        });
      }
    }
    
    return images;
  }

  generateSectionPrompt(topic, section) {
    const keyword = topic.keyword.toLowerCase();
    const sectionTitle = section.title.toLowerCase();
    
    if (sectionTitle.includes('benefit') || sectionTitle.includes('advantage')) {
      return `Business benefits and advantages visualization, professional charts and graphs, modern office environment, clean and professional, digital business concept`;
    } else if (sectionTitle.includes('implementation') || sectionTitle.includes('step')) {
      return `Step-by-step business process implementation, professional workflow diagram, modern office tools, clean and organized workspace, business strategy visualization`;
    } else if (sectionTitle.includes('example') || sectionTitle.includes('case study')) {
      return `Real business case study example, professional business environment, success story visualization, modern office setting, clean and inspiring`;
    } else if (sectionTitle.includes('tool') || sectionTitle.includes('resource')) {
      return `Business tools and resources, modern technology stack, professional software interface, clean and organized workspace, digital business tools`;
    } else {
      return `Professional business concept related to ${keyword}, modern office environment, clean and professional, digital technology, high quality business photography`;
    }
  }

  generateInfographicPrompt(topic) {
    const keyword = topic.keyword.toLowerCase();
    
    return `Infographic design about ${keyword}, professional statistics and data visualization, modern business charts, clean design, corporate style, information graphics, professional color scheme`;
  }

  extractSections(articleContent) {
    // Extract section titles from HTML content
    const sectionRegex = /<h2[^>]*class="[^"]*gradient-text[^"]*"[^>]*>(.*?)<\/h2>/gi;
    const sections = [];
    let match;
    
    while ((match = sectionRegex.exec(articleContent)) !== null) {
      sections.push({
        title: match[1].replace(/<[^>]*>/g, '').trim()
      });
    }
    
    return sections;
  }

  getIndustryFromTopic(topic) {
    const keyword = topic.keyword.toLowerCase();
    if (keyword.includes('real estate')) return 'real estate';
    if (keyword.includes('ecommerce') || keyword.includes('online store')) return 'ecommerce';
    if (keyword.includes('consulting') || keyword.includes('professional services')) return 'consulting';
    if (keyword.includes('restaurant') || keyword.includes('food')) return 'food service';
    if (keyword.includes('healthcare') || keyword.includes('medical')) return 'healthcare';
    if (keyword.includes('small business')) return 'small business';
    return 'business automation';
  }

  async generateSectionImagesAsync(topic, sectionPrompts) {
    const images = [];
    
    for (const sectionPrompt of sectionPrompts) {
      try {
        const image = await this.generateImage(sectionPrompt.prompt, {
          aspectRatio: "16:9",
          megapixels: "1",
          outputQuality: 80
        });
        
        if (image) {
          images.push({
            ...image,
            type: 'section',
            alt: `Section image: ${sectionPrompt.sectionTitle}`,
            caption: `Visual representation of ${sectionPrompt.sectionTitle}`,
            sectionTitle: sectionPrompt.sectionTitle
          });
        }
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error generating section image: ${error.message}`);
      }
    }
    
    return images;
  }

  // Batch image generation (from generate-blog-images.js)
  async generateBatchImages(prompts) {
    console.log(`🎨 Starting batch image generation for ${prompts.length} prompts...`);
    
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const promptData = prompts[i];
      console.log(`\n📝 Generating image ${i + 1}/${prompts.length}: ${promptData.section}`);
      
      try {
        const output = await this.replicate.run("google/nano-banana", {
          input: {
            prompt: promptData.prompt
          }
        });
        
        console.log(`Generated image for ${promptData.section}:`, output);
        
        // Handle the output - nanobanana returns an object with url() method
        const imageUrl = await output.url();
        console.log(`Image URL:`, imageUrl);
        
        // Create images directory if it doesn't exist
        if (!fs.existsSync(this.imagesDir)) {
          fs.mkdirSync(this.imagesDir, { recursive: true });
        }
        
        const localImagePath = path.join(this.imagesDir, promptData.filename);
        
        try {
          // Write the file directly to disk using the output object
          await fs.promises.writeFile(localImagePath, output);
          console.log(`Image saved to: ${localImagePath}`);
          
          // Save the image info
          const imageInfo = {
            section: promptData.section,
            url: imageUrl,
            localPath: `/images/blog/${promptData.filename}`,
            filename: promptData.filename,
            generated_at: new Date().toISOString()
          };
          
          const outputPath = path.join(__dirname, `../data/generated-images-${promptData.section}.json`);
          fs.writeFileSync(outputPath, JSON.stringify(imageInfo, null, 2));
          
          console.log(`Image info saved to: ${outputPath}`);
          
          results.push({
            success: true,
            section: promptData.section,
            filename: promptData.filename,
            filepath: localImagePath,
            url: imageUrl
          });
          
        } catch (writeError) {
          console.error(`Error writing image for ${promptData.section}:`, writeError);
          results.push({
            success: false,
            section: promptData.section,
            error: writeError.message
          });
        }
        
      } catch (error) {
        console.error(`Error generating image for ${promptData.section}:`, error);
        results.push({
          success: false,
          section: promptData.section,
          error: error.message
        });
      }
    }
    
    console.log(`\n🎨 Batch image generation completed!`);
    console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
    console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
    
    return results;
  }

  // Update blog post images (from update-blog-images.js)
  async updateBlogPostImages(blogPath, imageMapping) {
    if (!fs.existsSync(blogPath)) {
      console.error("Blog post not found:", blogPath);
      return false;
    }
    
    let blogContent = fs.readFileSync(blogPath, 'utf8');
    let updated = false;
    
    // Load generated image data
    for (const [sectionKey, sectionInfo] of Object.entries(imageMapping)) {
      const imageDataPath = path.join(__dirname, `../data/generated-images-${sectionKey}.json`);
      
      if (fs.existsSync(imageDataPath)) {
        const imageData = JSON.parse(fs.readFileSync(imageDataPath, 'utf8'));
        
        // Find the specific section by ID and update image
        const sectionIdPattern = new RegExp(
          `(<section class="main-content-section" id="${sectionInfo.section}"[^>]*>.*?<img[^>]*src="undefined"[^>]*alt="undefined"[^>]*>)`,
          's'
        );
        
        if (sectionIdPattern.test(blogContent)) {
          blogContent = blogContent.replace(sectionIdPattern, (match) => {
            return match.replace(
              'src="undefined"',
              `src="${imageData.localPath}"`
            ).replace(
              'alt="undefined"',
              `alt="${sectionInfo.alt}"`
            );
          });
          
          console.log(`Updated image for section ${sectionInfo.section}: ${imageData.localPath}`);
          updated = true;
        }
      } else {
        console.log(`No image data found for section: ${sectionKey}`);
      }
    }
    
    if (updated) {
      // Write the updated content back to the file
      fs.writeFileSync(blogPath, blogContent);
      console.log("Blog post updated with new images!");
      return true;
    }
    
    return false;
  }

  // CLI interface for image generation
  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];

    switch (command) {
      case 'batch':
        const prompts = [
          {
            section: "fundamentals",
            prompt: "Modern infographic showing WhatsApp chatbot fundamentals with AI and automation concepts. Clean business illustration with WhatsApp logo, chat bubbles, AI brain icon, automation gears, and customer service elements. Professional blue and green color scheme, flat design style, high quality, 16:9 aspect ratio",
            filename: "whatsapp-chatbot-fundamentals.webp"
          },
          {
            section: "strategies", 
            prompt: "Business automation workflow diagram showing advanced WhatsApp chatbot implementation strategies. Modern corporate illustration with workflow arrows, strategy planning elements, CRM integration, and business process optimization. Professional green and blue color scheme, clean design, 16:9 aspect ratio",
            filename: "whatsapp-chatbot-strategies.webp"
          },
          {
            section: "case-studies",
            prompt: "Business success analytics dashboard showing real-world WhatsApp chatbot case studies. Modern data visualization with charts, graphs, success metrics, customer satisfaction indicators, and business growth elements. Professional corporate color scheme, clean infographic style, 16:9 aspect ratio",
            filename: "whatsapp-chatbot-case-studies.webp"
          }
        ];
        await this.generateBatchImages(prompts);
        break;

      case 'test':
        await this.testImageGeneration();
        break;

      case 'update':
        const blogPath = param || path.join(__dirname, '../posts/blog-unlocking-the-power-of-whatsapp-automation-for-business-growth-2025-10-14.html');
        const imageMapping = {
          "fundamentals": {
            section: "section-1",
            alt: "WhatsApp Chatbot Fundamentals - AI and Automation Concepts"
          },
          "strategies": {
            section: "section-2", 
            alt: "Advanced WhatsApp Chatbot Implementation Strategies"
          },
          "case-studies": {
            section: "section-3",
            alt: "Real-World WhatsApp Chatbot Case Studies and Success Metrics"
          }
        };
        await this.updateBlogPostImages(blogPath, imageMapping);
        break;

      default:
        console.log(`
🎨 Unified Image Generator

Usage:
  node image-generator.js batch                    - Generate batch images for blog sections
  node image-generator.js test                      - Test image generation
  node image-generator.js update [blog-path]        - Update blog post with generated images

Examples:
  node image-generator.js batch
  node image-generator.js test
  node image-generator.js update posts/my-blog-post.html

Features:
  🎨 AI-powered image generation using Flux Dev
  📊 Batch processing for multiple images
  🔄 Blog post image updating
  📁 Automatic file management
  🎯 Optimized prompts for different content types
        `);
    }
  }

  async testImageGeneration() {
    console.log('\n🎨 Testing image generation...');
    
    try {
      const testPrompt = "Professional business team using modern technology, clean office environment, digital transformation concept";
      const image = await this.generateImage(testPrompt, {
        aspectRatio: "16:9",
        megapixels: "1",
        outputQuality: 80
      });
      
      if (image) {
        console.log(`✅ Test image generated successfully: ${image.filename}`);
        console.log(`📁 Saved to: ${image.filepath}`);
        return true;
      } else {
        console.log('❌ Test image generation failed');
        return false;
      }
    } catch (error) {
      console.error(`❌ Image generation test failed: ${error.message}`);
      return false;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ImageGenerator();
  generator.runCLI().catch(console.error);
}

export default ImageGenerator;
