const settings = require(`./settings`);
require(`./config.js`);
const { isBanned } = require(`./lib/isBanned`);
const yts = require(`yt-search`);
const { fetchBuffer } = require(`./lib/myfunc`);
const fs = require(`fs`);
const fetch = require(`node-fetch`);
const ytdl = require(`ytdl-core`);
const path = require(`path`);
const axios = require(`axios`);
const ffmpeg = require(`fluent-ffmpeg`);
const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn, isSudo } = require(`./lib/index`);



// Command imports
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require(`./commands/autotyping`);
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require(`./commands/autoread`);
const tagAllCommand = require(`./commands/tagall`);
const helpCommand = require(`./commands/help`);
const banCommand = require(`./commands/ban`);
const { promoteCommand } = require(`./commands/promote`);
const { demoteCommand } = require(`./commands/demote`);
const muteCommand = require(`./commands/mute`);
const unmuteCommand = require(`./commands/unmute`);
const stickerCommand = require(`./commands/sticker`);
const isAdmin = require(`./lib/isAdmin`);
const warnCommand = require(`./commands/warn`);
const warningsCommand = require(`./commands/warnings`);
const ttsCommand = require(`./commands/tts`);
const { tictactoeCommand, handleTicTacToeMove } = require(`./commands/tictactoe`);
const { incrementMessageCount, topMembers } = require(`./commands/topmembers`);
const ownerCommand = require(`./commands/owner`);
const deleteCommand = require(`./commands/delete`);
const { handleAntilinkCommand, handleLinkDetection } = require(`./commands/antilink`);
const { Antilink } = require(`./lib/antilink`);
const tagCommand = require(`./commands/tag`);
const jokeCommand = require(`./commands/joke`);
const quoteCommand = require(`./commands/quote`);
const factCommand = require(`./commands/fact`);
const weatherCommand = require(`./commands/weather`);
const newsCommand = require(`./commands/news`);
const kickCommand = require(`./commands/kick`);
const simageCommand = require(`./commands/simage`);
const attpCommand = require(`./commands/attp`);
const { startHangman, guessLetter } = require(`./commands/hangman`);
const { eightBallCommand } = require(`./commands/eightball`);
const { dareCommand } = require(`./commands/dare`);
const { truthCommand } = require(`./commands/truth`);
const { clearCommand } = require(`./commands/clear`);
const pingCommand = require(`./commands/ping`);
const aliveCommand = require(`./commands/alive`);
const welcomeCommand = require(`./commands/welcome`);
const goodbyeCommand = require(`./commands/goodbye`);
const { handleAntiBadwordCommand, handleBadwordDetection } = require(`./lib/antibadword`);
const antibadwordCommand = require(`./commands/antibadword`);
const { handleChatbotCommand, handleChatbotResponse } = require(`./commands/chatbot`);
const takeCommand = require(`./commands/take`);
const shipCommand = require(`./commands/ship`);
const groupInfoCommand = require(`./commands/groupinfo`);
const resetlinkCommand = require(`./commands/resetlink`);
const staffCommand = require(`./commands/staff`);
const unbanCommand = require(`./commands/unban`);
const { handlePromotionEvent } = require(`./commands/promote`);
const { handleDemotionEvent } = require(`./commands/demote`);
const viewOnceCommand = require(`./commands/viewonce`);
const clearSessionCommand = require(`./commands/clearsession`);
const { autoStatusCommand, handleStatusUpdate } = require(`./commands/autostatus`);
const textmakerCommand = require(`./commands/textmaker`);
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require(`./commands/antidelete`);
const clearTmpCommand = require(`./commands/cleartmp`);
const setProfilePicture = require(`./commands/setpp`);
const instagramCommand = require(`./commands/instagram`);
const facebookCommand = require(`./commands/facebook`);
const playCommand = require(`./commands/play`);
const tiktokCommand = require(`./commands/tiktok`);
const songCommand = require(`./commands/song`);
const { addCommandReaction, handleAreactCommand } = require(`./lib/reactions`);
const videoCommand = require(`./commands/video`);
const sudoCommand = require(`./commands/sudo`);
const animeCommand = require("./commands/anime")
const lyricsCommand = require("./commands/lyrics")
const twitterCommand = require("./commands/twitter")
const dictionaryCommand = require("./commands/dictionary");
const { urlCommand } = require("./commands/url");
const { movieCommand } = require("./commands/movie");
const fancyCommand = require("./commands/fancy");
const waifuCmd = require("./commands/waifu");
const wallpaperCommand = require("./commands/wallpaper");
const tinyCommand = require("./commands/tiny");
const spotifyCommand = require("./commands/spotify");
const profileCommand = require("./commands/profile");
const tomp3Command = require("./commands/tomp3");
const googleImageCommand = require("./commands/googleImageCommand");


