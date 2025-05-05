const { Vlayer } = require("@vlayer/sdk");
const vlayer = new Vlayer({
  token: process.env.VLAYER_API_TOKEN,
  baseURL: process.env.VLAYER_API_URL || "https://api.vlayer.xyz",
});
const db = require("../models/db");

exports.submitProof = async ({ telegram_id, proofData }) => {
  let parsed;
  try {
    parsed = typeof proofData === "string" ? JSON.parse(proofData) : proofData;
  } catch {
    return { status: "error", error: "Invalid proof JSON" };
  }

  try {
    const result = await vlayer.verifyProof(parsed);
    if (result.verified) {
      await db.saveProof(telegram_id, { status: "verified", proofData });
      return { status: "verified" };
    }
    await db.saveProof(telegram_id, { status: "invalid", proofData });
    return { status: "invalid" };
  } catch (e) {
    await db.saveProof(telegram_id, { status: "error", proofData });
    return { status: "error", error: e.message || "Verification failed" };
  }
};

exports.getProofStatus = async (telegram_id) => {
  const data = await db.getProof(telegram_id);
  return data?.status || "none";
};
