const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
✦──✦ ${settings.botName || 'Gura-io MD'} ✦──✦
⚡ by ${settings.botOwner || 'Ryou'} ⚡
━━━━━━━━━━━━━━━━━━━━━━


🌐 ≫ GENERAL COMMANDS ≪
✦ .help / .menu
✦ .ping
✦ .alive
✦ .tts <text>
✦ .owner
✦ .joke
✦ .quote
✦ .fact
✦ .weather <city>
✦ .news
✦ .attp <text>
✦ .lyrics <song_title>
✦ .8ball <question>
✦ .groupinfo
✦ .staff / .admins 
✦ .vv
✦ .trt <text> <lang>
✦ .ss <link>
✦ .jid

👮 ≫ ADMIN COMMANDS ≪
✦ .ban @user
✦ .promote @user
✦ .demote @user
✦ .mute <minutes>
✦ .unmute
✦ .delete / .del
✦ .kick @user
✦ .warnings @user
✦ .warn @user
✦ .antilink
✦ .antibadword
✦ .clear
✦ .tag <message>
✦ .tagall
✦ .chatbot
✦ .resetlink
✦ .welcome <on/off>
✦ .goodbye <on/off>

🔒 ≫ OWNER COMMANDS ≪
✦ .mode
✦ .autostatus
✦ .clearsession
✦ .antidelete
✦ .cleartmp
✦ .setpp <reply to image>
✦ .autoreact
✦ .autotyping <on/off>
✦ .autoread <on/off>

🎨 ≫ IMAGE / STICKER ≪
✦ .blur <image>
✦ .simage <reply to sticker>
✦ .sticker <reply to image>
✦ .tgsticker <link>
✦ .meme
✦ .take <packname> 
✦ .emojimix <emj1>+<emj2>

🎮 ≫ GAMES ≪
✦ .tictactoe @user
✦ .hangman
✦ .guess <letter>
✦ .trivia
✦ .answer <answer>
✦ .truth
✦ .dare

🤖 ≫ AI COMMANDS ≪
✦ .gpt <question>
✦ .gemini <question>
✦ .imagine <prompt>
✦ .flux <prompt>

🎯 ≫ FUN COMMANDS ≪
✦ .compliment @user
✦ .insult @user
✦ .flirt 
✦ .shayari
✦ .goodnight
✦ .roseday
✦ .character @user
✦ .wasted @user
✦ .ship @user
✦ .simp @user
✦ .stupid @user [text]

🔤 ≫ TEXTMAKER ≪
✦ .metallic <text>
✦ .ice <text>
✦ .snow <text>
✦ .impressive <text>
✦ .matrix <text>
✦ .light <text>
✦ .neon <text>
✦ .devil <text>
✦ .purple <text>
✦ .thunder <text>
✦ .leaves <text>
✦ .1917 <text>
✦ .arena <text>
✦ .hacker <text>
✦ .sand <text>
✦ .blackpink <text>
✦ .glitch <text>
✦ .fire <text>

📥 ≫ DOWNLOADERS ≪
✦ .play <song_name>
✦ .song <song_name>
✦ .instagram <link>
✦ .facebook <link>
✦ .tiktok <link>
✦ .video <song name>
✦ .ytmp4 <link>

💻 ≫ GITHUB / SOURCE ≪
✦ .git
✦ .sc
✦ .script
✦ .repo

*_GURA.IO_* 💎`;

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
