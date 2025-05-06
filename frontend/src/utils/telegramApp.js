/**
 * Telegram Web App utilities
 */

// Check if running in Telegram Web App
export const isTelegramWebApp = () => {
    return window.Telegram && window.Telegram.WebApp;
  };
  
  // Initialize Telegram Web App
  export const initTelegramWebApp = () => {
    if (!isTelegramWebApp()) {
      console.warn('Not running in Telegram Web App');
      return null;
    }
    
    const webApp = window.Telegram.WebApp;
    
    // Expand to full height
    webApp.expand();
    
    // Set app ready
    webApp.ready();
    
    return webApp;
  };
  
  // Get Telegram user data
  export const getTelegramUser = () => {
    if (!isTelegramWebApp()) {
      return null;
    }
    
    const webApp = window.Telegram.WebApp;
    return webApp.initDataUnsafe?.user || null;
  };
  
  // Get init data for API authentication
  export const getInitData = () => {
    if (!isTelegramWebApp()) {
      return null;
    }
    
    return window.Telegram.WebApp.initData;
  };
  
  // Show confirmation dialog
  export const showConfirm = (message) => {
    if (!isTelegramWebApp()) {
      return Promise.resolve(window.confirm(message));
    }
    
    return window.Telegram.WebApp.showConfirm(message);
  };
  
  // Show alert
  export const showAlert = (message) => {
    if (!isTelegramWebApp()) {
      return window.alert(message);
    }
    
    return window.Telegram.WebApp.showAlert(message);
  };
  
  // Close the Web App
  export const closeApp = () => {
    if (isTelegramWebApp()) {
      window.Telegram.WebApp.close();
    }
  };
  
  // Set main button
  export const setMainButton = (text, onClick, isActive = true) => {
    if (!isTelegramWebApp()) {
      return null;
    }
    
    const mainButton = window.Telegram.WebApp.MainButton;
    
    mainButton.setText(text);
    
    if (isActive) {
      mainButton.show();
      mainButton.enable();
    } else {
      mainButton.hide();
      mainButton.disable();
    }
    
    mainButton.onClick(onClick);
    
    return mainButton;
  };
  