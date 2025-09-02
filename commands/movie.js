const axios = require("axios");

async function movieCommand(sock, chatId, message) {
    try {
        // Extract user text
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const query = text.split(" ").slice(1).join(" ").trim();

        if (!query) {
            return await sock.sendMessage(
                chatId,
                { text: "❌ Please provide a movie/series name." },
                { quoted: message }
            );
        }

        const res = await axios.get(
            `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=thewdb`
        );

        if (res.data.Response === "False") {
            return await sock.sendMessage(
                chatId,
                { text: `❌ Movie not found for: *${query}*` },
                { quoted: message }
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
            await sock.sendMessage(
                chatId,
                {
                    image: { url: movie.Poster },
                    caption: details,
                },
                { quoted: message }
            );
        } else {
            await sock.sendMessage(
                chatId,
                { text: details },
                { quoted: message }
            );
        }
    } catch (error) {
        console.error("Error in movieCommand:", error);
        await sock.sendMessage(
            chatId,
            { text: "❌ Failed to fetch movie details. Try again later!" },
            { quoted: message }
        );
    }
}

module.exports = { movieCommand };
