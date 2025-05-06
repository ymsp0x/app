// Simple in-memory "database" (replace with persistent DB for production)
const store = {};

const saveProof = async (telegram_id, data) => {
  store[telegram_id] = data;
};
const getProof = async (telegram_id) => {
  return store[telegram_id] || null;
};

export default { saveProof, getProof };
