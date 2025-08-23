const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        // Then reply
        const message1 = `*Gura Bot is Active!*\n\n` +
                       `*Version:* ${settings.version}\n` +
                       `*Status:* Online\n` +
                       `*Mode:* Public`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {}
        }, { quoted: message });

    } catch (error) {
        console.error('Error in alive command:', error);

        // React with ❌ if something breaks
        await sock.sendMessage(chatId, {
            react: { text: "❌", key: message.key }
        });

        await sock.sendMessage(chatId, { text: 'Bot is alive~' }, { quoted: message });
    }
}

module.exports = aliveCommand;
