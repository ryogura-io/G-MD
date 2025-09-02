const fetch = require("node-fetch");

module.exports = async function animeCommand(sock, chatId, message) {
    try {
        // Extract user text
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const animeName = text.split(" ").slice(1).join(" ").trim();

        if (!animeName) {
            return await sock.sendMessage(chatId, { text: "❌ Please provide an anime name!" }, { quoted: message });
        }

        const query = `
            query ($search: String) {
              Media(search: $search, type: ANIME) {
                id
                title { romaji english native }
                coverImage { large }
                description
                averageScore
                status
                genres
                episodes
                format
                siteUrl
              }
            }
        `;

        const variables = { search: animeName };

        const res = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ query, variables })
        });

        const data = await res.json();
        const anime = data.data.Media;

        if (!anime) {
            return await sock.sendMessage(chatId, { text: "❌ Anime not found!" }, { quoted: message });
        }

        const messageText = `
🎬 *${anime.title.romaji || anime.title.english || anime.title.native}*
⭐ Rating: ${anime.averageScore || "N/A"}
📺 Status: ${anime.status || "N/A"}
📚 Format: ${anime.format || "N/A"}
🎞 Episodes: ${anime.episodes || "N/A"}
🎭 Genres: ${anime.genres.join(", ") || "N/A"}
🖇 AniList Link: ${anime.siteUrl || "N/A"}

📝 Description:
${anime.description ? anime.description.replace(/<[^>]+>/g, '') : "N/A"}
        `;

        await sock.sendMessage(chatId, {
            image: { url: anime.coverImage.large },
            caption: messageText
        }, { quoted: message });

    } catch (err) {
        console.error("Error in animeCommand:", err);
        await sock.sendMessage(chatId, { text: "❌ Failed to fetch anime info." }, { quoted: message });
    }
};
