// Telegram Web App Configuration
// This file configures the Telegram Mini App behavior

window.Telegram = window.Telegram || {};

// Initialize Telegram Web App
(function() {
  'use strict';

  // Check if running in Telegram
  if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    const tg = Telegram.WebApp;
    
    // Initialize the app
    tg.ready();
    
    // Expand to full height
    tg.expand();
    
    // Set theme
    if (tg.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Configure main button
    tg.MainButton.setText('BUY NOW');
    tg.MainButton.color = '#D6FF57';
    tg.MainButton.textColor = '#001826';
    
    // Configure back button
    tg.BackButton.onClick(() => {
      // Handle back button click
      if (window.history.length > 1) {
        window.history.back();
      } else {
        tg.close();
      }
    });
    
    // Set up viewport
    tg.setViewportHeight(tg.viewportHeight);
    
    // Handle theme changes
    tg.onEvent('themeChanged', () => {
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
    
    // Handle viewport changes
    tg.onEvent('viewportChanged', () => {
      tg.setViewportHeight(tg.viewportHeight);
    });
    
    // Handle main button clicks
    tg.MainButton.onClick(() => {
      // Trigger purchase flow
      const event = new CustomEvent('telegramMainButtonClick');
      document.dispatchEvent(event);
    });
    
    // Log successful initialization
    console.log('Telegram Web App initialized successfully');
    console.log('User:', tg.initDataUnsafe?.user);
    console.log('Theme:', tg.colorScheme);
    console.log('Platform:', tg.platform);
    
  } else {
    console.log('Not running in Telegram - using demo mode');
    
    // Create mock Telegram object for development
    window.Telegram = {
      WebApp: {
        ready: () => console.log('Mock: Telegram WebApp ready'),
        expand: () => console.log('Mock: Telegram WebApp expanded'),
        initDataUnsafe: {
          user: {
            id: 123456789,
            first_name: 'Demo',
            last_name: 'User',
            username: 'demo_user',
            language_code: 'en'
          }
        },
        colorScheme: 'dark',
        platform: 'web',
        viewportHeight: window.innerHeight,
        MainButton: {
          setText: (text) => console.log('Mock: MainButton text set to', text),
          setColor: (color) => console.log('Mock: MainButton color set to', color),
          setTextColor: (color) => console.log('Mock: MainButton text color set to', color),
          show: () => console.log('Mock: MainButton shown'),
          hide: () => console.log('Mock: MainButton hidden'),
          onClick: (callback) => console.log('Mock: MainButton click handler set'),
          isVisible: false
        },
        BackButton: {
          show: () => console.log('Mock: BackButton shown'),
          hide: () => console.log('Mock: BackButton hidden'),
          onClick: (callback) => console.log('Mock: BackButton click handler set'),
          isVisible: false
        },
        onEvent: (event, callback) => console.log('Mock: Event handler set for', event),
        setViewportHeight: (height) => console.log('Mock: Viewport height set to', height),
        showPopup: (options) => console.log('Mock: Popup shown with', options),
        showAlert: (message) => alert(message),
        showConfirm: (message, callback) => {
          const result = confirm(message);
          if (callback) callback(result);
        },
        close: () => console.log('Mock: App closed'),
        sendData: (data) => console.log('Mock: Data sent to bot:', data),
        requestWriteAccess: (callback) => {
          console.log('Mock: Write access requested');
          if (callback) callback(true);
        },
        hasWriteAccess: false
      }
    };
  }
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.Telegram;
}
