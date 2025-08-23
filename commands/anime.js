const fetch = require("node-fetch")

module.exports = async function animeCommand(XeonBotInc, from, mek, args) {
    if (!args[1]) {
        return await XeonBotInc.sendMessage(from, { text: "❌ Please provide an anime name!" })
    }

    const animeName = args.slice(1).join(" ")

    try {
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
        `

        const variables = { search: animeName }

        const res = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ query, variables })
        })

        const data = await res.json()
        const anime = data.data.Media

        if (!anime) {
            return await XeonBotInc.sendMessage(from, { text: "❌ Anime not found!" })
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
        `

        await XeonBotInc.sendMessage(from, {
            image: { url: anime.coverImage.large },
            caption: messageText
        })

    } catch (err) {
        console.error(err)
        await XeonBotInc.sendMessage(from, { text: "❌ Failed to fetch anime info." })
    }
}
