/**
 * Landing Page Interactions
 * Minimal vanilla JS for scroll animations and smooth interactions
 * Total size: ~2KB (uncompressed)
 */

// Import cookie consent system
import cookieConsent from './cookie-consent.js';

// ============================================
// 0. DEBUG BORDERS TOGGLE
// ============================================


/**
 * Replay hero section animation
 */
function replayHeroAnimation() {
  const heroElements = document.querySelectorAll('.hero-line-1, .hero-line-2-inner, .hero-line-3, .section-1 p, .section-1 .actions .button, .comparison-image, .comparison-before, .comparison-after, .comparison-slider-divider, .comparison-label');

  heroElements.forEach(el => {
    // Remove animation
    el.style.animation = 'none';

    // Trigger reflow
    void el.offsetWidth;

    // Re-add animation
    el.style.animation = '';
  });

  // Note: Section 2 was removed from the design

  console.log('Hero animation replayed!');
}

// ============================================
// 0B. IMAGE COMPARISON SLIDER
// ============================================

/**
 * Initialize image comparison slider (before/after)
 * Allows dragging a divider to reveal the OCRed image
 */
function initImageComparisonSlider() {
  const slider = document.getElementById('hero-image-slider');
  if (!slider) return;

  const afterWrapper = slider.querySelector('.comparison-after-wrapper');
  const beforeLabelWrapper = slider.querySelector('.comparison-before-label-wrapper');
  const divider = slider.querySelector('.comparison-slider-divider');
  const beforeImage = slider.querySelector('.comparison-before');

  if (!afterWrapper || !beforeLabelWrapper || !divider || !beforeImage) return;

  let isDragging = false;
  let heightTimeouts = []; // Store timeout IDs for cleanup
  let resetTimeout = null; // Auto-reset to center after inactivity
  const RESET_DELAY = 10000; // 10 seconds

  /**
   * Set divider height to match image height
   */
  function setDividerHeight() {
    const rect = beforeImage.getBoundingClientRect();
    const imageHeight = rect.height;

    if (imageHeight > 0) {
      console.log('Setting divider height to:', imageHeight);
      // Set the slider container height to match the image exactly
      slider.style.height = `${imageHeight}px`;
      // Now divider and afterWrapper will use 100% of the container
      divider.style.height = '100%';
      afterWrapper.style.height = '100%';
    }
  }

  // Set height after image loads
  if (beforeImage.complete) {
    requestAnimationFrame(() => {
      setDividerHeight();
      // Double check after layout is complete
      heightTimeouts.push(setTimeout(setDividerHeight, 100));
      heightTimeouts.push(setTimeout(setDividerHeight, 4100)); // After fade-in and before wiggle
    });
  } else {
    beforeImage.addEventListener('load', () => {
      requestAnimationFrame(() => {
        setDividerHeight();
        heightTimeouts.push(setTimeout(setDividerHeight, 100));
      });
    });
  }

  // Update on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setDividerHeight, 100);
  });

  // Cleanup function
  slider.addEventListener('remove', () => {
    heightTimeouts.forEach(timeout => clearTimeout(timeout));
    clearTimeout(resizeTimeout);
  });

  /**
   * Update slider position based on percentage (0-100)
   */
  function updateSliderPosition(percentage) {
    // Clamp between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));

    // Update clip-path to show that percentage of the after image (left side)
    const rightClip = 100 - percentage;
    afterWrapper.style.webkitClipPath = `inset(0 ${rightClip}% 0 0)`;
    afterWrapper.style.clipPath = `inset(0 ${rightClip}% 0 0)`;

    // Update clip-path for the before label (right side) - inverse of after
    beforeLabelWrapper.style.webkitClipPath = `inset(0 0 0 ${percentage}%)`;
    beforeLabelWrapper.style.clipPath = `inset(0 0 0 ${percentage}%)`;

    // Update divider position
    divider.style.left = `${percentage}%`;

    // Update aria value for accessibility
    divider.setAttribute('aria-valuenow', Math.round(percentage));
  }

  /**
   * Get slider position from mouse/touch event
   */
  function getSliderPercentage(clientX) {
    const rect = beforeImage.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }

  /**
   * Reset slider to center with smooth animation
   */
  function resetToCenter() {
    // Enable smooth transition for reset
    afterWrapper.style.transition = 'clip-path 400ms ease-out';
    beforeLabelWrapper.style.transition = 'clip-path 400ms ease-out';
    divider.style.transition = 'left 400ms ease-out';

    updateSliderPosition(50);

    // Remove transition after animation completes
    setTimeout(() => {
      afterWrapper.style.transition = '';
      beforeLabelWrapper.style.transition = '';
      divider.style.transition = '';
    }, 400);
  }

  /**
   * Schedule auto-reset to center
   */
  function scheduleReset() {
    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(resetToCenter, RESET_DELAY);
  }

  /**
   * Start dragging
   */
  function startDrag(e) {
    // Cancel any pending reset
    if (resetTimeout) clearTimeout(resetTimeout);

    isDragging = true;
    slider.classList.add('is-dragging');

    // Disable transitions and animations during drag for smooth interaction
    afterWrapper.style.transition = 'none';
    afterWrapper.style.animation = 'none';
    divider.style.animation = 'none';
    beforeLabelWrapper.style.transition = 'none';

    // Prevent text selection
    e.preventDefault();

    // Update position immediately
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateSliderPosition(getSliderPercentage(clientX));
  }

  /**
   * During drag
   */
  function onDrag(e) {
    if (!isDragging) return;

    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateSliderPosition(getSliderPercentage(clientX));
  }

  /**
   * Stop dragging
   */
  function stopDrag() {
    if (!isDragging) return;

    isDragging = false;
    slider.classList.remove('is-dragging');

    // Re-enable transition
    afterWrapper.style.transition = '';
    beforeLabelWrapper.style.transition = '';

    // Schedule auto-reset to center
    scheduleReset();
  }

  // Mouse events - only on image area
  beforeImage.addEventListener('mousedown', startDrag);
  divider.addEventListener('mousedown', startDrag);

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);

  // Touch events - only on image area
  beforeImage.addEventListener('touchstart', startDrag, { passive: false });
  divider.addEventListener('touchstart', startDrag, { passive: false });

  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);
  document.addEventListener('touchcancel', stopDrag);

  // Keyboard navigation
  divider.addEventListener('keydown', (e) => {
    let currentValue = parseFloat(divider.getAttribute('aria-valuenow')) || 50;
    let handled = false;

    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        updateSliderPosition(currentValue - 2);
        handled = true;
        break;
      case 'ArrowRight':
        e.preventDefault();
        updateSliderPosition(currentValue + 2);
        handled = true;
        break;
      case 'Home':
        e.preventDefault();
        updateSliderPosition(0);
        handled = true;
        break;
      case 'End':
        e.preventDefault();
        updateSliderPosition(100);
        handled = true;
        break;
    }

    // Schedule reset after keyboard interaction
    if (handled) scheduleReset();
  });

  // Set initial position (50%)
  updateSliderPosition(50);

  console.log('Image comparison slider initialized');
}

