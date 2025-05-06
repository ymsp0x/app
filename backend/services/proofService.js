const db = require('../db');
const vlayer = require('../utils/vlayerClient');

const submitProof = async ({ telegram_id, proofData }) => {
  let parsed;
  try {
    // Parse proofData from frontend (WebProof JSON string)
    parsed = typeof proofData === "string" ? JSON.parse(proofData) : proofData;
  } catch {
    return { status: "error", error: "Invalid proof JSON" };
  }

  // Validate required fields
  const { address, proverAbi, functionName, args, chainId } = parsed;
  if (!address || !proverAbi || !functionName || !args || !chainId) {
    return { status: "error", error: "Proof data not complete" };
  }

  try {
    // Save initial proof status
    await db.saveProof(telegram_id, { 
      status: "pending", 
      proofData: JSON.stringify(parsed),
      submittedAt: new Date().toISOString()
    });

    // Trigger proving process in vlayer
    const hash = await vlayer.prove({
      address,
      proverAbi,
      functionName,
      args,
      chainId,
    });

    // Update status to processing with hash
    await db.updateProofStatus(telegram_id, "processing", null, hash);

    // Wait for proof result from vlayer
    const proveResult = await vlayer.waitForProvingResult({ hash });

    // Save final proof result
    if (proveResult && proveResult.proof) {
      await db.saveProof(telegram_id, { 
        status: "verified", 
        proofData: JSON.stringify(proveResult.proof),
        verifiedAt: new Date().toISOString()
      });
      return { status: "verified" };
    } else {
      await db.saveProof(telegram_id, { status: "invalid", proofData });
      return { status: "invalid" };
    }
  } catch (e) {
    await db.saveProof(telegram_id, { status: "error", proofData });
    return { status: "error", error: e.message || "Verification failed" };
  }
};

const getProofStatus = async (telegram_id) => {
  const data = await db.getProof(telegram_id);
  return data?.status || "none";
};

const getProofDetails = async (telegram_id) => {
  return await db.getProof(telegram_id);
};

module.exports = {
  submitProof,
  getProofStatus,
  getProofDetails
};