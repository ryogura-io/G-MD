const fetch = require("node-fetch");

module.exports = async (sock, message) => {
    const chatId = message.key.remoteJid;

    try {
        let imageUrl;

        // 1️⃣ Try waifu.pics first
        try {
            const res = await fetch("https://api.waifu.pics/sfw/waifu");
            const data = await res.json();
            imageUrl = data?.url;
        } catch (err) {
            console.error("waifu.pics API failed, trying GiftedTech...");
        }

        // 2️⃣ Fallback → GiftedTech
        if (!imageUrl) {
            const res = await fetch("https://api.giftedtech.web.id/api/anime/waifu?apikey=gifted");
            const data = await res.json();
            imageUrl = data?.result;
        }

        if (!imageUrl) {
            await sock.sendMessage(chatId, { text: "❌ Could not fetch waifu image." }, { quoted: message });
            return;
        }

        // 3️⃣ Send Image with caption
        await sock.sendMessage(
            chatId,
            {
                image: { url: imageUrl },
                caption: "𝙶𝚄𝚁𝙰-𝙼𝙳"
            },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in waifu.js:", err);
        await sock.sendMessage(chatId, { text: "❌ Something went wrong with .waifu" }, { quoted: message });
    }
};