// Global settings
global.packname = settings.packname;
global.author = settings.author;
prefix = settings.prefix;

// Add this near the top of main.js with other global configurations
const channelInfo = {
    contextInfo: {
    }
};

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== `notify`) return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith(`@g.us`);
        const senderIsSudo = await isSudo(senderId);

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ``
        ).toLowerCase().replace(/\.\s+/g, `.`).trim();

        // Preserve raw message for commands like .tag that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ``;

        // Only log command usage
        if (userMessage.startsWith(`${prefix}`)) {
            console.log(`📝 Command used in ${isGroup ? `group` : `private`}: ${userMessage} by ` + senderId);
            // console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(XeonBotInc.user, null, 2)))
        }

        // Check if user is banned (skip ban check for unban command)
        if (isBanned(senderId) && !userMessage.startsWith(`${prefix}unban`)) {
            // Only respond occasionally to avoid spam
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: `❌ You are banned from using the bot. Contact an admin to get unbanned.`,

                });
            }
            return;
        }

        // First check if it`s a game move
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === `surrender`) {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        // Check for bad words FIRST, before ANY other processing
        if (isGroup && userMessage) {
            await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
        }

        // Then check for command prefix
        if (!userMessage.startsWith(prefix)) {
            // Show typing indicator if autotyping is enabled
            await handleAutotypingForMessage(sock, chatId, userMessage);

            if (isGroup) {
                // Process non-command messages first
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                await Antilink(message, sock);
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            return;
        }

        // List of admin commands
        const adminCommands = [
            `${prefix}mute`, `${prefix}unmute`, `${prefix}ban`, `${prefix}unban`,
            `${prefix}promote`, `${prefix}demote`, `${prefix}kick`, `${prefix}tagall`, `${prefix}antilink`
        ];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

        // List of owner commands
        const ownerCommands = [
            `${prefix}mode`, `${prefix}autostatus`, `${prefix}antidelete`, `${prefix}cleartmp`,
            `${prefix}setpp`, `${prefix}clearsession`, `${prefix}areact`, `${prefix}autoreact`,
            `${prefix}autotyping`, `${prefix}autoread`
        ];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        // Check admin status only for admin commands in groups
        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId, message);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: `Please make the bot an admin to use admin commands.`,
                }, { quoted: message });
                return;
            }

            if (
                userMessage.startsWith(`${prefix}mute`) ||
                userMessage === `${prefix}unmute` ||
                userMessage.startsWith(`${prefix}ban`) ||
                userMessage.startsWith(`${prefix}unban`) ||
                userMessage.startsWith(`${prefix}promote`) ||
                userMessage.startsWith(`${prefix}demote`)
            ) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: `Sorry, only group admins can use this command.`,
                    });
                    return;
                }
            }
        }

        // Check owner status for owner commands
        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsSudo) {
                await sock.sendMessage(chatId, { text: `❌ This command is only available for the owner or sudo!` });
                return;
            }
        }
        // Add this near the start of your message handling logic, before processing commands
        try {
            const data = JSON.parse(fs.readFileSync(`./data/messageCount.json`));
            // Allow owner to use bot even in private mode
            if (!data.isPublic && !message.key.fromMe && !senderIsSudo) {
                return; // Silently ignore messages from non-owners when in private mode
            }
        } catch (error) {
            console.error(`Error checking access mode:`, error);
            // Default to public mode if there`s an error reading the file
        }
        // Command handlers - Execute commands immediately without waiting for typing indicator
        // We`ll show typing indicator after command execution if needed
        let commandExecuted = false;
        switch (true) {
            case userMessage === `${prefix}simage`: {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: `Please reply to a sticker with the .simage command to convert it.`, });
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith(`${prefix}kick`):
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                break;
            case userMessage.startsWith(`${prefix}mute`):
                const muteDuration = parseInt(userMessage.split(` `)[1]);
                if (isNaN(muteDuration)) {
                    await sock.sendMessage(chatId, { text: `Please provide a valid number of minutes.\neg to mute 10 minutes\n.mute 10`, });
                } else {
                    await muteCommand(sock, chatId, senderId, muteDuration);
                }
                break;
            case userMessage === `${prefix}unmute`:
                await unmuteCommand(sock, chatId, senderId);
                break;
            case userMessage.startsWith(`${prefix}ban`):
                await banCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}unban`):
                await unbanCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}help` || userMessage === `${prefix}menu` || userMessage === `${prefix}bot` || userMessage === `${prefix}list` || userMessage === `${prefix}h`:
                await helpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === `${prefix}sticker` || userMessage === `${prefix}s`:
                await stickerCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith(`${prefix}warnings`):
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                break;
            case userMessage.startsWith(`${prefix}warn`):
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                break;
            case userMessage.startsWith(`${prefix}tts`):
                const text = userMessage.slice(4).trim();
                await ttsCommand(sock, chatId, text, message);
                break;
            case userMessage === `${prefix}delete` || userMessage === `${prefix}del`:
                await deleteCommand(sock, chatId, message, senderId);
                break;
            case userMessage.startsWith(`${prefix}attp`):
                await attpCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}mode`):
                // Check if sender is the owner
                if (!message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: `Only bot owner can use this command!`, });
                    return;
                }
                // Read current data first
                let data;
                try {
                    data = JSON.parse(fs.readFileSync(`./data/messageCount.json`));
                } catch (error) {
                    console.error(`Error reading access mode:`, error);
                    await sock.sendMessage(chatId, { text: `Failed to read bot mode status`, });
                    return;
                }
                const action = userMessage.split(` `)[1]?.toLowerCase();
                // If no argument provided, show current status
                if (!action) {
                    const currentMode = data.isPublic ? `public` : `private`;
                    await sock.sendMessage(chatId, {
                        text: `Current bot mode: *${currentMode}*\n\nUsage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only`,

                    });
                    return;
                }
                if (action !== `public` && action !== `private`) {
                    await sock.sendMessage(chatId, {
                        text: `Usage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only`,

                    });
                    return;
                }
                try {
                    // Update access mode
                    data.isPublic = action === `public`;

                    // Save updated data
                    fs.writeFileSync(`./data/messageCount.json`, JSON.stringify(data, null, 2));

                    await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, });
                } catch (error) {
                    console.error(`Error updating access mode:`, error);
                    await sock.sendMessage(chatId, { text: `Failed to update bot access mode`, });
                }
                break;
            case userMessage === `${prefix}owner`:
                await ownerCommand(sock, chatId);
                break;
            case userMessage === `${prefix}tagall`:
                if (isSenderAdmin || message.key.fromMe) {
                    await tagAllCommand(sock, chatId, senderId, message);
                } else {
                    await sock.sendMessage(chatId, { text: `Sorry, only group admins can use the .tagall command.`, }, { quoted: message });
                }
                break;
            case userMessage.startsWith(`${prefix}tag`):
                const messageText = rawText.slice(4).trim();  // use rawText here, not userMessage
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await tagCommand(sock, chatId, senderId, messageText, replyMessage);
                break;
            case userMessage.startsWith(`${prefix}antilink`):
                if (!isGroup) {
                    await sock.sendMessage(chatId, {
                        text: `This command can only be used in groups.`,

                    });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, {
                        text: `Please make the bot an admin first.`,

                    });
                    return;
                }
                await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin);
                break;
            case userMessage === `${prefix}joke`:
                await jokeCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}quote`:
                await quoteCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}fact`:
                await factCommand(sock, chatId, message, message);
                break;
            case userMessage.startsWith(`${prefix}weather`):
                const city = userMessage.slice(9).trim();
                if (city) {
                    await weatherCommand(sock, chatId, city);
                } else {
                    await sock.sendMessage(chatId, { text: `Please specify a city, e.g., .weather London`, });
                }
                break;
            case userMessage === `${prefix}news`:
                await newsCommand(sock, chatId);
                break;
            case userMessage.startsWith(`${prefix}ttt`) || userMessage.startsWith(`${prefix}tictactoe`):
                const tttText = userMessage.split(` `).slice(1).join(` `);
                await tictactoeCommand(sock, chatId, senderId, tttText);
                break;
            case userMessage.startsWith(`${prefix}move`):
                const position = parseInt(userMessage.split(` `)[1]);
                if (isNaN(position)) {
                    await sock.sendMessage(chatId, { text: `Please provide a valid position number for Tic-Tac-Toe move.`, });
                } else {
                    tictactoeMove(sock, chatId, senderId, position);
                }
                break;
            case userMessage === `${prefix}topmembers`:
                topMembers(sock, chatId, isGroup);
                break;
            case userMessage.startsWith(`${prefix}hangman`):
                startHangman(sock, chatId);
                break;
            case userMessage.startsWith(`${prefix}guess`):
                const guessedLetter = userMessage.split(` `)[1];
                if (guessedLetter) {
                    guessLetter(sock, chatId, guessedLetter);
                } else {
                    sock.sendMessage(chatId, { text: `Please guess a letter using .guess <letter>`, });
                }
                break;
            case userMessage.startsWith(`${prefix}8ball`):
                const question = userMessage.split(` `).slice(1).join(` `);
                await eightBallCommand(sock, chatId, question);
                break;
            case userMessage === `${prefix}dare`:
                await dareCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}truth`:
                await truthCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}clear`:
                if (isGroup) await clearCommand(sock, chatId);
                break;
            case userMessage.startsWith(`${prefix}promote`):
                const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                break;
            case userMessage.startsWith(`${prefix}demote`):
                const mentionedJidListDemote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await demoteCommand(sock, chatId, mentionedJidListDemote, message);
                break;
            case userMessage === `${prefix}ping`:
                await pingCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}alive`:
                await aliveCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}welcome`):
                if (isGroup) {
                    // Check admin status if not already checked
                    if (!isSenderAdmin) {
                        const adminStatus = await isAdmin(sock, chatId, senderId);
                        isSenderAdmin = adminStatus.isSenderAdmin;
                    }
                    if (isSenderAdmin || message.key.fromMe) {
                        await welcomeCommand(sock, chatId, message);
                    } else {
                        await sock.sendMessage(chatId, { text: `Sorry, only group admins can use this command.`, });
                    }
                } else {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups.`, });
                }
                break;
            case userMessage.startsWith(`${prefix}goodbye`):
                if (isGroup) {
                    // Check admin status if not already checked
                    if (!isSenderAdmin) {
                        const adminStatus = await isAdmin(sock, chatId, senderId);
                        isSenderAdmin = adminStatus.isSenderAdmin;
                    }

                    if (isSenderAdmin || message.key.fromMe) {
                        await goodbyeCommand(sock, chatId, message);
                    } else {
                        await sock.sendMessage(chatId, { text: `Sorry, only group admins can use this command.`, });
                    }
                } else {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups.`, });
                }
                break;
            case userMessage.startsWith(`${prefix}antibadword`):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups.`, });
                    return;
                }
                const adminStatus = await isAdmin(sock, chatId, senderId);
                isSenderAdmin = adminStatus.isSenderAdmin;
                isBot
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: `*Bot must be admin to use this feature*`, });
                    return;
                }
                await antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin);
                break;
            case userMessage.startsWith(`${prefix}chatbot`):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups.`, });
                    return;
                }
                // Check if sender is admin or bot owner
                const chatbotAdminStatus = await isAdmin(sock, chatId, senderId);
                if (!chatbotAdminStatus.isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: `*Only admins or bot owner can use this command*`, });
                    return;
                }
                const match = userMessage.slice(8).trim();
                await handleChatbotCommand(sock, chatId, message, match);
                break;
            case userMessage.startsWith(`${prefix}take`):
                const takeArgs = rawText.slice(5).trim().split(` `);
                await takeCommand(sock, chatId, message, takeArgs);
                break;
            case userMessage === `${prefix}ship`:
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups!`, });
                    return;
                }
                await shipCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}groupinfo` || userMessage === `${prefix}infogp` || userMessage === `${prefix}infogrupo`:
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups!`, });
                    return;
                }
                await groupInfoCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}resetlink` || userMessage === `${prefix}revoke` || userMessage === `${prefix}anularlink`:
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups!`, });
                    return;
                }
                await resetlinkCommand(sock, chatId, senderId);
                break;
            case userMessage === `${prefix}staff` || userMessage === `${prefix}admins` || userMessage === `${prefix}listadmin`:
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: `This command can only be used in groups!`, });
                    return;
                }
                await staffCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}vv`:
                await viewOnceCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}clearsession` || userMessage === `${prefix}clearsesi`:
                await clearSessionCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}autostatus`):
                const autoStatusArgs = userMessage.split(` `).slice(1);
                await autoStatusCommand(sock, chatId, message, autoStatusArgs);
                break;
            case userMessage.startsWith(`${prefix}snow`):
                await textmakerCommand(sock, chatId, message, userMessage, `snow`);
                break;
            case userMessage.startsWith(`${prefix}neon`):
                await textmakerCommand(sock, chatId, message, userMessage, `neon`);
                break;
            case userMessage.startsWith(`${prefix}leaves`):
                await textmakerCommand(sock, chatId, message, userMessage, `leaves`);
                break;
            case userMessage.startsWith(`${prefix}1917`):
                await textmakerCommand(sock, chatId, message, userMessage, `1917`);
                break;
            case userMessage.startsWith(`${prefix}hacker`):
                await textmakerCommand(sock, chatId, message, userMessage, `hacker`);
                break;
            case userMessage.startsWith(`${prefix}sand`):
                await textmakerCommand(sock, chatId, message, userMessage, `sand`);
                break;
            case userMessage.startsWith(`${prefix}blackpink`):
                await textmakerCommand(sock, chatId, message, userMessage, `blackpink`);
                break;
            case userMessage.startsWith(`${prefix}glitch`):
                await textmakerCommand(sock, chatId, message, userMessage, `glitch`);
                break;
            case userMessage.startsWith(`${prefix}antidelete`):
                const antideleteMatch = userMessage.slice(11).trim();
                await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
                break;
            case userMessage === `${prefix}surrender`:
                // Handle surrender command for tictactoe game
                await handleTicTacToeMove(sock, chatId, senderId, `surrender`);
                break;
            case userMessage === `${prefix}cleartmp`:
                await clearTmpCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}setpp`:
                await setProfilePicture(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}instagram`) || userMessage.startsWith(`${prefix}insta`) || userMessage.startsWith(`${prefix}ig`):
                await instagramCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}fb`) || userMessage.startsWith(`${prefix}facebook`):
                await facebookCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}music`):
                await playCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}play`) || userMessage.startsWith(`${prefix}mp3`) || userMessage.startsWith(`${prefix}ytmp3`) || userMessage.startsWith(`${prefix}song`):
                await songCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}video`) || userMessage.startsWith(`${prefix}ytmp4`):
                await videoCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}areact`) || userMessage.startsWith(`${prefix}autoreact`) || userMessage.startsWith(`${prefix}autoreaction`):
                const isOwnerOrSudo = message.key.fromMe || senderIsSudo;
                await handleAreactCommand(sock, chatId, message, isOwnerOrSudo);
                break;
            case userMessage.startsWith(`${prefix}sudo`):
                await sudoCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}shayari` || userMessage === `${prefix}shayri`:
                await shayariCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}roseday`:
                await rosedayCommand(sock, chatId, message);
                break;
            case userMessage === `${prefix}jid`: await groupJidCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}autotyping`):
                await autotypingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith(`${prefix}autoread`):
                await autoreadCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith(`${prefix}twitter`):
            case userMessage.startsWith(`${prefix}tw`):
                await twitterCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}lyric`):
            case userMessage.startsWith(`${prefix}lyrics`):
                await lyricsCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}ani`):
            case userMessage.startsWith(`${prefix}anime`):
                await animeCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}url`):
                await urlCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}movie`):
            case userMessage.startsWith(`${prefix}imdb`):
                await movieCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}define`):
                await dictionaryCommand(sock, chatId, message);
                break;
            case userMessage.startsWith(`${prefix}fancy`): {
                try {
                    const chatId = message.key.remoteJid;
                    // Extract user message text
                    const fullText = message.message?.conversation
                        || message.message?.extendedTextMessage?.text
                        || "";
                    const query = fullText.split(" ").slice(1).join(" ").trim();
                    await fancyCommand(sock, chatId, message, query);
                } catch (err) {
                    console.error("Error in .fancy command:", err);
                    await sock.sendMessage(chatId, { text: "❌ Something went wrong with .fancy" }, { quoted: message });
                }
                break;
            }
            case userMessage.startsWith(`${prefix}waifu`):
            case userMessage.startsWith(`${prefix}wife`):
            case userMessage.startsWith(`${prefix}bestgirl`): {
                await waifuCmd(sock, message);
                break;
            }
            case userMessage.startsWith(`${prefix}wallpaper`): 
            case userMessage.startsWith(`${prefix}wp`): {
                await wallpaperCommand(sock, chatId, message);
                break;
            }
            case userMessage.startsWith(`${prefix}tiny`): {
                await tinyCommand(sock, chatId, message);
                break;
            }
            case userMessage.startsWith(`${prefix}spotify`):
            case userMessage.startsWith(`${prefix}spot`): {
                await spotifyCommand(sock, chatId, message);
                break;
            }
            case userMessage.startsWith(`${prefix}tiktok`):
            case userMessage.startsWith(`${prefix}tt`): {
                await tiktokCommand(sock, chatId, message);
                break;
            }

            case userMessage.startsWith(`${prefix}tiktoka`):
            case userMessage.startsWith(`${prefix}tta`): {
                await tiktokCommand(sock, chatId, message, "audio");
                break;
            }
            case userMessage.startsWith(`${prefix}profile`):
            case userMessage.startsWith(`${prefix}pp`): {
                await profileCommand(sock, chatId, message);
                break;
            }
            case userMessage.startsWith(`${prefix}tomp3`):
            case userMessage.startsWith(`${prefix}toaudio`): {
                await tomp3Command(sock, chatId, message);
                break;
            }
            case userMessage.startsWith(`${prefix}img`):
            case userMessage.startsWith(`${prefix}image`): {
                await googleImageCommand(sock, chatId, message);
                break;
            }

            default:
                if (isGroup) {
                    // Handle non-command group messages
                    if (userMessage) {  // Make sure there`s a message
                        await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                    }
                    await Antilink(message, sock);
                    await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
                }
                commandExecuted = false;
                break;
        }

        // If a command was executed, show typing status after command execution
        if (commandExecuted !== false) {
            // Command was executed, now show typing status after command execution
            await showTypingAfterCommand(sock, chatId);
        }

        // Function to handle .groupjid command
        async function groupJidCommand(sock, chatId, message) {
            const groupJid = message.key.remoteJid;

            if (!groupJid.endsWith(`@g.us`)) {
                return await sock.sendMessage(chatId, {
                    text: "❌ This command can only be used in a group."
                });
            }

            await sock.sendMessage(chatId, {
                text: `✅ Group JID: ${groupJid}`
            }, {
                quoted: message
            });
        }

        if (userMessage.startsWith(`${prefix}`)) {
            // After command is processed successfully
            await addCommandReaction(sock, message);
        }
    } catch (error) {
        console.error(`❌ Error in message handler:`, error.message);
        // Only try to send error message if we have a valid chatId
        if (chatId) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed to process command!`,
            });
        }
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;

        // Check if it`s a group
        if (!id.endsWith(`@g.us`)) return;

        // Handle promotion events
        if (action === `promote`) {
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }

        // Handle demotion events
        if (action === `demote`) {
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }

        // Handle join events
        if (action === `add`) {
            // Check if welcome is enabled for this group
            const isWelcomeEnabled = await isWelcomeOn(id);
            if (!isWelcomeEnabled) return;

            // Get group metadata
            const groupMetadata = await sock.groupMetadata(id);
            const groupName = groupMetadata.subject;
            const groupDesc = groupMetadata.desc || `No description available`;

            // Get welcome message from data
            const data = JSON.parse(fs.readFileSync(`./data/userGroupData.json`));
            const welcomeData = data.welcome[id];
            const welcomeMessage = welcomeData?.message || `Welcome {user} to the group! 🎉`;

            // Send welcome message for each new participant
            for (const participant of participants) {
                const user = participant.split(`@`)[0];
                const formattedMessage = welcomeMessage
                    .replace(`{user}`, `@${user}`)
                    .replace(`{group}`, groupName)
                    .replace(`{description}`, groupDesc);

                await sock.sendMessage(id, {
                    text: formattedMessage,
                    mentions: [participant],
                    contextInfo: {
                    }
                });
            }
        }

        // Handle leave events
        if (action === `remove`) {
            // Check if goodbye is enabled for this group
            const isGoodbyeEnabled = await isGoodByeOn(id);
            if (!isGoodbyeEnabled) return;

            // Get group metadata
            const groupMetadata = await sock.groupMetadata(id);
            const groupName = groupMetadata.subject;

            // Get goodbye message from data
            const data = JSON.parse(fs.readFileSync(`./data/userGroupData.json`));
            const goodbyeData = data.goodbye[id];
            const goodbyeMessage = goodbyeData?.message || `Goodbye {user} 👋`;

            // Send goodbye message for each leaving participant
            for (const participant of participants) {
                const user = participant.split(`@`)[0];
                const formattedMessage = goodbyeMessage
                    .replace(`{user}`, `@${user}`)
                    .replace(`{group}`, groupName);

                await sock.sendMessage(id, {
                    text: formattedMessage,
                    mentions: [participant],
                    contextInfo: {
                    }
                });
            }
        }
    } catch (error) {
        console.error(`Error in handleGroupParticipantUpdate:`, error);
    }
}

// Instead, export the handlers along with handleMessages
module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};
