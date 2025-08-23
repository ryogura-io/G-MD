const Genius = require("genius-lyrics");
const client = new Genius.Client(); // no API key needed for basic search

module.exports = async (XeonBotInc, from, mek, args) => {
    if (args.length < 2) {
        return XeonBotInc.sendMessage(from, { 
            text: "❌ Please provide a song name.\n\nExample: `.lyrics shape of you`" 
        }, { quoted: mek })
    }

    try {
        const query = args.slice(1).join(" ");
        const searches = await client.songs.search(query);

        if (!searches.length) {
            return XeonBotInc.sendMessage(from, { text: "❌ No lyrics found." }, { quoted: mek })
        }

        const song = searches[0];
        const lyrics = await song.lyrics();

        // split long lyrics (WhatsApp message limit ~ 4096 chars)
        const chunks = lyrics.match(/.{1,3500}/gs);

        await XeonBotInc.sendMessage(from, { 
            text: `🎶 *${song.title}* by *${song.artist.name}*\n\n${chunks[0]}`
        }, { quoted: mek });

        // send extra chunks if lyrics are too long
        for (let i = 1; i < chunks.length; i++) {
            await XeonBotInc.sendMessage(from, { text: chunks[i] }, { quoted: mek });
        }

    } catch (err) {
        console.error("Lyrics error:", err);
        await XeonBotInc.sendMessage(from, { 
            text: "⚠️ Could not fetch lyrics. Try again later." 
        }, { quoted: mek });
    }
};