/**
 * Initialize output comparison sliders (same structure as hero slider)
 * Allows sliding between original scan and extracted output
 */
function initOutputComparisonSliders() {
  const sliders = document.querySelectorAll('.output-slider');

  sliders.forEach(slider => {
    const afterWrapper = slider.querySelector('.comparison-after-wrapper');
    const beforeLabelWrapper = slider.querySelector('.comparison-before-label-wrapper');
    const divider = slider.querySelector('.comparison-slider-divider');
    const beforePanel = slider.querySelector('.comparison-before');

    if (!afterWrapper || !beforeLabelWrapper || !divider || !beforePanel) return;

    let isDragging = false;
    let resetTimeout = null;
    const RESET_DELAY = 10000; // 10 seconds

    function updateSliderPosition(percentage) {
      percentage = Math.max(0, Math.min(100, percentage));

      const rightClip = 100 - percentage;
      afterWrapper.style.webkitClipPath = `inset(0 ${rightClip}% 0 0)`;
      afterWrapper.style.clipPath = `inset(0 ${rightClip}% 0 0)`;

      beforeLabelWrapper.style.webkitClipPath = `inset(0 0 0 ${percentage}%)`;
      beforeLabelWrapper.style.clipPath = `inset(0 0 0 ${percentage}%)`;

      divider.style.left = `${percentage}%`;
      divider.setAttribute('aria-valuenow', Math.round(percentage));
    }

    // Use beforePanel for position calculation (matches hero)
    function getSliderPercentage(clientX) {
      const rect = beforePanel.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(100, (x / rect.width) * 100));
    }

    function resetToCenter() {
      // Enable smooth transition for reset
      afterWrapper.style.transition = 'clip-path 400ms ease-out';
      beforeLabelWrapper.style.transition = 'clip-path 400ms ease-out';
      divider.style.transition = 'left 400ms ease-out';

      updateSliderPosition(50);

      // Remove transition after animation completes
      setTimeout(() => {
        afterWrapper.style.transition = '';
        beforeLabelWrapper.style.transition = '';
        divider.style.transition = '';
      }, 400);
    }

    function scheduleReset() {
      if (resetTimeout) clearTimeout(resetTimeout);
      resetTimeout = setTimeout(resetToCenter, RESET_DELAY);
    }

    // Match hero's startDrag exactly
    function startDrag(e) {
      // Cancel any pending reset
      if (resetTimeout) clearTimeout(resetTimeout);

      isDragging = true;
      slider.classList.add('is-dragging');

      // Disable transitions and animations during drag (matches hero)
      afterWrapper.style.transition = 'none';
      afterWrapper.style.animation = 'none';
      divider.style.animation = 'none';
      beforeLabelWrapper.style.transition = 'none';

      e.preventDefault();

      // Immediate update on click
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateSliderPosition(getSliderPercentage(clientX));
    }

    // Match hero's onDrag exactly (no rAF)
    function onDrag(e) {
      if (!isDragging) return;

      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateSliderPosition(getSliderPercentage(clientX));
    }

    // Match hero's stopDrag exactly
    function stopDrag() {
      if (!isDragging) return;

      isDragging = false;
      slider.classList.remove('is-dragging');

      // Re-enable transition (matches hero)
      afterWrapper.style.transition = '';
      beforeLabelWrapper.style.transition = '';

      // Schedule auto-reset to center
      scheduleReset();
    }

    // Mouse events
    beforePanel.addEventListener('mousedown', startDrag);
    divider.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);

    // Touch events
    beforePanel.addEventListener('touchstart', startDrag, { passive: false });
    divider.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchcancel', stopDrag);

    // Set initial position (50%)
    updateSliderPosition(50);
  });

  console.log('Output comparison sliders initialized:', sliders.length);
}

