import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Image mapping for each section
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

function updateBlogImages() {
  const blogPath = path.join(__dirname, "../posts/blog-unlocking-the-power-of-whatsapp-automation-for-business-growth-2025-10-14.html");
  
  if (!fs.existsSync(blogPath)) {
    console.error("Blog post not found:", blogPath);
    return;
  }
  
  let blogContent = fs.readFileSync(blogPath, 'utf8');
  
  // Load generated image data
  for (const [sectionKey, sectionInfo] of Object.entries(imageMapping)) {
    const imageDataPath = path.join(__dirname, `../data/generated-images-${sectionKey}.json`);
    
    if (fs.existsSync(imageDataPath)) {
      const imageData = JSON.parse(fs.readFileSync(imageDataPath, 'utf8'));
      
      // Find the image in the specific section and replace it
      const sectionPattern = new RegExp(
        `(<section class="image-section"[^>]*>.*?<img[^>]*src="undefined"[^>]*alt="undefined"[^>]*>)`,
        's'
      );
      
      const replacement = `$1`.replace(
        'src="undefined"',
        `src="${imageData.localPath}"`
      ).replace(
        'alt="undefined"',
        `alt="${sectionInfo.alt}"`
      );
      
      // Find the specific section by ID
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
      }
    } else {
      console.log(`No image data found for section: ${sectionKey}`);
    }
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(blogPath, blogContent);
  console.log("Blog post updated with new images!");
}

updateBlogImages();
