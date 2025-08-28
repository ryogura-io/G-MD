const fetch = require("node-fetch");

async function tinyCommand(sock, chatId, message) {
    // extract user text after .tiny
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const url = text.split(" ").slice(1).join(" ").trim();

    if (!url) {
        await sock.sendMessage(chatId, { text: "🔗 Please provide a URL to shorten!\nExample: `.tiny https://example.com`" }, { quoted: message });
        return;
    }

    try {
        const res = await fetch(`https://api.giftedtech.web.id/api/tools/tinyurl?apikey=gifted&url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (!data.success || !data.result) {
            throw new Error("TinyURL API failed.");
        }

        await sock.sendMessage(
            chatId,
            {
                text: `✅ *URL Shortened Successfully!*\n\n🔗 Original: ${url}\n👉 Short: ${data.result}`
            },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in tinyCommand:", err.message);
        await sock.sendMessage(chatId, { text: "❌ Could not shorten the URL. Try again later." }, { quoted: message });
    }
}

module.exports = tinyCommand;