// ============================================
// 1. SCROLL REVEAL ANIMATIONS
// ============================================

/**
 * Initialize Intersection Observer for scroll animations
 * Watches elements with .animate-on-scroll class and adds .is-visible when in viewport
 */
function initScrollAnimations() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // If reduced motion is preferred, show all elements immediately
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  // Create Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optional: stop observing after animation (performance optimization)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Start animation slightly before element enters viewport
    }
  );

  // Observe all elements with animation class
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Section 2 functionality was removed (section doesn't exist in current design)

// ============================================
// 2. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

/**
 * Add smooth scrolling behavior to anchor links
 * Already handled by CSS scroll-behavior: smooth, but this provides fallback
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Don't prevent default for empty hash
      if (href === '#') return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        // Use native smooth scroll if supported
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without jumping
        history.pushState(null, '', href);

        // Focus target for accessibility
        target.focus({ preventScroll: true });
      }
    });
  });
}

// ============================================
// 3. HEADER SCROLL BEHAVIOR (Optional)
// ============================================

/**
 * Add scroll-based header styling (uncomment if you add a fixed header)
 */
/*
function initHeaderScroll() {
  const header = document.querySelector('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}
*/

// ============================================
// 4. SECTION SCROLL ANIMATIONS
// ============================================

/**
 * Initialize scroll animations for sections
 */
function initSectionAnimations() {
  console.log('=== initSectionAnimations CALLED ===');

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  console.log('Prefers reduced motion:', prefersReducedMotion);

  if (prefersReducedMotion) {
    // If reduced motion is preferred, show all sections immediately
    document.querySelectorAll('.section-3, .section-4, .section-5, .section-7').forEach(section => {
      section.classList.add('section-visible');
    });
    return;
  }

  // Get all sections but DON'T add section-visible to any initially
  // Let them all start hidden and animate in on a slight delay
  const sections = document.querySelectorAll('.section-3, .section-4, .section-5, .section-7');
  console.log('Found sections:', sections.length);

  // Small delay to allow CSS to initialize, then trigger animations for visible sections
  setTimeout(() => {
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const isInViewport = rect.top < (window.innerHeight * 0.8);

      console.log(`Section ${index} (${section.className}):`, {
        top: rect.top,
        threshold: window.innerHeight * 0.8,
        isInViewport
      });

      if (isInViewport) {
        // Section is in viewport, animate it in
        section.classList.add('section-visible');
        console.log('-> Animating in (was in viewport)');
      } else {
        console.log('-> Will animate on scroll');
      }
    });
  }, 100);

  // Create Intersection Observer for sections
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('section-visible')) {
          console.log('Section entering view:', entry.target.className);
          entry.target.classList.add('section-visible');
          console.log('Added section-visible class to:', entry.target.className);
          // Stop observing after animation
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    }
  );

  // Observe all sections
  sections.forEach(section => {
    sectionObserver.observe(section);
  });
}

