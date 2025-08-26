const fetch = require('node-fetch');

async function truthCommand(sock, chatId, message) {
    try {
        const res = await fetch("https://api.truthordarebot.xyz/v1/truth");
        
        if (!res.ok) {
            throw await res.text();
        }

        const json = await res.json();
        const truthMessage = json.question;

        await sock.sendMessage(chatId, { text: `?? *Truth:* ${truthMessage}` }, { quoted: message });
    } catch (error) {
        console.error('Error in truth command:', error);
        await sock.sendMessage(chatId, { text: '? Failed to get truth. Please try again later!' }, { quoted: message });
    }
}

module.exports = { truthCommand };
