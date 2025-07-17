// Security Configuration for Semantic-Logic AI Workflow Builder
// Implements "Bring Your Own Key" (BYOK) model

export const SECURITY_CONFIG = {
  // API Key Management
  API_KEY_STORAGE: {
    // Never store API keys in database
    STORAGE_TYPE: 'session', // localStorage or sessionStorage only
    ENCRYPTION: true, // Encrypt keys in browser storage
    AUTO_CLEAR: true, // Clear on window close
  },
  
  // Database Security
  DATABASE: {
    BIND_LOCALHOST_ONLY: true,
    NO_API_KEYS_STORED: true,
    SESSION_DATA_ONLY: true,
  },
  
  // Frontend Security
  CLIENT_SIDE: {
    ENCRYPT_API_KEYS: true,
    CLEAR_ON_LOGOUT: true,
    NO_CONSOLE_LOGGING: true,
  }
};

// API Key Management Functions
export class SecureKeyManager {
  static ENCRYPTION_KEY = 'semantic-workflow-secure';
  
  // Store API key securely in session storage only
  static storeApiKey(provider, apiKey) {
    if (!apiKey) return;
    
    const encrypted = this.encrypt(apiKey);
    sessionStorage.setItem(`api_key_${provider}`, encrypted);
    
    // Clear from any other storage
    localStorage.removeItem(`api_key_${provider}`);
  }
  
  // Retrieve API key from session storage
  static getApiKey(provider) {
    const encrypted = sessionStorage.getItem(`api_key_${provider}`);
    if (!encrypted) return null;
    
    return this.decrypt(encrypted);
  }
  
  // Clear all API keys (on logout/session end)
  static clearAllKeys() {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('api_key_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  // Simple encryption for browser storage (not for production)
  static encrypt(text) {
    return btoa(text); // Base64 encoding (replace with proper encryption)
  }
  
  static decrypt(encoded) {
    return atob(encoded); // Base64 decoding (replace with proper decryption)
  }
}

// Session Security
export const SESSION_SECURITY = {
  // Clear API keys when window closes
  setupSessionClearance() {
    window.addEventListener('beforeunload', () => {
      SecureKeyManager.clearAllKeys();
    });
    
    // Clear on visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Optional: Clear keys when tab is hidden
        // SecureKeyManager.clearAllKeys();
      }
    });
  }
};
