// Utility functions
const helpers = {
  // Format API response
  formatResponse: (success, data = null, message = '') => {
    return {
      success,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  },

  // Sanitize user data (remove sensitive fields)
  sanitizeUser: (user) => {
    if (!user) return null;
    
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  },

  // Generate random string for tokens
  generateRandomString: (length = 32) => {
    return require('crypto').randomBytes(length).toString('hex');
  },

  // Parse JSON safely with default value
  safeJsonParse: (str, defaultValue = null) => {
    if (typeof str !== 'string') return str || defaultValue;
    
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  },

  // Stringify JSON safely
  safeJsonStringify: (obj, defaultValue = null) => {
    try {
      return JSON.stringify(obj);
    } catch {
      return defaultValue;
    }
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format duration in milliseconds to human readable
  formatDuration: (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  },

  // Truncate string with ellipsis
  truncateString: (str, length = 100) => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  // Clean object (remove null/undefined properties)
  cleanObject: (obj) => {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    return cleaned;
  }
};

module.exports = helpers;