// ============================================
// 5. TAB INTERFACE (Three Outputs section)
// ============================================

/**
 * Initialize tab switching for output tabs (horizontal tabs)
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn-horizontal');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');

      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      button.classList.add('active');

      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      // Show the selected tab content
      const targetContent = document.querySelector(`[data-tab-content="${tabName}"]`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/**
 * Initialize pricing tab switching (Monthly/Yearly)
 */
function initPricingTabs() {
  const pricingTabHeaders = document.querySelectorAll('.pricing-tab-header');

  pricingTabHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const tabName = header.getAttribute('data-pricing-tab');

      // Remove active class from all headers
      pricingTabHeaders.forEach(h => h.classList.remove('active'));

      // Add active class to clicked header
      header.classList.add('active');

      // Hide all pricing tab contents
      document.querySelectorAll('.pricing-tab-content').forEach(content => {
        content.classList.remove('active');
      });

      // Show the selected pricing tab content
      const targetContent = document.querySelector(`[data-pricing-tab-content="${tabName}"]`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// ============================================
// 5. FORM HANDLING (Basic example)
// ============================================

/**
 * Basic form validation and handling
 * Extend this based on your needs
 */
function initFormHandling() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Basic validation example
      const email = data.email;
      if (email && !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }

      // Here you would send data to your backend
      console.log('Form submitted:', data);
      showNotification('Thanks for signing up!', 'success');
      form.reset();
    });
  });
}

/**
 * Simple email validation
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Show notification to user (non-blocking toast)
 */
