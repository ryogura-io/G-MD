// commands/quote.js
const axios = require("axios");

async function quoteCommand(sock, chatId, message) {
    try {
        // fetch from API
        const res = await axios.get("https://api.giftedtech.web.id/api/fun/quotes?apikey=gifted");

        if (!res.data || !res.data.success) {
            throw new Error("API returned no success");
        }

        const quote = res.data.result;

        // reply with the quote
        await sock.sendMessage(
            chatId,
            { text: `💡 *Quote of the Moment:*\n\n"${quote}"` },
            { quoted: message }
        );
    } catch (err) {
        console.error("Error in quoteCommand:", err.message);
        await sock.sendMessage(
            chatId,
            { text: "❌ Failed to fetch a quote. Try again later." },
            { quoted: message }
        );
    }
}

module.exports = quoteCommand;
