const { TwitterDL } = require("twitter-downloader");

module.exports = async (sock, chatId, message) => {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const url = text.split(" ").slice(1).join(" ").trim();

    if (!url) {
        return sock.sendMessage(chatId, { text: "❌ Please provide a Twitter/X post link!" }, { quoted: message });
    }

    try {
        const res = await TwitterDL(url);

        if (!res || res.status !== "success" || !res.result?.media?.length) {
            return sock.sendMessage(chatId, { text: "❌ Could not extract media from the link." }, { quoted: message });
        }

        for (const media of res.result.media) {
            if (!media.url) continue;

            if (media.type === "video") {
                await sock.sendMessage(chatId, { video: { url: media.url.toString() }, caption: `▶ Downloaded video from Twitter \n> *𝙶𝚄𝚁𝙰-𝙼𝙳*` }, { quoted: message });
            } else if (media.type === "photo") {
                await sock.sendMessage(chatId, { image: { url: media.url.toString() }, caption: `🖼 Twitter image \n> *𝙶𝚄𝚁𝙰-𝙼𝙳*` }, { quoted: message });
            }
        }
    } catch (err) {
        console.error("Twitter DL error:", err);
        await sock.sendMessage(chatId, { text: "❌ Error downloading media. The link may not be supported." }, { quoted: message });
    }
};
