# Image Generation Setup for Blog Post

## Prerequisites

1. **Get a Replicate API Token:**
   - Go to https://replicate.com/account/api-tokens
   - Create a new API token
   - Copy the token

2. **Set up the API Token:**
   - Create a `.env` file in the project root
   - Add your API token: `REPLICATE_API_TOKEN=your_token_here`

## Running the Image Generation

1. **Generate Images:**
   ```bash
   node scripts/generate-blog-images.js
   ```

2. **Update Blog Post:**
   ```bash
   node scripts/update-blog-images.js
   ```

## What the Scripts Do

### generate-blog-images.js
- Generates 3 images using Flux model via Replicate API:
  - **Fundamentals**: WhatsApp chatbot basics and AI concepts
  - **Strategies**: Advanced implementation and business automation
  - **Case Studies**: Real-world examples and success metrics
- Downloads images to `public/images/blog/`
- Saves image metadata to `data/generated-images-*.json`

### update-blog-images.js
- Updates the blog post HTML with the generated image paths
- Replaces `src="undefined"` with actual image paths
- Updates alt text with descriptive content

## Generated Images

The script will create these images:
- `whatsapp-chatbot-fundamentals.webp`
- `whatsapp-chatbot-strategies.webp` 
- `whatsapp-chatbot-case-studies.webp`

All images are optimized for web use and stored in the `public/images/blog/` directory.
