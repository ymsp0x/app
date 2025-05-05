require("dotenv").config();
const express = require("express");
const cors = require("cors");
const proofService = require("./services/proofService");
const mintService = require("./services/mintService");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/twitterproof/submit", async (req, res) => {
  const { telegram_id, proofData } = req.body;
  const result = await proofService.submitProof({ telegram_id, proofData });
  res.json(result);
});

app.get("/api/twitterproof/status", async (req, res) => {
  const { telegram_id } = req.query;
  const status = await proofService.getProofStatus(telegram_id);
  res.json({ status });
});

app.post("/api/mint", async (req, res) => {
  const { telegram_id, wallet, tokenURI } = req.body;
  const result = await mintService.mintNFT({ telegram_id, wallet, tokenURI });
  res.json(result);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Backend started on port", PORT);
});
