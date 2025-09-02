const fetch = require("node-fetch");

async function lyricsCommand(sock, chatId, message) {
    // extract user input
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const query = text.split(" ").slice(1).join(" ").trim();

    if (!query) {
        await sock.sendMessage(chatId, { text: "🎵 Please provide a song name!\nExample: `.lyrics Dynasty Miaa`" }, { quoted: message });
        return;
    }

    try {
        const res = await fetch(`https://api.giftedtech.web.id/api/search/lyrics?apikey=gifted&query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data.success || !data.result) {
            throw new Error("No lyrics found.");
        }

        const { title, artist, link, image, lyrics } = data.result;

        // send cover image + metadata
        await sock.sendMessage(
            chatId,
            {
                image: { url: image },
                caption: `🎶 *${title}* - ${artist}`
            },
            { quoted: message }
        );

        // send lyrics separately
        await sock.sendMessage(
            chatId,
            { text: `📜 *Lyrics for ${title}:*\n\n${lyrics}` },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in lyricsCommand:", err.message);
        await sock.sendMessage(chatId, { text: "❌ Could not fetch lyrics. Try again later." }, { quoted: message });
    }
}

module.exports = lyricsCommand ;
