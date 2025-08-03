// Language Router for WittyReply Landing Page
// This handles /ar and /fr URLs and redirects to the appropriate language files

document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;
  
  // Handle Arabic route
  if (currentPath === '/ar' || currentPath === '/ar/') {
    window.location.href = '/ar.html';
    return;
  }
  
  // Handle French route
  if (currentPath === '/fr' || currentPath === '/fr/') {
    window.location.href = '/fr.html';
    return;
  }
  
  // Handle root route - redirect to English version
  if (currentPath === '/' || currentPath === '') {
    window.location.href = '/index.html';
    return;
  }
});

// Add language switcher functionality
function switchLanguage(lang) {
  switch(lang) {
    case 'en':
      window.location.href = '/index.html';
      break;
    case 'ar':
      window.location.href = '/ar.html';
      break;
    case 'fr':
      window.location.href = '/fr.html';
      break;
  }
}

// Export for use in other scripts
window.switchLanguage = switchLanguage; 