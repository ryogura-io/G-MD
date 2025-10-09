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
╭──《  GURA-MD  》───⊷
│ ᴏᴡɴᴇʀ ~ ʀʏᴏᴜ
│ ᴘʀᴇꜰɪx ~ [${settings.prefix}]
│ ᴜᴘᴛɪᴍᴇ ~ ${uptimeFormatted}
╰══════════════════⊷
✨ Gura-MD Bot Commands
Bot Prefix ~> [ x ]

🏓 General :
help, menu, ping, alive, tts <text>, owner, joke, quote, fact, weather <city>, news, attp <text>, fancy <text>, tiny <link>, define <word>, lyrics <song_title>, movie <title>, tomp3 <video>, 8ball <question>, groupinfo, staff, admins, vv, jid

🛠️ Admin :
ban @user, promote @user, demote @user, mute <min>, unmute, delete, del, kick @user, warnings @user, warn @user, antilink, antibadword, clear, tag <message>, tagall, chatbot, resetlink, welcome <on/off>, goodbye <on/off>

👑 Owner :
mode, autostatus, clearsession, antidelete, cleartmp, setpp <reply image>, autoreact, autotyping <on/off>, autoread <on/off>

🎨 Sticker :
simage <reply sticker>, sticker <reply image>, take <packname>

🎮 Games :
tictactoe @user, hangman, guess <letter>, truth, dare, ship @user

🧩 Textmaker :
neon <text>, 1917 <text>, hacker <text>, blackpink <text>, glitch <text>

⬇️ Downloaders :
play <song>, song <song>, spotify <link/name>, instagram <link>, facebook <link>, tiktok <link>, video <song>, ytmp4 <link>, twitter <link>, wallpaper <link>, image <query>

🎌 Anime :
anime <name>, waifu

━━━━━━━━━━━━━━━

> Gura-MD by Ryou ✨
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
