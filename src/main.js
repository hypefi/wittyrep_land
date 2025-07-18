import './style.css'

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Mobile menu functionality
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
  
  mobileMenuBtn.addEventListener('click', function() {
    mobileMenu.classList.toggle('-translate-x-full');
  });
  
  // Close mobile menu when clicking on a link
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.add('-translate-x-full');
    });
  });
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slide-up');
      }
    });
  }, observerOptions);
  
  // Observe elements for animations
  document.querySelectorAll('.feature-card, .pricing-card, .about-text, .about-image, .contact-form, .contact-info').forEach(el => {
    observer.observe(el);
  });
  
  // Parallax effect for hero section
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.animate-float');
    
    parallaxElements.forEach(element => {
      const speed = 0.5;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
  
  // Navbar background on scroll
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
      nav.classList.add('bg-gray-900/95');
      nav.classList.remove('bg-gray-900/80');
    } else {
      nav.classList.add('bg-gray-900/80');
      nav.classList.remove('bg-gray-900/95');
    }
  });
  
  // Form submission handler
  const contactForm = document.querySelector('.contact-form form');
  console.log('Contact form found:', contactForm);
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Form submission started...');
      
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      // Show loading state
      submitButton.textContent = 'Submitting...';
      submitButton.disabled = true;
      submitButton.style.opacity = '0.7';
      
      try {
        const formData = new FormData(this);
        
        // Simple validation
        const name = formData.get('name');
        const email = formData.get('email');
        const company = formData.get('company');
        const message = formData.get('message');
        
        console.log('Form data:', { name, email, company, message });
        
        if (!name || !email) {
          showNotification('Please fill in all required fields', 'error');
          return;
        }
        
        console.log('Sending to worker...');
        
        // Send to Cloudflare Worker
        const response = await fetch('https://wiityreplyform.hypefi.workers.dev/', {
          method: 'POST',
          body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (response.ok) {
          showNotification('Thank you! We\'ll contact you soon to schedule your demo.', 'success');
          this.reset();
        } else {
          throw new Error(result.error || 'Something went wrong');
        }
        
      } catch (error) {
        console.error('Form submission error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        showNotification('Sorry, there was an error submitting your request. Please try again.', 'error');
      } finally {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
      }
    });
  } else {
    console.error('Contact form not found! Check the selector.');
  }
  
  // Button hover effects
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });
  
  // Card hover effects
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Typing effect for hero title - temporarily disabled
  // const heroTitle = document.querySelector('h1');
  // if (heroTitle) {
  //   const text = heroTitle.innerHTML;
  //   heroTitle.innerHTML = '';
  //   
  //   let i = 0;
  //   const typeWriter = () => {
  //     if (i < text.length) {
  //       heroTitle.innerHTML += text.charAt(i);
  //       i++;
  //       setTimeout(typeWriter, 30);
  //     }
  //   };
  //   
  //   // Start typing effect after a short delay
  //   setTimeout(typeWriter, 800);
  // }
  
  // Add pulse animation to CTA buttons
  setInterval(() => {
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach(button => {
      button.classList.add('animate-pulse');
      setTimeout(() => {
        button.classList.remove('animate-pulse');
      }, 1000);
    });
  }, 5000);
});

// Notification function
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
    type === 'success' ? 'bg-primary-500 text-white' : 'bg-red-500 text-white'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add some interactive particles
function createParticles() {
  const particleContainer = document.createElement('div');
  particleContainer.className = 'fixed inset-0 pointer-events-none z-0';
  document.body.appendChild(particleContainer);
  
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-1 h-1 bg-primary-500/30 rounded-full animate-float';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 3 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    particleContainer.appendChild(particle);
  }
}

// Initialize particles
createParticles();

// Add mouse move effect to cards
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  });
});

// Add loading animation
window.addEventListener('load', function() {
  document.body.classList.add('loaded');
});

console.log('Modern Landing Page Loaded! 🚀');

// Test function for debugging form submission
window.testFormSubmission = async function() {
  console.log('Testing form submission...');
  
  const formData = new FormData();
  formData.append('name', 'Test User');
  formData.append('email', 'test@example.com');
  formData.append('company', 'Test Company');
  formData.append('message', 'Test message from browser');
  
  try {
    const response = await fetch('https://wiityreplyform.hypefi.workers.dev/', {
      method: 'POST',
      body: formData
    });
    
    console.log('Test response status:', response.status);
    const result = await response.json();
    console.log('Test response data:', result);
    
    return result;
  } catch (error) {
    console.error('Test error:', error);
    return error;
  }
};
