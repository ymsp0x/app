import axios from 'axios';
import { getInitData } from '../utils/telegramApp';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Telegram authentication to requests
api.interceptors.request.use(config => {
  const initData = getInitData();
  
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  
  return config;
});

// API functions
export const submitProof = async (proofData) => {
  try {
    const response = await api.post('/proof/submit', { proofData });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getProofStatus = async () => {
  try {
    const response = await api.get('/proof/status');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const mintNFT = async (wallet, tokenURI) => {
  try {
    const response = await api.post('/mint', { wallet, tokenURI });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};
