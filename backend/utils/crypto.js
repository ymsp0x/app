/**
 * Validates and formats a private key
 * @param {string} privateKey - The private key to validate
 * @returns {string} - The validated private key
 */
const getValidPrivateKey = (privateKey) => {
    if (!privateKey) {
      throw new Error('Private key is required');
    }
  
    // Remove '0x' prefix if present
    let cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Check if key is valid (64 hex characters)
    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
      throw new Error('Invalid private key format');
    }
    
    return cleanKey;
  };
  
  module.exports = {
    getValidPrivateKey
  };
  