const { ethers } = require("ethers");
const db = require("../models/db");
const twitterNftAbi = require("../abis/TwitterNFTProof.json").abi;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const owner = new ethers.Wallet(process.env.PRIV_KEY, provider);
const twitterNft = new ethers.Contract(process.env.TWITTERNFTPROOF_ADDR, twitterNftAbi, owner);

exports.mintNFT = async ({ telegram_id, wallet, tokenURI }) => {
  const { status, proofData } = await db.getProof(telegram_id);
  if (status !== "verified") return { success: false, error: "Proof not verified" };
  let parsed;
  try {
    parsed = JSON.parse(proofData);
  } catch {
    return { success: false, error: "Invalid proof data" };
  }
  const zkproof = parsed.zkproof || parsed.proof || parsed;
  try {
    const tx = await twitterNft.mintWithTwitterProof(wallet, zkproof, tokenURI);
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (e) {
    return { success: false, error: e.reason || e.message };
  }
};
