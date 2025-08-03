# Language Versions - WittyReply Landing Page

This landing page is now available in three languages:

## Available Languages

### English (Default)
- **URL**: `/` or `/index.html`
- **Language Code**: `en`
- **Direction**: Left-to-Right (LTR)

### Arabic (العربية)
- **URL**: `/ar` or `/ar.html`
- **Language Code**: `ar`
- **Direction**: Right-to-Left (RTL)
- **Features**: 
  - Full Arabic translation
  - RTL layout support
  - Arabic-appropriate placeholders and examples

### French (Français)
- **URL**: `/fr` or `/fr.html`
- **Language Code**: `fr`
- **Direction**: Left-to-Right (LTR)
- **Features**:
  - Full French translation
  - French-appropriate placeholders and examples

## Implementation Details

### File Structure
```
landing-page/
├── index.html          # English version (default)
├── ar.html            # Arabic version
├── fr.html            # French version
├── src/
│   ├── main.js        # Main JavaScript
│   ├── style.css      # Styles
│   └── language-router.js  # Language routing logic
└── vercel.json        # Deployment configuration
```

### Routing Configuration
The `vercel.json` file includes routes to handle:
- `/ar` → `/ar.html`
- `/ar/` → `/ar.html`
- `/fr` → `/fr.html`
- `/fr/` → `/fr.html`

### Key Features
1. **Consistent Links**: All internal links point to the English version as requested
2. **No Translation Button**: The English version doesn't include a language switcher
3. **SEO Optimized**: Each language version has appropriate meta tags and language attributes
4. **Responsive Design**: All versions maintain the same responsive design and functionality

### Content Translation
- **Navigation**: Fully translated menu items
- **Hero Section**: Complete translation of headlines and descriptions
- **Features**: All feature descriptions translated
- **Pricing**: Pricing information and plan details translated
- **Contact Form**: Form labels and placeholders translated
- **Footer**: Footer content and links translated

### Technical Notes
- Arabic version uses `dir="rtl"` and `lang="ar"` attributes
- French version uses `lang="fr"` attribute
- All JavaScript functionality remains the same across versions
- CSS styles work for both LTR and RTL layouts
- Form submissions work identically across all languages

## Deployment
The site can be deployed to any static hosting service (Vercel, Netlify, etc.) and the routing will work correctly with the provided `vercel.json` configuration. 