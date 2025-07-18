# WittyReply Landing Page

A modern, responsive landing page for WittyReply AI WhatsApp Assistant built with Vite, Tailwind CSS, and vanilla JavaScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### Option 1: Cloudflare Pages (Recommended)

#### Method A: Direct Upload
1. Run `npm run build` to create the `dist` folder
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Click "Create a project" → "Upload assets"
4. Upload the entire `dist` folder
5. Set your custom domain (optional)

#### Method B: Git Integration
1. Push your code to GitHub/GitLab
2. Connect repository in Cloudflare Pages
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `landing-page`
   - **Node.js version:** `18.x` (recommended)

### Option 2: Vercel

#### Method A: Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? N
# - What's your project's name? wittyreply-landing
# - In which directory is your code located? ./
```

#### Method B: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure settings:
   - **Root Directory:** `landing-page`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Option 3: Netlify

#### Method A: Drag & Drop
1. Run `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the deployment area

#### Method B: Git Integration
1. Connect your repository
2. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** `landing-page`

## 🛠️ Build Configuration

### Environment Variables (Optional)
Create a `.env` file in the root directory:
```env
VITE_WORKER_URL=https://your-worker-url.workers.dev
VITE_GA_ID=your-google-analytics-id
```

### Build Settings for Different Platforms

| Platform | Build Command | Output Directory | Root Directory |
|----------|---------------|------------------|----------------|
| Cloudflare Pages | `npm run build` | `dist` | `landing-page` |
| Vercel | `npm run build` | `dist` | `landing-page` |
| Netlify | `npm run build` | `dist` | `landing-page` |

## 🔧 Custom Domain Setup

### Cloudflare Pages
1. Go to your project → Custom domains
2. Add your domain (e.g., `landing.wittyreply.com`)
3. Update DNS records as instructed

### Vercel
1. Go to your project → Domains
2. Add your domain
3. Configure DNS records

## 📊 Performance & SEO

The landing page is optimized for:
- ✅ Fast loading (< 3s)
- ✅ Mobile responsiveness
- ✅ SEO-friendly structure
- ✅ Accessibility standards
- ✅ Form submissions via Cloudflare Worker

## 🎨 Customization

### Colors
Update the Tailwind color scheme in `tailwind.config.js`

### Content
Modify content directly in `index.html`

### Styling
Add custom styles in `src/style.css`

### Functionality
Update interactions in `src/main.js`

## 🔗 Live Demo

Once deployed, your landing page will be accessible at:
- **Cloudflare Pages:** `https://your-project.pages.dev`
- **Vercel:** `https://your-project.vercel.app`
- **Netlify:** `https://your-project.netlify.app`

## 📞 Support

For issues or questions, contact the development team or check the main project repository.

---

Built with ❤️ for WittyReply AI WhatsApp Assistant 