import dotenv from 'dotenv';
import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Replicate with API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Note: Using nanobanana model which allows direct file writing

// Image generation prompts for each section
const imagePrompts = [
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

async function generateImages() {
  console.log("Starting image generation...");
  
  for (const imageData of imagePrompts) {
    try {
      console.log(`Generating image for ${imageData.section}...`);
      
      const output = await replicate.run("google/nano-banana", {
        input: {
          prompt: imageData.prompt
        }
      });
      
      console.log(`Generated image for ${imageData.section}:`, output);
      
      // Handle the output - nanobanana returns an object with url() method
      const imageUrl = await output.url();
      console.log(`Image URL:`, imageUrl);
      
      const imagesDir = path.join(__dirname, "../public/images/blog");
      
      // Create images directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      const localImagePath = path.join(imagesDir, imageData.filename);
      
      try {
        // Write the file directly to disk using the output object
        await fs.promises.writeFile(localImagePath, output);
        console.log(`Image saved to: ${localImagePath}`);
        
        // Save the image info
        const imageInfo = {
          section: imageData.section,
          url: imageUrl,
          localPath: `/images/blog/${imageData.filename}`,
          filename: imageData.filename,
          generated_at: new Date().toISOString()
        };
        
        const outputPath = path.join(__dirname, `../data/generated-images-${imageData.section}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(imageInfo, null, 2));
        
        console.log(`Image info saved to: ${outputPath}`);
        
      } catch (writeError) {
        console.error(`Error writing image for ${imageData.section}:`, writeError);
      }
      
    } catch (error) {
      console.error(`Error generating image for ${imageData.section}:`, error);
    }
  }
  
  console.log("Image generation completed!");
}

// Check if API token is available
if (!process.env.REPLICATE_API_TOKEN) {
  console.error("REPLICATE_API_TOKEN environment variable is required");
  console.log("Please set your Replicate API token:");
  console.log("export REPLICATE_API_TOKEN=your_token_here");
  process.exit(1);
}

generateImages().catch(console.error);
