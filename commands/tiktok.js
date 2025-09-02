const fetch = require("node-fetch");

async function tiktokCommand(sock, chatId, message) {
    try {
        // extract text like .tiktok <url>
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text.split(" ").slice(1).join(" ").trim();

        if (!url) {
            return sock.sendMessage(chatId, { text: "❌ Please provide a TikTok link." }, { quoted: message });
        }

        let videoUrl, captionText, dreadedData;

        // Use dreaded API first
        const dreadedRes = await fetch(`https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(url)}`);
        dreadedData = await dreadedRes.json();
        console.log("🔥 Dreaded response:", dreadedData);

        if (dreadedData?.success && dreadedData?.tiktok?.video) {
            videoUrl = dreadedData.tiktok.video;
            captionText = `🎶 TikTok Video\n\n📝 ${dreadedData.tiktok.description || ""}\n👤 ${dreadedData.tiktok.author?.nickname || "Unknown"}`;
        }

        // If dreaded failed, fallback to GiftedTech
        if (!videoUrl) {
            const giftedRes = await fetch(`https://api.giftedtech.web.id/api/download/tiktokdlv4?apikey=gifted&url=${encodeURIComponent(url)}`);
            const giftedData = await giftedRes.json();
            console.log("🔥 GiftedTech response:", giftedData);

            if (giftedData?.success && giftedData?.result) {
                videoUrl = giftedData.result.video_no_watermark || giftedData.result.videoUrl || giftedData.result.video;
                captionText = `🎶 TikTok Video\n\n📝 ${giftedData.result.desc || ""}`;
            }
        }

        if (!videoUrl) {
            return sock.sendMessage(chatId, { text: "❌ Could not fetch TikTok video." }, { quoted: message });
        }

        // ✅ Download video into buffer ONCE
        const videoRes = await fetch(videoUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
                "Referer": "https://www.tiktok.com/"
            },
            redirect: "follow"
        });

        if (!videoRes.ok) {
            console.error("❌ Failed to fetch video:", videoRes.status, videoRes.statusText);
            return sock.sendMessage(chatId, { text: "⚠️ Video URL expired or blocked." }, { quoted: message });
        }

        const videoBuffer = await videoRes.buffer();
        console.log("✅ TikTok video buffer size:", videoBuffer.length);

        if (videoBuffer.length === 0) {
            return sock.sendMessage(chatId, { text: "⚠️ Downloaded video is empty." }, { quoted: message });
        }

        // Send TikTok video
        await sock.sendMessage(
            chatId,
            {
                video: videoBuffer,
                mimetype: "video/mp4",
                fileName: "tiktok.mp4",
                caption: captionText || "🎶 TikTok Video",
                contextInfo: {
                    externalAdReply: {
                        title: "TikTok Downloader",
                        body: "Powered by 𝙶𝚄𝚁𝙰-𝙼𝙳",
                        thumbnailUrl: dreadedData?.tiktok?.author?.avatar || "",
                        sourceUrl: url,
                        mediaType: 2,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in tiktokCommand:", err);
        await sock.sendMessage(chatId, { text: "❌ Error processing TikTok command." }, { quoted: message });
    }
}

module.exports = tiktokCommand;
