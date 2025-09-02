const fetch = require("node-fetch");

async function spotifyCommand(sock, chatId, message) {
    // extract user text after .spotify
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const url = text.split(" ").slice(1).join(" ").trim();

    if (!url) {
        await sock.sendMessage(
            chatId,
            { text: "🎵 Please provide a Spotify track link!\nExample: `.spotify https://open.spotify.com/track/2DGa7iaidT5s0qnINlwMjJ`" },
            { quoted: message }
        );
        return;
    }

    try {
        const res = await fetch(`https://api.giftedtech.web.id/api/download/spotifydl?apikey=gifted&url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (!data.success || !data.result?.download_url) {
            throw new Error("Spotify API failed.");
        }

        const { title, duration, thumbnail, download_url } = data.result;

        // send track info first
        await sock.sendMessage(
            chatId,
            {
                image: { url: thumbnail },
                caption: `🎶 *Spotify Downloader* 🎶\n\n🎵 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n🔗 [Download Link](${download_url})`
            },
            { quoted: message }
        );

        // then send the audio file
        await sock.sendMessage(
            chatId,
            {
                audio: { url: download_url },
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`
            },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in spotifyCommand:", err.message);
        await sock.sendMessage(chatId, { text: "❌ Could not fetch Spotify track. Please try again later." }, { quoted: message });
    }
}

module.exports = spotifyCommand;
