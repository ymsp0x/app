require('dotenv').config();
const https = require('https');

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL || "https://your-mini-app-url.com/twitter";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

function sendTelegramMessage(chat_id, text, reply_markup) {
  const payload = { chat_id, text, ...(reply_markup ? { reply_markup } : {}) };
  const data = JSON.stringify(payload);
  const req = https.request(
    `${TELEGRAM_API}/sendMessage`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
    (res) => { res.on("data", () => {}); }
  );
  req.on("error", (e) => { console.error(e); });
  req.write(data);
  req.end();
}

function getTelegramUpdates(offset = 0) {
  return new Promise((resolve, reject) => {
    https.get(`${TELEGRAM_API}/getUpdates?timeout=30&offset=${offset}`, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.result || []);
        } catch (err) { reject(err); }
      });
    }).on("error", reject);
  });
}

async function polling() {
  let lastUpdateId = 0;
  console.log("Telegram Bot polling started...");
  while (true) {
    try {
      const updates = await getTelegramUpdates(lastUpdateId + 1);
      for (const update of updates) {
        lastUpdateId = update.update_id;
        if (update.message && update.message.text) {
          const chat_id = update.message.chat.id;
          const text = update.message.text;
          if (text === "/start" || text === "/help") {
            sendTelegramMessage(chat_id,
              "Welcome to vlayer TwitterProof!\n\nClick the button below to submit your proof and mint your NFT.",
              {
                inline_keyboard: [[
                  { text: "🚀 Open Mini App", web_app: { url: MINI_APP_URL } }
                ]]
              }
            );
          } else {
            sendTelegramMessage(chat_id, "Use the 'Open Mini App' button to submit your proof & mint your NFT.");
          }
        }
      }
    } catch (e) {
      console.error("Polling error:", e);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

polling();
