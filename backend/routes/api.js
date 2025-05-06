const express = require('express');
const router = express.Router();
const proofService = require('../services/proofService');
const mintService = require('../services/mintService');
const { validateWalletAddress } = require('../utils/validators');
const { asyncHandler } = require('../utils/errorHandler');
const telegramAuthMiddleware = require('../middleware/telegramAuth');

// Public endpoints
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected endpoints with Telegram authentication
router.use(telegramAuthMiddleware);

// Submit proof
router.post('/proof/submit', asyncHandler(async (req, res) => {
  const { proofData } = req.body;
  const { telegram_id } = req.telegramUser;
  
  if (!proofData) {
    return res.status(400).json({ error: 'Proof data is required' });
  }
  
  const result = await proofService.submitProof({ telegram_id, proofData });
  res.json(result);
}));

// Get proof status
router.get('/proof/status', asyncHandler(async (req, res) => {
  const { telegram_id } = req.telegramUser;
  const status = await proofService.getProofStatus(telegram_id);
  res.json(status);
}));

// Get proof details
router.get('/proof/details', asyncHandler(async (req, res) => {
  const { telegram_id } = req.telegramUser;
  const details = await proofService.getProofDetails(telegram_id);
  
  if (!details) {
    return res.status(404).json({ error: 'Proof not found' });
  }
  
  res.json(details);
}));

// Mint NFT
router.post('/mint', asyncHandler(async (req, res) => {
  const { wallet, tokenURI } = req.body;
  const { telegram_id } = req.telegramUser;
  
  if (!wallet || !validateWalletAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  
  const result = await mintService.mintNFT({ telegram_id, wallet, tokenURI });
  res.json(result);
}));

module.exports = router;
