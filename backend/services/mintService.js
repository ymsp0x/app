const ethers = require('ethers');
const twitterNftAbiJson = require('../contracts/TwitterNFTProof.json');
const db = require('../db');
const { getValidPrivateKey } = require('../utils/crypto');

// Initialize provider and wallet once
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const privKey = getValidPrivateKey(process.env.PRIV_KEY);
const owner = new ethers.Wallet(privKey, provider);
const twitterNft = new ethers.Contract(
  process.env.TWITTERNFTPROOF_ADDR,
  twitterNftAbiJson.abi,
  owner
);

const mintNFT = async ({ telegram_id, wallet, tokenURI }) => {
  try {
    const proofRecord = await db.getProof(telegram_id);
    if (!proofRecord || proofRecord.status !== "verified") {
      return { success: false, error: "Proof not verified" };
    }

    let parsed;
    try {
      parsed = typeof proofRecord.proofData === "string"
        ? JSON.parse(proofRecord.proofData)
        : proofRecord.proofData;
    } catch {
      return { success: false, error: "Invalid proof data" };
    }

    // Extract zkproof in the format expected by the contract
    const zkproof = parsed.zkproof || parsed.proof || parsed;

    const tx = await twitterNft.mintWithTwitterProof(wallet, zkproof, tokenURI);
    await tx.wait();

    // Update proof status to "minted" in database
    await db.updateProofStatus(telegram_id, "minted", tx.hash);
    
    return { success: true, txHash: tx.hash };
  } catch (e) {
    return {
      success: false,
      error: e?.reason || e?.message || e?.toString() || "Unknown error"
    };
  }
};

module.exports = {
  mintNFT
};