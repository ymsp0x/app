// Simple in-memory "database" (replace with persistent DB for production)
const store = {};

exports.saveProof = async (telegram_id, data) => {
  store[telegram_id] = data;
};
exports.getProof = async (telegram_id) => {
  return store[telegram_id] || null;
};
