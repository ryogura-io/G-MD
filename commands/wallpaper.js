const fetch = require("node-fetch");

async function wallpaperCommand(sock, chatId, message) {
    // extract user query text
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const query = text.split(" ").slice(1).join(" ").trim();

    if (!query) {
        await sock.sendMessage(chatId, { text: "🖼️ Please provide a search term!\nExample: `.wallpaper cars`" }, { quoted: message });
        return;
    }

    try {
        const res = await fetch(`https://api.giftedtech.web.id/api/search/wallpaper?apikey=gifted&query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data.success || !data.results || data.results.length === 0) {
            throw new Error("No wallpapers found.");
        }

        // pick a random wallpaper entry
        const randomEntry = data.results[Math.floor(Math.random() * data.results.length)];
        // pick a random image variant inside that entry
        const randomImage = randomEntry.image[Math.floor(Math.random() * randomEntry.image.length)];

        await sock.sendMessage(
            chatId,
            {
                image: { url: randomImage },
                caption: `🖼️ *Wallpaper Result*\n🔖 Type: ${randomEntry.type}`
            },
            { quoted: message }
        );

    } catch (err) {
        console.error("Error in wallpaperCommand:", err.message);
        await sock.sendMessage(chatId, { text: "❌ Could not fetch wallpapers. Try again later." }, { quoted: message });
    }
}

module.exports = wallpaperCommand;
