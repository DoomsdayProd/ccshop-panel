// Telegram Web App utilities
export class TelegramWebApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isInitialized = false;
    this.user = null;
    this.init();
  }

  init() {
    if (!this.tg) {
      console.warn('Telegram WebApp not available');
      return;
    }

    try {
      this.tg.ready();
      this.tg.expand();
      
      // Get user info
      if (this.tg.initDataUnsafe?.user) {
        this.user = this.tg.initDataUnsafe.user;
      }
      
      // Set theme
      if (this.tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      
      // Set main button if needed
      this.tg.MainButton.setText('BUY NOW');
      this.tg.MainButton.color = '#D6FF57';
      this.tg.MainButton.textColor = '#001826';
      
      this.isInitialized = true;
      console.log('Telegram WebApp initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
    }
  }

  // Show main button
  showMainButton(text = 'BUY NOW', callback) {
    if (!this.tg) return;
    
    this.tg.MainButton.setText(text);
    if (callback) {
      this.tg.MainButton.onClick(callback);
    }
    this.tg.MainButton.show();
  }

  // Hide main button
  hideMainButton() {
    if (!this.tg) return;
    this.tg.MainButton.hide();
  }

  // Show back button
  showBackButton(callback) {
    if (!this.tg) return;
    
    this.tg.BackButton.onClick(callback);
    this.tg.BackButton.show();
  }

  // Hide back button
  hideBackButton() {
    if (!this.tg) return;
    this.tg.BackButton.hide();
  }

  // Show popup
  showPopup(title, message, buttons = []) {
    if (!this.tg) return;
    
    this.tg.showPopup({
      title,
      message,
      buttons: buttons.map(btn => ({
        id: btn.id || 'default',
        type: btn.type || 'default',
        text: btn.text
      }))
    });
  }

  // Show alert
  showAlert(message) {
    if (!this.tg) return;
    this.tg.showAlert(message);
  }

  // Show confirm
  showConfirm(message, callback) {
    if (!this.tg) return;
    this.tg.showConfirm(message, callback);
  }

  // Get user data
  getUser() {
    return this.user;
  }

  // Check if running in Telegram
  isTelegram() {
    return !!this.tg;
  }

  // Get theme
  getTheme() {
    return this.tg?.colorScheme || 'light';
  }

  // Get viewport height
  getViewportHeight() {
    return this.tg?.viewportHeight || window.innerHeight;
  }

  // Get platform
  getPlatform() {
    return this.tg?.platform || 'unknown';
  }

  // Close app
  close() {
    if (!this.tg) return;
    this.tg.close();
  }

  // Send data to bot
  sendData(data) {
    if (!this.tg) return;
    this.tg.sendData(JSON.stringify(data));
  }

  // Request write access
  requestWriteAccess(callback) {
    if (!this.tg) return;
    this.tg.requestWriteAccess(callback);
  }

  // Check write access
  hasWriteAccess() {
    return this.tg?.hasWriteAccess || false;
  }
}

// Create global instance
export const telegramApp = new TelegramWebApp();

// Export for use in components
export default telegramApp;
