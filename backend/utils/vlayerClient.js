const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const VLAYER_API_URL = process.env.VLAYER_API_URL || 'http://localhost:3000';
const VLAYER_WS_URL = process.env.VLAYER_WS_URL || 'ws://localhost:3001';
const VLAYER_API_TOKEN = process.env.VLAYER_API_TOKEN;
const POLLING_INTERVAL = 5000; // 5 seconds
const WS_TIMEOUT = 60000; // 1 minute timeout
const MAX_POLLING_ATTEMPTS = 60; // 5 minutes with 5-second interval

// Create axios instance with auth header
const vlayerApi = axios.create({
  baseURL: VLAYER_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Add auth token if available
if (VLAYER_API_TOKEN) {
  vlayerApi.defaults.headers.common['Authorization'] = `Bearer ${VLAYER_API_TOKEN}`;
}

/**
 * Submit proof request to vlayer
 * @param {Object} params - Proof parameters
 * @param {string} params.address - Contract address
 * @param {Object} params.proverAbi - ABI of the prover contract
 * @param {string} params.functionName - Function name to prove
 * @param {Array} params.args - Function arguments
 * @param {number} params.chainId - Chain ID
 * @returns {Promise<string>} - Hash of the submitted proof
 */
const prove = async ({ address, proverAbi, functionName, args, chainId }) => {
  try {
    // Validate required parameters
    if (!address || !proverAbi || !functionName || !args || !chainId) {
      throw new Error('Missing required parameters for proof submission');
    }

    const response = await vlayerApi.post('/prove', {
      address,
      proverAbi,
      functionName,
      args,
      chainId
    });
    
    if (response.data && response.data.hash) {
      return response.data.hash;
    }
    
    throw new Error(response.data?.error || 'No hash returned from vlayer');
  } catch (error) {
    console.error('Error submitting proof to vlayer:', error.message);
    
    // Enhance error message with more details
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`VLayer API error (${error.response.status}): ${error.response.data?.error || error.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(`VLayer API connection error: ${error.message}`);
    } else {
      // Something happened in setting up the request
      throw error;
    }
  }
};

/**
 * Wait for proving result using WebSocket
 * @param {Object} params - Parameters
 * @param {string} params.hash - Proof hash
 * @returns {Promise<Object>} - Proof result
 */
const waitForProvingResultWS = ({ hash }) => {
  return new Promise((resolve, reject) => {
    let wsUrl = `${VLAYER_WS_URL}/proofs/${hash}`;
    
    // Add token to WebSocket URL if available
    if (VLAYER_API_TOKEN) {
      wsUrl += `?token=${VLAYER_API_TOKEN}`;
    }
    
    const ws = new WebSocket(wsUrl);
    let isResolved = false;
    
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }
    }, WS_TIMEOUT);
    
    ws.on('open', () => {
      console.log(`WebSocket connected for hash: ${hash}`);
    });
    
    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        
        // Check if result contains expected data
        if (result.status === 'completed' && result.proof) {
          clearTimeout(timeout);
          if (!isResolved) {
            isResolved = true;
            ws.close();
            resolve(result);
          }
        } else if (result.status === 'failed') {
          clearTimeout(timeout);
          if (!isResolved) {
            isResolved = true;
            ws.close();
            reject(new Error(result.error || 'Proof generation failed'));
          }
        }
        // If status is 'pending' or 'processing', keep waiting
      } catch (e) {
        clearTimeout(timeout);
        if (!isResolved) {
          isResolved = true;
          ws.close();
          reject(new Error(`Invalid WebSocket response: ${e.message}`));
        }
      }
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      if (!isResolved) {
        isResolved = true;
        ws.close();
        reject(new Error(`WebSocket error: ${error.message}`));
      }
    });
    
    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      if (!isResolved) {
        isResolved = true;
        reject(new Error(`WebSocket closed unexpectedly: ${code} ${reason}`));
      }
    });
  });
};

/**
 * Fallback to polling if WebSocket fails
 * @param {Object} params - Parameters
 * @param {string} params.hash - Proof hash
 * @returns {Promise<Object>} - Proof result
 */
const waitForProvingResultPolling = async ({ hash }) => {
  let attempts = 0;
  
  console.log(`Starting polling for proof result with hash: ${hash}`);
  
  while (attempts < MAX_POLLING_ATTEMPTS) {
    try {
      const response = await vlayerApi.get(`/proofs/${hash}`);
      
      console.log(`Polling attempt ${attempts + 1}: Status ${response.data?.status || 'unknown'}`);
      
      if (response.data && response.data.status === 'completed') {
        return response.data;
      } else if (response.data && response.data.status === 'failed') {
        throw new Error(response.data.error || 'Proof generation failed');
      }
      // If status is 'pending' or 'processing', continue polling
    } catch (error) {
      // Only ignore 404 errors (proof not found yet)
      if (!error.response || error.response.status !== 404) {
        throw new Error(`Polling error: ${error.message}`);
      }
    }
    
    // Wait before next polling attempt
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    attempts++;
  }
  
  throw new Error(`Proof generation timeout after ${MAX_POLLING_ATTEMPTS} attempts`);
};

/**
 * Try WebSocket first, fall back to polling
 * @param {Object} params - Parameters
 * @param {string} params.hash - Proof hash
 * @returns {Promise<Object>} - Proof result
 */
const waitForProvingResult = async ({ hash }) => {
  if (!hash) {
    throw new Error('Hash is required for waiting for proof result');
  }
  
  try {
    console.log(`Attempting to get proof result via WebSocket for hash: ${hash}`);
    return await waitForProvingResultWS({ hash });
  } catch (error) {
    console.warn(`WebSocket connection failed, falling back to polling: ${error.message}`);
    return await waitForProvingResultPolling({ hash });
  }
};

module.exports = {
  prove,
  waitForProvingResult
};
