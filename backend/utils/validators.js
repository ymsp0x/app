const ethers = require('ethers');

/**
 * Validates a Telegram ID
 * @param {string|number} telegramId - The Telegram ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
const validateTelegramId = (telegramId) => {
  if (!telegramId) return false;
  
  // Convert to string if it's a number
  const id = String(telegramId);
  
  // Telegram IDs are numeric and typically 9-10 digits
  return /^\d{5,15}$/.test(id);
};

/**
 * Validates an Ethereum wallet address
 * @param {string} address - The wallet address to validate
 * @returns {boolean} - Whether the address is valid
 */
const validateWalletAddress = (address) => {
  try {
    return ethers.isAddress(address);
  }
  catch (e) {
    return false;
  }