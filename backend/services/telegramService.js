const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to a Telegram user
 * @param {string} chatId - The chat ID to send the message to
 * @param {string} text - The message text
 * @param {Object} options - Additional options for the message
 * @returns {Promise<Object>} - The Telegram API response
 */
const sendMessage = async (chatId, text, options = {}) => {
  try {
    const response = await axios.post(`${API_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
};

/**
 * Verify Telegram initData to authenticate user
 * @param {string} initData - The initData from Telegram WebApp
 * @returns {Object} - The parsed and verified user data
 */
const verifyInitData = (initData) => {
  // Implementation of the verification algorithm
  // See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
  
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  // Sort params alphabetically
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Verify hash using HMAC-SHA-256
  const crypto = require('crypto');
  const secretKey = crypto.createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();
  
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(sortedParams)
    .digest('hex');
  
  if (calculatedHash !== hash) {
    throw new Error('Invalid Telegram initData');
  }
  
  // Parse and return user data
  const userData = {
    telegram_id: params.get('id') || params.get('user')?.id,
    username: params.get('username') || params.get('user')?.username,
    first_name: params.get('first_name') || params.get('user')?.first_name,
    last_name: params.get('last_name') || params.get('user')?.last_name,
    auth_date: params.get('auth_date')
  };
  
  return userData;
};

module.exports = {
  sendMessage,
  verifyInitData
};
