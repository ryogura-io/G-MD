// googleImageCommand.js
const fetch = require("node-fetch");
// googleImageCommand.js
const axios = require("axios");

async function googleImageCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const query = text.split(" ").slice(1).join(" ").trim();

        if (!query) {
            return sock.sendMessage(chatId, { text: "❌ Please provide a search query.\nExample: `.img brown dog`" }, { quoted: message });
        }

        // 🔹 Make API call
        const { data } = await axios.get("https://api.giftedtech.web.id/api/search/googleimage", {
            params: {
                apikey: "gifted",
                query: query
            },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json"
            }
        });

        if (!data?.success || !data?.results || data.results.length === 0) {
            return sock.sendMessage(chatId, { text: "⚠️ No images found." }, { quoted: message });
        }

        // Pick random image
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const imageUrl = data.results[randomIndex];

        // Send image
        await sock.sendMessage(
            chatId,
            {
                image: { url: imageUrl },
                caption: `🔍 Google Image Result for: *${query}*`
            },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in googleImageCommand:", err?.response?.data || err.message);
        await sock.sendMessage(chatId, { text: "❌ Error fetching image search result." }, { quoted: message });
    }
}

module.exports = googleImageCommand;
