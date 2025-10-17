const fs = require('fs');

// Read the current blog.html file
const blogHtml = fs.readFileSync('blog.html', 'utf8');

// Define blog posts in chronological order (most recent first)
const blogPosts = [
  // October 2025
  {
    date: "October 2025",
    category: "Free Tools",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Unlocking Business Efficiency: How to Leverage Free WhatsApp Chatbots for Seamless Automation",
    href: "posts/blog-unlocking-business-efficiency-how-to-leverage-free-whatsapp-chatbots-for-seamless-automation-2025-10-14.html",
    description: "Discover how free WhatsApp chatbots can revolutionize business automation with advanced strategies, real-world examples, and actionable insights.",
    readTime: "11 min read",
    tags: ["whatsapp chatbot free"],
    featured: true
  },
  {
    date: "October 2025",
    category: "API",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "Unlocking Business Potential: Harnessing the Power of WhatsApp Business API for Seamless Automation",
    href: "posts/blog-unlocking-business-potential-harnessing-the-power-of-whatsapp-business-api-for-seamless-automation-2025-10-14.html",
    description: "Discover how WhatsApp Business API streamlines business automation, enhancing efficiency and customer engagement. Learn strategies, tools, and trends.",
    readTime: "12 min read",
    tags: ["whatsapp business api"]
  },
  {
    date: "October 2025",
    category: "Business",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Unlocking the Power of WhatsApp Automation for Business Growth",
    href: "posts/blog-unlocking-the-power-of-whatsapp-automation-for-business-growth-2025-10-14.html",
    description: "Discover comprehensive strategies for utilizing WhatsApp automation tools to enhance business efficiency and drive growth.",
    readTime: "12 min read",
    tags: ["whatsapp automation tools"]
  },
  {
    date: "October 2025",
    category: "Business",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Whatsapp Automation For Small Business",
    href: "posts/blog-whatsapp-automation-for-small-business-2025-10-14.html",
    description: "Comprehensive guide to whatsapp automation for small business for modern businesses",
    readTime: "8 min read",
    tags: []
  },
  {
    date: "October 2025",
    category: "Marketing",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "Digital Marketing Strategies",
    href: "posts/blog-digital-marketing-strategies-2025-10-14.html",
    description: "Comprehensive guide to digital marketing strategies for modern businesses",
    readTime: "8 min read",
    tags: []
  },
  {
    date: "October 2025",
    category: "Marketing",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "Social Media Marketing",
    href: "posts/blog-social-media-marketing-2025-10-14.html",
    description: "Comprehensive guide to social media marketing for modern businesses",
    readTime: "9 min read",
    tags: ["social media marketing"]
  },
  
  // September 2025
  {
    date: "September 2025",
    category: "AI Tools",
    categoryClass: "bg-purple-500/20 text-purple-400",
    title: "AI-Powered Ai Automation Examples: Transform Your Business",
    href: "posts/blog-ai-powered-ai-automation-examples-transform-your-business-2025-09-13.html",
    description: "Comprehensive guide to ai automation examples for modern businesses. Learn implementation strategies and best practices.",
    readTime: "10 min read",
    tags: ["AI", "Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "AI Tools",
    categoryClass: "bg-purple-500/20 text-purple-400",
    title: "AI-Powered Whatsapp Ai Automation: Transform Your Business",
    href: "posts/blog-ai-powered-whatsapp-ai-automation-transform-your-business-2025-09-13.html",
    description: "Comprehensive guide to whatsapp ai automation for modern businesses. Learn implementation strategies and best practices.",
    readTime: "10 min read",
    tags: ["AI", "Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "Software",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "Best WhatsApp Automation Software: Expert Reviews & Comparisons",
    href: "posts/blog-best-whatsapp-automation-software-expert-reviews-comparisons-2025-09-13.html",
    description: "Compare top WhatsApp automation software solutions and find the perfect fit for your business needs.",
    readTime: "10 min read",
    tags: ["Automation", "Software"]
  },
  {
    date: "September 2025",
    category: "Business",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Business WhatsApp Automation Tools: Features & Benefits Guide",
    href: "posts/blog-business-whatsapp-automation-tools-features-benefits-guide-2025-09-13.html",
    description: "Explore essential WhatsApp automation tools that help businesses scale customer communication effectively.",
    readTime: "10 min read",
    tags: ["Automation", "Business", "Tools"]
  },
  {
    date: "September 2025",
    category: "Business",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Essential WhatsApp Automation Tools Every Business Needs",
    href: "posts/blog-essential-whatsapp-automation-tools-every-business-needs-2025-09-13.html",
    description: "Explore essential WhatsApp automation tools that help businesses scale customer communication effectively.",
    readTime: "10 min read",
    tags: ["Automation", "Business", "Tools"]
  },
  {
    date: "September 2025",
    category: "Software",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "Master Top 10 Whatsapp Automation Software for Business Growth",
    href: "posts/blog-master-top-10-whatsapp-automation-software-for-business-growth-2025-09-13.html",
    description: "Comprehensive guide to top 10 whatsapp automation software for modern businesses. Learn implementation strategies and best practices.",
    readTime: "10 min read",
    tags: ["Automation", "Software", "Business"]
  },
  {
    date: "September 2025",
    category: "Business",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Master Whatsapp Automation Program for Business Growth",
    href: "posts/blog-master-whatsapp-automation-program-for-business-growth-2025-09-13.html",
    description: "Comprehensive guide to whatsapp automation program for modern businesses. Learn implementation strategies and best practices.",
    readTime: "10 min read",
    tags: ["Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "Software",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "Master Whatsapp Automation Software for Business Growth",
    href: "posts/blog-master-whatsapp-automation-software-for-business-growth-2025-09-13.html",
    description: "Comprehensive guide to whatsapp automation software for modern businesses. Learn implementation strategies and best practices.",
    readTime: "10 min read",
    tags: ["Automation", "Software", "Business"]
  },
  {
    date: "September 2025",
    category: "Business",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Master Whatsapp Automation Tools for Business Growth",
    href: "posts/blog-master-whatsapp-automation-tools-for-business-growth-2025-09-13.html",
    description: "Comprehensive guide to whatsapp automation tools for modern businesses. Learn implementation strategies and best practices.",
    readTime: "10 min read",
    tags: ["Automation", "Business", "Tools"]
  },
  {
    date: "September 2025",
    category: "Marketing",
    categoryClass: "bg-pink-500/20 text-pink-400",
    title: "Powerful WhatsApp Marketing Automation Tools for Modern Businesses",
    href: "posts/blog-powerful-whatsapp-marketing-automation-tools-for-modern-businesses-2025-09-13.html",
    description: "Transform your marketing strategy with advanced WhatsApp automation software designed for business growth.",
    readTime: "10 min read",
    tags: ["Automation", "Business", "Marketing"]
  },
  {
    date: "September 2025",
    category: "AI Tools",
    categoryClass: "bg-purple-500/20 text-purple-400",
    title: "Revolutionary WhatsApp AI Tools: Automate Your Customer Service in 2024",
    href: "posts/blog-revolutionary-whatsapp-ai-tools-automate-your-customer-service-in-2024-2025-09-13.html",
    description: "Discover powerful WhatsApp AI automation tools that streamline customer service and boost business efficiency.",
    readTime: "10 min read",
    tags: ["AI", "Tools"]
  },
  {
    date: "September 2025",
    category: "AI Tools",
    categoryClass: "bg-purple-500/20 text-purple-400",
    title: "Top WhatsApp Automation AI Tools That Transform Business Communication",
    href: "posts/blog-top-whatsapp-automation-ai-tools-that-transform-business-communication-2025-09-13.html",
    description: "Discover powerful WhatsApp AI automation tools that streamline customer service and boost business efficiency.",
    readTime: "10 min read",
    tags: ["AI", "Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "Marketing",
    categoryClass: "bg-pink-500/20 text-pink-400",
    title: "Transform Your Marketing with WhatsApp Automation Software",
    href: "posts/blog-transform-your-marketing-with-whatsapp-automation-software-2025-09-13.html",
    description: "Transform your marketing strategy with advanced WhatsApp automation software designed for business growth.",
    readTime: "10 min read",
    tags: ["Automation", "Software", "Marketing"]
  },
  {
    date: "September 2025",
    category: "Lead Generation",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Mastering Property Lead Generation with Smart Automation",
    href: "posts/blog-mastering-property-lead-generation-with-smart-automation-2025-09-08.html",
    description: "Discover how business automation can transform property lead generation and customer engagement with practical tips for beginners.",
    readTime: "2 min read",
    tags: ["Lead Generation", "Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "Automation",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Leveraging WhatsApp Automation for a Stellar Back-to-School Campaign",
    href: "posts/blog-leveraging-whatsapp-automation-for-a-stellar-back-to-school-campaign-2025-09-08.html",
    description: "Discover how WhatsApp automation can enhance your back-to-school marketing strategies, driving engagement and boosting sales effectively.",
    readTime: "2 min read",
    tags: ["Automation", "Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "Automation",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "How WhatsApp Automation Can Streamline Your Business",
    href: "posts/blog-how-whatsapp-automation-can-streamline-your-business-2025-09-03.html",
    description: "Discover how WhatsApp automation can transform your business operations and improve your results.",
    readTime: "8 min read",
    tags: ["Automation", "Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "WhatsApp",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "How WhatsApp Automation Can Enhance Your Business",
    href: "posts/blog-how-whatsapp-automation-can-enhance-your-business-2025-09-03.html",
    description: "Discover how WhatsApp automation can transform your business operations and streamline your results.",
    readTime: "8 min read",
    tags: ["WhatsApp", "Automation", "Business"]
  },
  {
    date: "September 2025",
    category: "Customer Service",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "Transform Your Customer Service with WhatsApp Automation: A Complete Guide",
    href: "posts/blog-transform-your-customer-service-with-whatsapp-automation-a-complete-guide-2025-09-03.html",
    description: "See how businesses are using WhatsApp automation to improve customer satisfaction and reduce response times.",
    readTime: "9 min read",
    tags: ["Customer Service", "Automation", "Business"]
  },
  
  // August 2025
  {
    date: "August 2025",
    category: "Pro Tips",
    categoryClass: "bg-green-500/20 text-green-400",
    title: "How WhatsApp Automation Can Optimize Your Business: Pro Tips",
    href: "posts/blog-how-whatsapp-automation-can-optimize-your-business-pro-tips-2025-08-29.html",
    description: "Advanced strategies and pro tips for optimizing your business with WhatsApp automation. Learn expert techniques to maximize efficiency and customer satisfaction.",
    readTime: "8 min read",
    tags: ["Pro Tips", "Optimization"]
  },
  {
    date: "August 2025",
    category: "Complete Guide",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "How WhatsApp Automation Can Optimize Your Business: Complete Guide",
    href: "posts/blog-how-whatsapp-automation-can-optimize-your-business-complete-guide-2025-08-29.html",
    description: "A comprehensive guide to WhatsApp automation for business optimization. Everything you need to know to implement and scale your WhatsApp automation strategy.",
    readTime: "10 min read",
    tags: ["Complete Guide", "Strategy"]
  },
  {
    date: "August 2025",
    category: "Business Guide",
    categoryClass: "bg-yellow-500/20 text-yellow-400",
    title: "How WhatsApp Automation Can Optimize Your Business",
    href: "posts/blog-how-whatsapp-automation-can-optimize-your-business-2025-08-28.html",
    description: "Discover the fundamentals of WhatsApp automation and how it can transform your business operations. Learn practical implementation strategies and best practices.",
    readTime: "7 min read",
    tags: ["Business Guide", "Fundamentals"]
  },
  
  // June 2025
  {
    date: "June 2025",
    category: "E-commerce",
    categoryClass: "bg-purple-500/20 text-purple-400",
    title: "The Complete Guide to WhatsApp Business API for E-commerce: Effective Ways to Use WittyReply",
    href: "posts/blog_post_2025-06-25.html",
    description: "In the bustling landscape of e-commerce, where customer interactions can make or break a sale, small to medium-sized businesses (SMBs) are constantly seeking innovative ways to enhance their customer service.",
    readTime: "6 min read",
    tags: ["E-commerce", "API"]
  },
  
  // January 2025
  {
    date: "January 2025",
    category: "Lead Generation",
    categoryClass: "bg-primary-500/20 text-primary-400",
    title: "WhatsApp Lead Generation: 7 Automated Sequences That Convert Browsers Into Buyers",
    href: "posts/blog-whatsapp-lead-generation-sequences.html",
    description: "Master WhatsApp lead generation with 7 proven automated sequences. Step-by-step templates, conversion strategies, and real examples that turn casual inquiries into paying customers. Includes the SPARK framework and advanced optimization tips.",
    readTime: "12 min read",
    tags: ["Lead Generation", "Conversion", "Templates"]
  },
  {
    date: "January 2025",
    category: "ROI Analysis",
    categoryClass: "bg-red-500/20 text-red-400",
    title: "The Real Cost of Manual WhatsApp Management: Why SMBs Lose $50K+ Annually",
    href: "posts/blog-cost-manual-whatsapp-management.html",
    description: "Calculate the hidden costs of manual WhatsApp management. See why small businesses lose $50K+ annually in productivity, missed leads, and opportunity costs. Complete ROI calculator and business case included.",
    readTime: "10 min read",
    tags: ["ROI", "Cost Savings"]
  },
  {
    date: "January 2025",
    category: "Real Estate",
    categoryClass: "bg-blue-500/20 text-blue-400",
    title: "How Real Estate Agents Use WhatsApp Automation to Close More Deals (Without Being Pushy)",
    href: "posts/blog-real-estate-whatsapp-automation.html",
    description: "Discover how top real estate agents use WhatsApp automation to nurture leads, schedule viewings, and close 40% more deals while maintaining personal relationships. Includes 7 essential automations and real success stories.",
    readTime: "8 min read",
    tags: ["Real Estate", "Sales"]
  },
  
  // December 2024
  {
    date: "December 2024",
    category: "Customer Service",
    categoryClass: "bg-primary-500/20 text-primary-400",
    title: "How WhatsApp Automation Can Transform Your Small Business Customer Service (And Save You 20+ Hours Per Week)",
    href: "posts/blog-whatsapp-automation-smb.html",
    description: "Discover how small and medium businesses are using WhatsApp automation to provide 24/7 customer service, reduce response times, and free up valuable time for business growth. Learn the 5 key benefits and see real-world examples.",
    readTime: "6 min read",
    tags: ["WhatsApp", "Automation", "SMB"]
  }
];

// Function to generate HTML for a blog post
function generateBlogPostHTML(post, index) {
  const isFeatured = post.featured || index === 0;
  const cardClass = isFeatured ? "card md:col-span-2" : "card";
  const titleClass = isFeatured ? "text-2xl font-semibold mb-3 leading-tight" : "text-xl font-semibold mb-3 leading-tight";
  
  const tagsHTML = post.tags.map(tag => 
    `<span class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">${tag}</span>`
  ).join('\n                    ');
  
  return `          <article class="${cardClass}">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <span class="${post.categoryClass} px-3 py-1 rounded-full text-sm font-medium">${post.category}</span>
                <span class="text-gray-400 text-sm">${post.date}</span>
              </div>
              <h3 class="${titleClass}">
                <a href="${post.href}" class="text-white hover:text-primary-400 transition-colors">
                  ${post.title}
                </a>
              </h3>
              <p class="text-gray-300 mb-4">
                ${post.description}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-400">📖 ${post.readTime}</span>
                  <div class="flex space-x-2">
                    ${tagsHTML}
                  </div>
                </div>
                <a href="${post.href}" class="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                  Read More →
                </a>
              </div>
            </div>
          </article>`;
}

// Generate all blog posts HTML
const blogPostsHTML = blogPosts.map((post, index) => generateBlogPostHTML(post, index)).join('\n\n');

// Find the blog articles section and replace it
const blogSectionStart = '<!-- Blog Articles Section -->';
const blogSectionEnd = '<!-- Blog CTA Section -->';

const startIndex = blogHtml.indexOf(blogSectionStart);
const endIndex = blogHtml.indexOf(blogSectionEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const beforeSection = blogHtml.substring(0, startIndex);
  const afterSection = blogHtml.substring(endIndex);
  
  const newBlogSection = `${blogSectionStart}
    <section class="section bg-gray-800/50">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
${blogPostsHTML}
        </div>
      </div>
    </section>

    `;
  
  const newBlogHtml = beforeSection + newBlogSection + afterSection;
  
  // Write the new blog.html file
  fs.writeFileSync('blog.html', newBlogHtml, 'utf8');
  console.log('Blog posts have been reorganized by date (most recent first)');
} else {
  console.error('Could not find blog articles section in the HTML file');
}
