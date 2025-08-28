// commands/fancy.js
const axios = require("axios");

async function fancyCommand(sock, chatId, message, text) {
    try {
        if (!text) {
            return await sock.sendMessage(
                chatId,
                { text: "⚠️ Please provide some text!\nExample: *.fancy Gifted Tech*" },
                { quoted: message }
            );
        }

        // fetch from API
        const res = await axios.get(
            `https://api.giftedtech.web.id/api/tools/fancy?apikey=gifted&text=${encodeURIComponent(text)}`
        );

        if (!res.data || !res.data.success) {
            throw new Error("API returned no success");
        }

        const fancyList = res.data.results;

        // format response
        let replyText = `✨ *Fancy Text Styles for:* ${text}\n\n`;
        fancyList.forEach((style, i) => {
            replyText += `*${i + 1}. ${style.name}:*\n${style.result}\n\n`;
        });

        // reply
        await sock.sendMessage(
            chatId,
            { text: replyText.trim() },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in fancyCommand:", err.message);
        await sock.sendMessage(
            chatId,
            { text: "❌ Failed to generate fancy text. Try again later." },
            { quoted: message }
        );
    }
}

module.exports = fancyCommand;
