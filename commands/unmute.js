async function unmuteCommand(sock, chatId, message) {
// React first
        await sock.sendMessage(chatId, {react: { text: "🔓", key: message.key }});
    await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
    await sock.sendMessage(chatId, { text: 'The group has been unmuted.' });
}

module.exports = unmuteCommand;
