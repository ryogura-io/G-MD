const settings = require('../settings');
const { action } = require('../main');
const fs = require('fs');
const path = require('path');
const axios = require("axios");

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function helpCommand(sock, chatId, message) {
    const uptimeInSeconds = process.uptime();
    const uptimeFormatted = formatTime(uptimeInSeconds);

    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();


    const helpMessage = `
╭──《  ɢᴜʀᴀ-ᴍᴅ  》───⊷
│ ╭────✧❁✧────◆
│ │ ᴏᴡɴᴇʀ ~ ʀʏᴏᴜ
│ │ ᴘʀᴇꜰɪx ~ [${settings.prefix}]
│ │ ᴍᴏᴅᴇ ~ PUBLIC
│ │ ᴜᴘᴛɪᴍᴇ ~ ${uptimeFormatted}
│ │ ᴛɪᴍᴇ ~ ${time}
│ │ ᴅᴀᴛᴇ ~ ${date}
│ │ ᴠᴇʀꜱɪᴏɴ ~ v${settings.version}
│ ╰──────✧❁✧──────◆
╰══════════════════⊷
╭────❏ 🌐 *ɢᴇɴᴇʀᴀʟ* ❏
│ ʜᴇʟᴘ / ᴍᴇɴᴜ
│ ᴘɪɴɢ
│ ᴀʟɪᴠᴇ
│ ᴛᴛꜱ <ᴛᴇxᴛ>
│ ᴏᴡɴᴇʀ
│ ᴊᴏᴋᴇ
│ ϙᴜᴏᴛᴇ
│ ꜰᴀᴄᴛ
│ ᴡᴇᴀᴛʜᴇʀ <ᴄɪᴛʏ>
│ ɴᴇᴡꜱ
│ ᴀᴛᴛᴘ <ᴛᴇxᴛ>
│ ꜰᴀɴᴄʏ <ᴛᴇxᴛ>
│ ᴛɪɴʏ <ʟɪɴᴋ>
│ ᴅᴇꜰɪɴᴇ <ᴡᴏʀᴅ>
│ ʟʏʀɪᴄꜱ <ꜱᴏɴɢ_ᴛɪᴛʟᴇ>
│ ᴍᴏᴠɪᴇ <ᴛɪᴛʟᴇ>
│ ᴛᴏᴍᴘ3 <ᴠɪᴅᴇᴏ>
│ 8ʙᴀʟʟ <ϙᴜᴇꜱᴛɪᴏɴ>
│ ɢʀᴏᴜᴘɪɴꜰᴏ
│ ꜱᴛᴀꜰꜰ / ᴀᴅᴍɪɴꜱ
│ ᴠᴠ
│ ᴊɪᴅ
│────❏ 👮 *ᴀᴅᴍɪɴ* ❏
│ ʙᴀɴ @ᴜꜱᴇʀ
│ ᴘʀᴏᴍᴏᴛᴇ @ᴜꜱᴇʀ
│ ᴅᴇᴍᴏᴛᴇ @ᴜꜱᴇʀ
│ ᴍᴜᴛᴇ <ᴍɪɴ>
│ ᴜɴᴍᴜᴛᴇ
│ ᴅᴇʟᴇᴛᴇ / ᴅᴇʟ
│ ᴋɪᴄᴋ @ᴜꜱᴇʀ
│ ᴡᴀʀɴɪɴɢꜱ @ᴜꜱᴇʀ
│ ᴡᴀʀɴ @ᴜꜱᴇʀ
│ ᴀɴᴛɪʟɪɴᴋ
│ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ
│ ᴄʟᴇᴀʀ
│ ᴛᴀɢ <ᴍᴇꜱꜱᴀɢᴇ>
│ ᴛᴀɢᴀʟʟ
│ ᴄʜᴀᴛʙᴏᴛ
│ ʀᴇꜱᴇᴛʟɪɴᴋ
│ ᴡᴇʟᴄᴏᴍᴇ <ᴏɴ/ᴏꜰꜰ>
│ ɢᴏᴏᴅʙʏᴇ <ᴏɴ/ᴏꜰꜰ>
│────❏ 🔒 *ᴏᴡɴᴇʀ* ❏
│ ᴍᴏᴅᴇ
│ ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ
│ ᴄʟᴇᴀʀꜱᴇꜱꜱɪᴏɴ
│ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
│ ᴄʟᴇᴀʀᴛᴍᴘ
│ ꜱᴇᴛᴘᴘ <ʀᴇᴘʟʏ ɪᴍᴀɢᴇ>
│ ᴀᴜᴛᴏʀᴇᴀᴄᴛ
│ ᴀᴜᴛᴏᴛʏᴘɪɴɢ <ᴏɴ/ᴏꜰꜰ>
│ ᴀᴜᴛᴏʀᴇᴀᴅ <ᴏɴ/ᴏꜰꜰ>
│────❏ 🎨 *ꜱᴛɪᴄᴋᴇʀ* ❏
│ ꜱɪᴍᴀɢᴇ <ʀᴇᴘʟʏ ꜱᴛɪᴄᴋᴇʀ>
│ ꜱᴛɪᴄᴋᴇʀ <ʀᴇᴘʟʏ ɪᴍᴀɢᴇ>
│ ᴛᴀᴋᴇ <ᴘᴀᴄᴋɴᴀᴍᴇ>
│────❏ 🎮 *ɢᴀᴍᴇꜱ* ❏
│ ᴛɪᴄᴛᴀᴄᴛᴏᴇ @ᴜꜱᴇʀ
│ ʜᴀɴɢᴍᴀɴ
│ ɢᴜᴇꜱꜱ <ʟᴇᴛᴛᴇʀ>
│ ᴛʀɪᴠɪᴀ
│ ᴀɴꜱᴡᴇʀ <ᴀɴꜱᴡᴇʀ>
│ ᴛʀᴜᴛʜ
│ ᴅᴀʀᴇ
│ ꜱʜɪᴘ @ᴜꜱᴇʀ
│────❏ 🔤 *ᴛᴇxᴛᴍᴀᴋᴇʀ* ❏
│ ɴᴇᴏɴ <ᴛᴇxᴛ>
│ 1917 <ᴛᴇxᴛ>
│ ʜᴀᴄᴋᴇʀ <ᴛᴇxᴛ>
│ ʙʟᴀᴄᴋᴘɪɴᴋ <ᴛᴇxᴛ>
│ ɢʟɪᴛᴄʜ <ᴛᴇxᴛ>
│────❏ 📥 *ᴅᴏᴡɴʟᴏᴀᴅᴇʀꜱ* ❏
│ ᴘʟᴀʏ <ꜱᴏɴɢ>
│ ꜱᴏɴɢ <ꜱᴏɴɢ>
│ ꜱᴘᴏᴛɪꜰʏ <ʟɪɴᴋ/ɴᴀᴍᴇ>
│ ɪɴꜱᴛᴀɢʀᴀᴍ <ʟɪɴᴋ>
│ ꜰᴀᴄᴇʙᴏᴏᴋ <ʟɪɴᴋ>
│ ᴛɪᴋᴛᴏᴋ <ʟɪɴᴋ>
│ ᴠɪᴅᴇᴏ <ꜱᴏɴɢ>
│ ʏᴛᴍᴘ4 <ʟɪɴᴋ>
│ ᴛᴡɪᴛᴛᴇʀ <ʟɪɴᴋ>
│ ᴡᴀʟʟᴘᴀᴘᴇʀ <ʟɪɴᴋ>
│ ɪᴍᴀɢᴇ <Qᴜᴇʀʏ>
│────❏ 🍥 *ᴀɴɪᴍᴇ* ❏
│ ᴀɴɪᴍᴇ <ɴᴀᴍᴇ>
│ ᴡᴀɪꜰᴜ
╰━━━━━━━━━━━─
> ɢᴜʀᴀ-ᴍᴅ ʙʏ ʀʏᴏᴜ ✨
`;

    try {
        const videoPath = path.join(__dirname, "../assets/eren.mp4"); // 👈 rename your downloaded file to .mp4
        const gifBuffer = fs.readFileSync(videoPath);

        await sock.sendMessage(chatId, {
            video: gifBuffer,
            caption: helpMessage,
            gifPlayback: true
        }, { quoted: message });

    } catch (err) {
        console.error("Error sending help GIF:", err);
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    }
}

module.exports = helpCommand;
