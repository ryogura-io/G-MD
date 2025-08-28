const settings = require('../settings');
const { action } = require('../main');
const fs = require('fs');
const path = require('path');


async function helpCommand(sock, chatId, message) {
    const helpMessage = `
✦──── *ＧＵＲＡ ＭＤ*  ────✦
✦──── by *ＲＹＯＵ*  ────✦
PREFIX - [ ${settings.prefix} ]
MODE - PUBLIC
VERSION - ${settings.version}
━━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━━━
🌐 ≫ GENERAL COMMANDS ≪
✦ help / menu
✦ ping
✦ alive
✦ tts <text>
✦ owner
✦ joke
✦ quote
✦ fact
✦ weather <city>
✦ news
✦ attp <text>
✦ fancy <text>
✦ tiny <link>
✦ define <word>
✦ lyrics <song_title>
✦ movie <movie-title>
✦ 8ball <question>
✦ groupinfo
✦ staff / admins 
✦ vv
✦ jid
━━━━━━━━━━━━━━━━━━━━━━
👮 ≫ ADMIN COMMANDS ≪
✦ ban @user
✦ promote @user
✦ demote @user
✦ mute <minutes>
✦ unmute
✦ delete / del
✦ kick @user
✦ warnings @user
✦ warn @user
✦ antilink
✦ antibadword
✦ clear
✦ tag <message>
✦ tagall
✦ chatbot
✦ resetlink
✦ welcome <on/off>
✦ goodbye <on/off>
━━━━━━━━━━━━━━━━━━━━━━
🔒 ≫ OWNER COMMANDS ≪
✦ mode
✦ autostatus
✦ clearsession
✦ antidelete
✦ cleartmp
✦ setpp <reply to image>
✦ autoreact
✦ autotyping <on/off>
✦ autoread <on/off>
━━━━━━━━━━━━━━━━━━━━━━
🎨 ≫ IMAGE / STICKER ≪
✦ simage <reply to sticker>
✦ sticker <reply to image>
✦ meme
✦ take <packname> 
━━━━━━━━━━━━━━━━━━━━━━
🎮 ≫ GAMES ≪
✦ tictactoe @user
✦ hangman
✦ guess <letter>
✦ trivia
✦ answer <answer>
✦ truth
✦ dare
✦ ship @user
━━━━━━━━━━━━━━━━━━━━━━
🔤 ≫ TEXTMAKER ≪
✦ neon <text>
✦ 1917 <text>
✦ hacker <text>
✦ blackpink <text>
✦ glitch <text>
━━━━━━━━━━━━━━━━━━━━━━
📥 ≫ DOWNLOADERS ≪
✦ play <song_name>
✦ song <song_name>
✦ spotify <link>
✦ instagram <link>
✦ facebook <link>
✦ tiktok <link>
✦ video <song name>
✦ ytmp4 <link>
✦ twitter <link>
✦ wallpaper <link>
━━━━━━━━━━━━━━━━━━━━━━
🍥 ≫ ANIME ≪
✦ anime <anime_name>
✦ waifu
━━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━━━
*𝙶𝚄𝚁𝙰-𝙼𝙳* by Ryou ✨`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
