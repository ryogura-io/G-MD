const fetch = require("node-fetch");

module.exports = async function dictionaryCommand(sock, chatId, message) {
    try {
        // Extract user text
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const word = text.split(" ").slice(1).join(" ").trim();

        if (!word) {
            return await sock.sendMessage(chatId, { 
                text: `❌ Usage: define <word>` 
            }, { quoted: message });
        }

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

        await sock.sendMessage(chatId, { text: reply.trim() }, { quoted: message });

    } catch (err) {
        console.error("Dictionary error:", err);
        await sock.sendMessage(chatId, { text: "❌ Could not fetch definition." }, { quoted: message });
    }
};
