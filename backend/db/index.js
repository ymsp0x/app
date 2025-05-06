const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'vlayer_app';
let db;

async function connect() {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to database');
  }
  return db;
}

async function getProof(telegram_id) {
  const database = await connect();
  return await database.collection('proofs').findOne({ telegram_id });
}

async function saveProof(telegram_id, data) {
  const database = await connect();
  return await database.collection('proofs').updateOne(
    { telegram_id },
    { $set: { ...data, telegram_id, updatedAt: new Date() } },
    { upsert: true }
  );
}

async function updateProofStatus(telegram_id, status, txHash = null, hash = null) {
  const database = await connect();
  const updateData = { status, updatedAt: new Date() };
  
  if (txHash) updateData.txHash = txHash;
  if (hash) updateData.hash = hash;
  
  return await database.collection('proofs').updateOne(
    { telegram_id },
    { $set: updateData }
  );
}

module.exports = {
  getProof,
  saveProof,
  updateProofStatus
};
