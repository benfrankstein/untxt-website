/**
 * PRISM Cookie Consent System
 * 2025 GDPR/ePrivacy compliant cookie consent management
 * Vanilla JS, no dependencies
 */

// ============================================
// 1. CONFIGURATION
// ============================================

const COOKIE_CONFIG = {
  storageKey: 'prism-cookie-consent',
  version: '3.0.0', // Force reset of all old consent data
  expiryDays: 365,
  categories: {
    essential: {
      name: 'Essential',
      description: 'Required for the website to function. Cannot be disabled.',
      required: true
    },
    analytics: {
      name: 'Analytics',
      description: 'Help us understand how visitors use our site to improve it.',
      required: false
    },
    marketing: {
      name: 'Marketing',
      description: 'Used to track visitors across websites for advertising.',
      required: false
    }
  }
};

// ============================================
// 2. STATE MANAGEMENT
// ============================================

class CookieConsent {
  constructor() {
    this.preferences = this.loadPreferences();
    this.banner = null;
    this.modal = null;
  }

  /**
   * Load saved preferences from localStorage
   */
  loadPreferences() {
    try {
      const stored = localStorage.getItem(COOKIE_CONFIG.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Check if version matches - invalidate old consent if not
        if (!parsed.version || parsed.version !== COOKIE_CONFIG.version) {
          console.log('Cookie consent version mismatch - clearing old consent');
          localStorage.removeItem(COOKIE_CONFIG.storageKey);
          return null;
        }

        // Check if consent is still valid (not expired)
        const consentDate = new Date(parsed.timestamp);
        const expiryDate = new Date(consentDate);
        expiryDate.setDate(expiryDate.getDate() + COOKIE_CONFIG.expiryDays);

        if (new Date() < expiryDate) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load cookie preferences:', e);
    }
    return null;
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences(preferences) {
    const data = {
      version: COOKIE_CONFIG.version, // Include version to track updates
      timestamp: new Date().toISOString(),
      essential: true, // Always true
      analytics: preferences.analytics || false,
      marketing: preferences.marketing || false
    };

    try {
      localStorage.setItem(COOKIE_CONFIG.storageKey, JSON.stringify(data));
      this.preferences = data;
      return true;
    } catch (e) {
      console.error('Failed to save cookie preferences:', e);
      return false;
    }
  }

  /**
   * Check if user has made a choice
   */
  hasConsent() {
    return this.preferences !== null;
  }

  /**
   * Check if specific category is allowed
   */
  isAllowed(category) {
    if (!this.preferences) return false;
    return this.preferences[category] === true;
  }

  /**
   * Accept all cookies
   */
  acceptAll() {
    this.savePreferences({
      analytics: true,
      marketing: true
    });
    this.applyConsent();
    this.hideBanner();
  }

  /**
   * Reject all non-essential cookies
   */
  rejectAll() {
    this.savePreferences({
      analytics: false,
      marketing: false
    });
    this.applyConsent();
    this.hideBanner();
  }

  /**
   * Save custom preferences from modal
   */
  saveCustom(preferences) {
    this.savePreferences(preferences);
    this.applyConsent();
    this.hideModal();
    this.hideBanner();
  }

  /**
   * Apply consent by loading/blocking scripts
   */
  applyConsent() {
    // Block/unblock analytics scripts
    if (this.isAllowed('analytics')) {
      this.loadAnalytics();
    } else {
      this.blockAnalytics();
    }

    // Block/unblock marketing scripts
    if (this.isAllowed('marketing')) {
      this.loadMarketing();
    } else {
      this.blockMarketing();
    }

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: this.preferences
    }));
  }

  /**
   * Load analytics scripts (Google Analytics, etc.)
   */
  loadAnalytics() {
    // Example: Google Analytics
    // Uncomment and modify when you add analytics
    /*
    if (!window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID';
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'YOUR-GA-ID');
    }
    */
    console.log('Analytics enabled');
  }

  /**
   * Block analytics scripts
   */
  blockAnalytics() {
    // Clear analytics cookies if they exist
    console.log('Analytics disabled');
  }

  /**
   * Load marketing scripts (Facebook Pixel, Google Ads, etc.)
   */
  loadMarketing() {
    // Example: Facebook Pixel
    // Uncomment and modify when you add marketing tracking
    /*
    if (!window.fbq) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', 'YOUR-PIXEL-ID');
      fbq('track', 'PageView');
    }
    */
    console.log('Marketing enabled');
  }

  /**
   * Block marketing scripts
   */
  blockMarketing() {
    // Clear marketing cookies if they exist
    console.log('Marketing disabled');
  }

  /**
   * Show the banner
   */
  showBanner() {
    if (this.banner) {
      this.banner.style.display = ''; // Remove any inline display style
      this.banner.classList.add('cookie-banner--visible');
      console.log('Cookie banner shown');
    }
  }

  /**
   * Hide the banner
   */
  hideBanner() {
    if (this.banner) {
      this.banner.classList.remove('cookie-banner--visible');
      console.log('Cookie banner hidden');
      // Force hide with inline style as fallback
      setTimeout(() => {
        if (this.banner && !this.banner.classList.contains('cookie-banner--visible')) {
          this.banner.style.display = 'none';
        }
      }, 300); // Wait for animation to complete
    }
  }

  /**
   * Show the settings modal
   */
  showModal() {
    if (this.modal) {
      this.modal.classList.add('cookie-modal--visible');
      // Set focus on modal for accessibility
      setTimeout(() => {
        const firstCheckbox = this.modal.querySelector('input[type="checkbox"]:not(:disabled)');
        if (firstCheckbox) firstCheckbox.focus();
      }, 100);
    }
  }

  /**
   * Hide the settings modal
   */
  hideModal() {
    if (this.modal) {
      this.modal.classList.remove('cookie-modal--visible');
    }
  }

  /**
   * Initialize the cookie consent system
   */
  init() {
    console.log('Initializing cookie consent...');

    this.banner = document.getElementById('cookie-banner');
    this.modal = document.getElementById('cookie-modal');

    if (!this.banner) {
      console.error('Cookie banner element not found! Check if HTML is loaded.');
      // If banner HTML is missing, clear any old consent data
      localStorage.removeItem(COOKIE_CONFIG.storageKey);
      this.preferences = null;
      return;
    }

    console.log('Cookie banner element found:', this.banner);

    // Set up event listeners
    this.setupEventListeners();

    // Re-check preferences after potential cleanup
    this.preferences = this.loadPreferences();
    console.log('Loaded preferences:', this.preferences);

    // Check if user has already consented
    if (this.hasConsent()) {
      console.log('User has existing consent, not showing banner');
      // Apply existing consent
      this.applyConsent();
    } else {
      console.log('No consent found, showing banner');
      // Show banner immediately for new users
      this.showBanner();
    }
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Accept All button
    const acceptBtn = document.getElementById('cookie-accept-all');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.acceptAll());
    }

    // Reject All button
    const rejectBtn = document.getElementById('cookie-reject-all');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => this.rejectAll());
    }

    // Settings button (opens modal)
    const settingsBtn = document.getElementById('cookie-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showModal());
    }

    // Modal close button
    const modalCloseBtn = document.getElementById('cookie-modal-close');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.hideModal());
    }

    // Modal save button
    const modalSaveBtn = document.getElementById('cookie-modal-save');
    if (modalSaveBtn) {
      modalSaveBtn.addEventListener('click', () => {
        const analyticsCheckbox = document.getElementById('cookie-cat-analytics');
        const marketingCheckbox = document.getElementById('cookie-cat-marketing');

        this.saveCustom({
          analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
          marketing: marketingCheckbox ? marketingCheckbox.checked : false
        });
      });
    }

    // Modal reject all button
    const modalRejectBtn = document.getElementById('cookie-modal-reject');
    if (modalRejectBtn) {
      modalRejectBtn.addEventListener('click', () => {
        this.rejectAll();
        this.hideModal();
      });
    }

    // Footer "Cookie Settings" link
    const footerSettingsLink = document.getElementById('footer-cookie-settings');
    if (footerSettingsLink) {
      footerSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showBanner();
      });
    }

    // Keyboard accessibility
    this.setupKeyboardNav();
  }

  /**
   * Set up keyboard navigation
   */
  setupKeyboardNav() {
    // ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideModal();
      }
    });

    // Trap focus in modal when open
    if (this.modal) {
      this.modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && this.modal.classList.contains('cookie-modal--visible')) {
          const focusableElements = this.modal.querySelectorAll(
            'button, input, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    }
  }
}

// ============================================
// 3. INITIALIZE
// ============================================

// Create global instance
window.cookieConsent = new CookieConsent();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent.init();
  });
} else {
  // DOM is already loaded
  window.cookieConsent.init();
}

// Export for potential use in other scripts
export default window.cookieConsent;