function showNotification(message, type = 'info') {
  // Log to console
  console.log(`[${type}] ${message}`);

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'success' ? '#A0E000' : type === 'error' ? '#ff4444' : '#333'};
    color: ${type === 'success' ? '#000' : '#fff'};
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideInUp 0.3s ease;
    max-width: 400px;
    font-family: 'Roboto', sans-serif;
  `;

  document.body.appendChild(toast);

  // Remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// ============================================
// 5. LAZY LOADING OPTIMIZATION
// ============================================

/**
 * Enhance native lazy loading with IntersectionObserver fallback
 */
function initLazyLoading() {
  // Check for native lazy loading support
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    return;
  }

  // Fallback for older browsers
  const images = document.querySelectorAll('img[loading="lazy"]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// ============================================
// 6. PERFORMANCE MONITORING (Optional)
// ============================================

/**
 * Log performance metrics (development only)
 */
function logPerformanceMetrics() {
  if (!('performance' in window)) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];

      if (perfData) {
        console.log('Performance Metrics:');
        console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
        console.log(`Page Load: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        console.log(`Total Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
      }

      // Log page weight
      const resources = performance.getEntriesByType('resource');
      const totalSize = resources.reduce((acc, resource) => {
        return acc + (resource.transferSize || 0);
      }, 0);

      console.log(`Total Page Size: ${(totalSize / 1024).toFixed(2)} KB`);
    }, 0);
  });
}

// ============================================
// 7. INITIALIZE EVERYTHING
// ============================================

/**
 * Initialize debug mode toggle
 */
function initDebugToggle() {
  // Start with debug mode OFF (hide debug borders)
  document.body.classList.add('hide-debug');

  // Set up keyboard listener for 'b' key
  document.addEventListener('keydown', (e) => {
    // Don't trigger if user is typing in an input field
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    // Toggle debug mode with 'b' key
    if ((e.key === 'b' || e.key === 'B') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      document.body.classList.toggle('hide-debug');
      const debugActive = !document.body.classList.contains('hide-debug');
      console.log(`Debug mode ${debugActive ? 'ON' : 'OFF'}`);
      showNotification(`Debug mode ${debugActive ? 'ON' : 'OFF'}`, 'info');
    }

    // Clear cookie consent with 'c' key (for testing)
    if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      localStorage.removeItem('prism-cookie-consent-v5');
      console.log('Cookie consent cleared - reload page to see banner');
      showNotification('Cookie consent cleared - reload page', 'info');
    }

    // Show current cookie preferences with 'p' key (for testing)
    if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      const prefs = localStorage.getItem('prism-cookie-consent-v5');
      if (prefs) {
        console.log('Current cookie preferences:', JSON.parse(prefs));
        showNotification(`Cookies: ${prefs}`, 'info');
      } else {
        console.log('No cookie preferences set');
        showNotification('No cookie preferences set', 'info');
      }
    }

    // Replay hero animation with 'r' key
    if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      replayHeroAnimation();
      showNotification('Hero animation replayed', 'info');
    }
  });

  console.log('Debug toggle initialized');
}

/**
 * Simple Cookie Consent Implementation
 */
function initCookieConsent() {
  const CONSENT_KEY = 'prism-cookie-consent-v6';

  // Check if already consented
  const hasConsent = localStorage.getItem(CONSENT_KEY);
  const alreadyConsented = hasConsent && hasConsent !== 'cleared';

  if (alreadyConsented) {
    console.log('Cookie consent already given:', hasConsent);
  }

  // Create banner HTML (always create so modal is available for footer link)
  const banner = document.createElement('div');
  banner.id = 'simple-cookie-banner';
  banner.innerHTML = `
    <style>
      #simple-cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #f3f0e7;
        border-top: 1px solid #d4d0c5;
        padding: 20px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: 'NiveauGroteskRegular', -apple-system, sans-serif;
        animation: slideUp 0.3s ease-out;
      }
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      #simple-cookie-banner .cookie-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        flex-wrap: wrap;
      }
      #simple-cookie-banner.banner-dismissed {
        position: fixed;
        pointer-events: none;
        background: transparent;
        border: none;
        padding: 0;
        box-shadow: none;
      }
      #simple-cookie-banner.banner-dismissed .cookie-inner {
        display: none;
      }
      #simple-cookie-banner.banner-dismissed #cookie-settings-modal {
        pointer-events: all;
      }
      #simple-cookie-banner .cookie-text {
        flex: 1;
        min-width: 300px;
      }
      #simple-cookie-banner .cookie-text h3 {
        margin: 0 0 5px 0;
        font-size: 18px;
        color: #1a1a1a;
      }
      #simple-cookie-banner .cookie-text p {
        margin: 0;
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      }
      #simple-cookie-banner .cookie-buttons {
        display: flex;
        gap: 10px;
      }
      #simple-cookie-banner button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s;
      }
      #simple-cookie-banner .btn-accept {
        background: #A0E000;
        color: #000;
      }
      #simple-cookie-banner .btn-accept:hover {
        background: #8BC800;
        transform: translateY(-1px);
      }
      #simple-cookie-banner .btn-reject,
      #simple-cookie-banner .btn-settings {
        background: transparent;
        color: #666;
        border: 1px solid #d4d0c5;
      }
      #simple-cookie-banner .btn-reject:hover,
      #simple-cookie-banner .btn-settings:hover {
        background: #fff;
        border-color: #aeaa97;
      }

      /* Settings Modal */
      #cookie-settings-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        animation: fadeIn 0.2s ease-out;
      }
      #cookie-settings-modal.show {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      #cookie-settings-modal .modal-content {
        background: #f3f0e7;
        border-radius: 8px;
        padding: 30px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      }
      #cookie-settings-modal h2 {
        margin: 0 0 20px 0;
        font-size: 24px;
        color: #1a1a1a;
      }
      #cookie-settings-modal .cookie-option {
        padding: 15px 0;
        border-bottom: 1px solid #d4d0c5;
      }
      #cookie-settings-modal .cookie-option:last-of-type {
        border-bottom: none;
      }
      #cookie-settings-modal .cookie-option label {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        cursor: pointer;
      }
      #cookie-settings-modal .cookie-option input[type="checkbox"] {
        margin-top: 3px;
        cursor: pointer;
        width: 18px;
        height: 18px;
      }
      #cookie-settings-modal .cookie-option input[type="checkbox"]:disabled {
        cursor: not-allowed;
      }
      #cookie-settings-modal .cookie-info {
        flex: 1;
      }
      #cookie-settings-modal .cookie-name {
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 4px;
      }
      #cookie-settings-modal .cookie-desc {
        font-size: 13px;
        color: #666;
        line-height: 1.4;
      }
      #cookie-settings-modal .modal-buttons {
        margin-top: 25px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      #cookie-settings-modal .modal-buttons button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s;
      }
      #cookie-settings-modal .btn-save {
        background: #A0E000;
        color: #000;
      }
      #cookie-settings-modal .btn-save:hover {
        background: #8BC800;
      }
      #cookie-settings-modal .btn-cancel {
        background: transparent;
        color: #666;
        border: 1px solid #d4d0c5;
      }
      #cookie-settings-modal .btn-cancel:hover {
        background: #fff;
        border-color: #aeaa97;
      }

      @media (max-width: 768px) {
        #simple-cookie-banner .cookie-inner {
          flex-direction: column;
          text-align: center;
        }
        #simple-cookie-banner .cookie-buttons {
          width: 100%;
          justify-content: center;
        }
        #cookie-settings-modal .modal-content {
          padding: 20px;
        }
      }
    </style>
    <div class="cookie-inner">
      <div class="cookie-text">
        <h3>🍪 We use cookies</h3>
        <p>We use cookies to enhance your browsing experience. Manage your preferences or accept all cookies.</p>
      </div>
      <div class="cookie-buttons">
        <button class="btn-reject">Reject All</button>
        <button class="btn-settings">Manage Settings</button>
        <button class="btn-accept">Accept All</button>
      </div>
    </div>

    <!-- Settings Modal -->
    <div id="cookie-settings-modal">
      <div class="modal-content">
        <h2>Cookie Settings</h2>
        <div class="cookie-option">
          <label>
            <input type="checkbox" id="cookie-essential" checked disabled>
            <div class="cookie-info">
              <div class="cookie-name">Essential Cookies</div>
              <div class="cookie-desc">Required for the website to function properly. These cannot be disabled.</div>
            </div>
          </label>
        </div>
        <div class="cookie-option">
          <label>
            <input type="checkbox" id="cookie-analytics">
            <div class="cookie-info">
              <div class="cookie-name">Analytics Cookies</div>
              <div class="cookie-desc">Help us understand how visitors use our website to improve your experience.</div>
            </div>
          </label>
        </div>
        <div class="cookie-option">
          <label>
            <input type="checkbox" id="cookie-marketing">
            <div class="cookie-info">
              <div class="cookie-name">Marketing Cookies</div>
              <div class="cookie-desc">Used to deliver personalized advertisements relevant to your interests.</div>
            </div>
          </label>
        </div>
        <div class="modal-buttons">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-save">Save Preferences</button>
        </div>
      </div>
    </div>
  `;

  // Add to page
  document.body.appendChild(banner);

  // If already consented, hide banner but keep modal available
  if (alreadyConsented) {
    banner.classList.add('banner-dismissed');
  }

  const modal = banner.querySelector('#cookie-settings-modal');

  // Handle accept all
  banner.querySelector('.btn-accept').addEventListener('click', () => {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    banner.style.animation = 'slideUp 0.3s ease-out reverse';
    setTimeout(() => banner.classList.add('banner-dismissed'), 300);
    console.log('All cookies accepted');
  });

  // Handle reject all
  banner.querySelector('.btn-reject').addEventListener('click', () => {
    const preferences = {
      essential: true,
      analytics: false,
      marketing: false
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    banner.style.animation = 'slideUp 0.3s ease-out reverse';
    setTimeout(() => banner.classList.add('banner-dismissed'), 300);
    console.log('Non-essential cookies rejected');
  });

  // Handle settings button
  banner.querySelector('.btn-settings').addEventListener('click', () => {
    modal.classList.add('show');
  });

  // Handle modal cancel
  banner.querySelector('.btn-cancel').addEventListener('click', () => {
    modal.classList.remove('show');
  });

  // Handle modal save
  banner.querySelector('.btn-save').addEventListener('click', () => {
    const preferences = {
      essential: true,
      analytics: banner.querySelector('#cookie-analytics').checked,
      marketing: banner.querySelector('#cookie-marketing').checked
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    modal.classList.remove('show');
    banner.style.animation = 'slideUp 0.3s ease-out reverse';
    setTimeout(() => banner.classList.add('banner-dismissed'), 300);
    console.log('Cookie preferences saved:', preferences);
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });

  // Handle footer cookie settings link
  const footerLink = document.getElementById('footer-cookie-settings');
  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      banner.style.display = '';
      modal.classList.add('show');
    });
  }
}

/**
 * Main initialization function
 * Called when DOM is ready
 */
function init() {
  console.log('Initializing landing page...');

  // Initialize simple cookie consent
  initCookieConsent();

  // Debug toggle (always enabled)
  initDebugToggle();

  // Image comparison slider (hero section)
  initImageComparisonSlider();

  // Output comparison sliders (same as hero, for output tabs)
  initOutputComparisonSliders();

  // Core features
  initScrollAnimations();
  initSectionAnimations();
  initSmoothScroll();
  // initLazyLoading(); // TODO: Implement if needed
  initTabs();
  initPricingTabs();

  // Optional features (uncomment as needed)
  // initHeaderScroll();
  initFormHandling();
  initContactModal();
  initTermsModal();

  // Development only
  // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  //   logPerformanceMetrics(); // TODO: Implement if needed
  // }

  console.log('Landing page ready!');
}

// ============================================
// 7B. CONTACT FORM MODAL
// ============================================

/**
 * Initialize contact form modal
 * Opens when clicking footer contact link, closes on overlay/close button click
 */
function initContactModal() {
  const modal = document.getElementById('contact-modal');
  const contactLinks = document.querySelectorAll('a[href="#contact"]');
  const closeBtn = document.getElementById('contact-modal-close');
  const overlay = modal?.querySelector('.contact-modal__overlay');
  const form = document.getElementById('contact-form');

  if (!modal) {
    console.warn('Contact modal not found');
    return;
  }

  /**
   * Get scrollbar width for compensation
   */
  function getScrollbarWidth() {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  /**
   * Open the modal
   */
  function openModal(e) {
    e.preventDefault();
    modal.classList.add('contact-modal--visible');

    // Prevent background scroll with scrollbar compensation
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Focus first input for accessibility
    setTimeout(() => {
      const firstInput = modal.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 100);

    console.log('Contact modal opened');
  }

  /**
   * Close the modal
   */
  function closeModal() {
    modal.classList.remove('contact-modal--visible');
    document.body.style.overflow = ''; // Restore scroll
    document.body.style.paddingRight = ''; // Remove scrollbar compensation
    console.log('Contact modal closed');
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Handle form submission
   */
  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: escapeHtml(formData.get('name') || ''),
      email: escapeHtml(formData.get('email') || ''),
      message: escapeHtml(formData.get('message') || '')
    };

    console.log('Contact form submitted:', data);

    // TODO: Send data to backend API
    // Show non-blocking success message
    showNotification(`Thank you! We'll get back to you soon.`, 'success');
    console.log(`Form data received - Name: ${data.name}, Email: ${data.email}`);

    // Reset form and close modal
    form.reset();
    closeModal();
  }

  // Attach event listeners
  contactLinks.forEach(link => {
    link.addEventListener('click', openModal);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  console.log('Contact modal initialized');
}

// ============================================
// 7C. TERMS OF SERVICE MODAL
// ============================================

/**
 * Initialize terms of service modal
 * Opens when clicking footer terms link, closes on overlay/close button click
 */
function initTermsModal() {
  const modal = document.getElementById('terms-modal');
  const termsLink = document.querySelector('a[href="/terms.html"]');
  const closeBtn = document.getElementById('terms-modal-close');
  const overlay = modal?.querySelector('.legal-modal__overlay');

  if (!modal) {
    console.warn('Terms modal not found');
    return;
  }

  /**
   * Get scrollbar width for compensation
   */
  function getScrollbarWidth() {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  /**
   * Open the modal
   */
  function openModal(e) {
    e.preventDefault();
    modal.classList.add('legal-modal--visible');

    // Prevent background scroll with scrollbar compensation
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Scroll to top of modal content
    const content = modal.querySelector('.legal-modal__content');
    if (content) content.scrollTop = 0;

    console.log('Terms modal opened');
  }

  /**
   * Close the modal
   */
  function closeModal() {
    modal.classList.remove('legal-modal--visible');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    console.log('Terms modal closed');
  }

  // Attach event listeners
  if (termsLink) {
    termsLink.addEventListener('click', openModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('legal-modal--visible')) {
      closeModal();
    }
  });

  console.log('Terms modal initialized');
}

// ============================================
// 8. START THE APP
// ============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}

// Export for potential use in other scripts
export { initScrollAnimations, initSectionAnimations, initSmoothScroll, initTabs, initPricingTabs, initFormHandling, initImageComparisonSlider, initOutputComparisonSliders, initContactModal, initTermsModal };
