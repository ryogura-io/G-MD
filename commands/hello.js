const settings = require("../settings");

async function helloCommand(sock, chatId, message) {
    try {
        // 1. React to the message first
        await sock.sendMessage(chatId, {
            react: { text: "👋", key: message.key }
        });

        // 2. Then reply
        const message1 = `Hello, Welcome to Gura-io Bot`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {}
        }, { quoted: message });

    } catch (error) {
        console.error('Error in hello command:', error);

        await sock.sendMessage(chatId, {
            react: { text: "❌", key: message.key }
        });

        await sock.sendMessage(chatId, { text: 'Something went wrong!' }, { quoted: message });
    }
}

module.exports = helloCommand;
