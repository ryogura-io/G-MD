const fetch = require("node-fetch");

module.exports = async function dictionaryCommand(XeonBotInc, from, mek, args) {
    if (args.length < 2) {
        return XeonBotInc.sendMessage(from, { text: "❌ Usage: .define <word>" }, { quoted: mek });
    }

    const word = args.slice(1).join(" ");
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!res.ok) throw new Error("Word not found");
        
        const data = await res.json();
        const entry = data[0];

        let reply = `📖 *Definition of ${entry.word}*:\n\n`;

        if (entry.phonetics && entry.phonetics[0]?.text) {
            reply += `🔊 Pronunciation: _${entry.phonetics[0].text}_\n\n`;
        }

        if (entry.meanings && entry.meanings.length > 0) {
            entry.meanings.forEach((meaning, i) => {
                reply += `*${i + 1}. ${meaning.partOfSpeech}*\n`;
                meaning.definitions.slice(0, 3).forEach((def, j) => {
                    reply += `   - ${def.definition}\n`;
                    if (def.example) reply += `     _Example_: ${def.example}\n`;
                });
                reply += "\n";
            });
        }

        await XeonBotInc.sendMessage(from, { text: reply.trim() }, { quoted: mek });

    } catch (err) {
        console.error("Dictionary error:", err);
        await XeonBotInc.sendMessage(from, { text: "❌ Could not fetch definition." }, { quoted: mek });
    }
};
