const { verifyInitData } = require('../services/telegramService');
const { ValidationError } = require('../utils/errorHandler');

/**
 * Middleware to authenticate Telegram Mini App requests
 */
const telegramAuthMiddleware = (req, res, next) => {
  try {
    // Get initData from request headers
    const initData = req.headers['x-telegram-init-data'];
    
    if (!initData) {
      throw new ValidationError('Missing Telegram authentication data');
    }
    
    // Verify and extract user data
    const userData = verifyInitData(initData);
    
    // Attach user data to request object
    req.telegramUser = userData;
    
    next();
  } catch (error) {
    next(new ValidationError('Invalid Telegram authentication: ' + error.message));
  }
};

module.exports = telegramAuthMiddleware;
