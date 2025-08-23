const axios = require("axios");

async function movieCommand(XeonBotInc, chatId, mek, args) {
    try {
        // remove the command itself (.movie / .imdb)
        const query = args.join(" ").trim();

        if (!query) {
            return XeonBotInc.sendMessage(
                chatId,
                { text: "❌ Please provide a movie/series name." },
                { quoted: mek }
            );
        }

        const res = await axios.get(
            `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=thewdb`
        );

        if (res.data.Response === "False") {
            return XeonBotInc.sendMessage(
                chatId,
                { text: `❌ Movie not found for: *${query}*` },
                { quoted: mek }
            );
        }

        const movie = res.data;
        const details = `🎬 *${movie.Title}* (${movie.Year})
⭐ IMDB Rating: ${movie.imdbRating}
📺 Type: ${movie.Type}
📅 Released: ${movie.Released}
🎭 Genre: ${movie.Genre}
👨‍💻 Director: ${movie.Director}
⭐ Actors: ${movie.Actors}
📝 Plot: ${movie.Plot}
🌐 IMDB: https://www.imdb.com/title/${movie.imdbID}`;

        if (movie.Poster && movie.Poster !== "N/A") {
            await XeonBotInc.sendMessage(
                chatId,
                {
                    image: { url: movie.Poster },
                    caption: details,
                },
                { quoted: mek }
            );
        } else {
            await XeonBotInc.sendMessage(
                chatId,
                { text: details },
                { quoted: mek }
            );
        }
    } catch (error) {
        console.error("Error in movieCommand:", error);
        await XeonBotInc.sendMessage(
            chatId,
            { text: "❌ Failed to fetch movie details. Try again later!" },
            { quoted: mek }
        );
    }
}

module.exports = { movieCommand };
