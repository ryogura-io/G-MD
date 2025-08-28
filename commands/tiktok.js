const fetch = require("node-fetch");

async function tiktokCommand(sock, chatId, message, type = "video") {
    // Extract user input after command
    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        "";

    const url = text.split(" ").slice(1).join(" ").trim();

    if (!url) {
        await sock.sendMessage(
            chatId,
            { text: `🎬 Please provide a TikTok link!\nExample: \`.${type === "video" ? "tiktok" : "tiktoka"} https://vm.tiktok.com/... \`` },
            { quoted: message }
        );
        return;
    }

    try {
        const res = await fetch(
            `https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(url)}`
        );
        const data = await res.json();

        if (!data.success || !data.tiktok) {
            throw new Error("TikTok API failed.");
        }

        const { description, author, statistics, video, music } = data.tiktok;

        // send video
        if (type === "video") {
            await sock.sendMessage(
                chatId,
                {
                    video: { url: video },
                    mimetype: "video/mp4",
                    caption: `🎬 *TikTok Video*\n\n👤 *User:* ${author?.nickname || "Unknown"}\n📝 *Description:* ${description || "No description"}\n❤️ ${statistics?.likeCount || 0} | 💬 ${statistics?.commentCount || 0} | 🔄 ${statistics?.shareCount || 0}`
                },
                { quoted: message }
            );
        }

        // send audio
        if (type === "audio") {
            if (!music) throw new Error("No audio available.");
            await sock.sendMessage(
                chatId,
                {
                    audio: { url: music },
                    mimetype: "audio/mpeg",
                    fileName: "tiktok_audio.mp3",
                    ptt: false
                },
                { quoted: message }
            );
        }

    } catch (err) {
        console.error("Error in tiktokCommand:", err.message);
        await sock.sendMessage(
            chatId,
            { text: "❌ Could not fetch TikTok content. Try again later." },
            { quoted: message }
        );
    }
}

module.exports = { tiktokCommand };
