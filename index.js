/**
 Gura-io Bot - A WhatsApp Bot
 * Copyright (c) 2024 Professor
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */
require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const { 
    default: makeWASocket,
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// Create a store object with required methods
const store = {
    messages: {},
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => {
        return {}
    },
    bind: function(ev) {
        // Handle events
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key && msg.key.remoteJid) {
                    this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {}
                    this.messages[msg.key.remoteJid][msg.key.id] = msg
                }
            })
        })
        
        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) {
                    this.contacts[contact.id] = contact
                }
            })
        })
        
        ev.on('chats.set', (chats) => {
            this.chats = chats
        })
    },
    loadMessage: async (jid, id) => {
        return this.messages[jid]?.[id] || null
    }
}

let phoneNumber = "2347010285113"
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "*GURA-IO ✨*"
global.themeemoji = "💎"

const settings = require('./settings')
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

// Only create readline interface if we're in an interactive environment
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        // In non-interactive environment, use ownerNumber from settings
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}

         
async function startXeonBotInc() {
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const XeonBotInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    })

    store.bind(XeonBotInc.ev)

        const fetch = require("node-fetch") // make sure you have this installed

XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
    try {
        const mek = chatUpdate.messages[0]
        if (!mek.message) return

        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') 
            ? mek.message.ephemeralMessage.message 
            : mek.message

        const sender = mek.key.participant || mek.key.remoteJid
        const from = mek.key.remoteJid
        const msgText = mek.message.conversation || 
                        mek.message.extendedTextMessage?.text || ""

        // --- Personal Auto Reactions ---
        const targetNumbers = ["2347010285113@s.whatsapp.net", "2348067657315@s.whatsapp.net","2348153827918@s.whatsapp.net"] // add more numbers as needed
        if (targetNumbers.includes(sender)) {
            await XeonBotInc.sendMessage(from, {
                react: { text: "🐦", key: mek.key }
            })
        }

        // --- Command Reactions ---
        if (msgText.startsWith(".")) {
            const args = msgText.trim().split(/ +/g)
            const command = args[0].toLowerCase()
            const reactionMap = require("./utils/reactionMap")

            // React to the command if in reactionMap
            if (reactionMap[command]) {
                await XeonBotInc.sendMessage(from, {
                    react: { text: reactionMap[command], key: mek.key }
                })
            }

            // Handle .ani / .anime command
            if (command === ".ani" || command === ".anime") {
                if (!args[1]) return await XeonBotInc.sendMessage(from, { text: "❌ Please provide an anime name!" })

                const animeName = args.slice(1).join(" ")

                try {
                    const query = `
                        query ($search: String) {
                          Media(search: $search, type: ANIME) {
                            id
                            title { romaji english native }
                            coverImage { large }
                            description
                            averageScore
                            status
                            genres
                            episodes
                            format
                            siteUrl
                          }
                        }
                    `

                    const variables = { search: animeName }

                    const res = await fetch("https://graphql.anilist.co", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json" },
                        body: JSON.stringify({ query, variables })
                    })

                    const data = await res.json()
                    const anime = data.data.Media

                    if (!anime) return await XeonBotInc.sendMessage(from, { text: "❌ Anime not found!" })

                    const messageText = `
🎬 *${anime.title.romaji || anime.title.english || anime.title.native}*
⭐ Rating: ${anime.averageScore || "N/A"}
📺 Status: ${anime.status || "N/A"}
📚 Format: ${anime.format || "N/A"}
🎞 Episodes: ${anime.episodes || "N/A"}
🎭 Genres: ${anime.genres.join(", ") || "N/A"}
🖇 MAL Link: ${anime.siteUrl || "N/A"}

📝 Description:
${anime.description ? anime.description.replace(/<[^>]+>/g, '') : "N/A"}
                    `

                    await XeonBotInc.sendMessage(from, {
                        image: { url: anime.coverImage.large },
                        caption: messageText
                    })

                } catch (err) {
                    console.error(err)
                    await XeonBotInc.sendMessage(from, { text: "❌ Failed to fetch anime info." })
                }
            }
        }

        // --- Continue normal handling ---
        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            await handleStatus(XeonBotInc, chatUpdate);
        } else {
            if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

            try {
                await handleMessages(XeonBotInc, chatUpdate, true)
            } catch (err) {
                console.error("Error in handleMessages:", err)
                await XeonBotInc.sendMessage(from, { 
                    text: '❌ An error occurred while processing your message.' 
                }).catch(console.error)
            }
        }

    } catch (err) {
        console.error("Error in messages.upsert:", err)
    }
})



    // Add these event handlers for better functionality
    XeonBotInc.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    XeonBotInc.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = XeonBotInc.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    XeonBotInc.getName = (jid, withoutContact = false) => {
        id = XeonBotInc.decodeJid(jid)
        withoutContact = XeonBotInc.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ?
            XeonBotInc.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    XeonBotInc.public = true

    XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store)

    const reactionMap = require("./utils/reactionMap");


    async function handleMessage(sock, message) {
        try {
            const from = message.key.remoteJid;
            const msg = message.message?.conversation ||
                message.message?.extendedTextMessage?.text || "";

            if (!msg.startsWith(".")) return; // only react if it’s a command

            const command = msg.split(" ")[0].toLowerCase();

            if (reactionMap[command]) {
                await sock.sendMessage(from, {
                    react: {
                        text: reactionMap[command],
                        key: message.key
                    }
                });
            }

            // ✅ continue to your command execution logic here...

        } catch (err) {
            console.error("Error handling message:", err);
        }
    }


    // Handle pairing code
    if (pairingCode && !XeonBotInc.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        let phoneNumber
        if (!!global.phoneNumber) {
            phoneNumber = global.phoneNumber
        } else {
            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFormat: 6281376552730 (without + or spaces) : `)))
        }

        // Clean the phone number - remove any non-digit characters
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        // Validate the phone number using awesome-phonenumber
        const pn = require('awesome-phonenumber');
        if (!pn('+' + phoneNumber).isValid()) {
            console.log(chalk.red('Invalid phone number. Please enter your full international number (e.g., 15551234567 for US, 447911123456 for UK, etc.) without + or spaces.'));
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                let code = await XeonBotInc.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
                console.log(chalk.yellow(`\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code shown above`))
            } catch (error) {
                console.error('Error requesting pairing code:', error)
                console.log(chalk.red('Failed to get pairing code. Please check your phone number and try again.'))
            }
        }, 3000)
    }

    // Connection handling
    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            console.log(chalk.magenta(` `))
            console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(XeonBotInc.user, null, 2)))
            
            const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
            await XeonBotInc.sendMessage(botNumber, { 
                text: `🤖 Bot Connected Successfully!\n\n⏰ Time: ${new Date().toLocaleString()}\n✅ Status: Online and Ready!`,
                contextInfo: {
                }
            });

            await delay(1999)
            console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || '*GURA-IO ✨*'} ]`)}\n\n`))
            console.log(chalk.cyan(`< ================================================== >`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner}`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} CREDIT: RYOU GURA`))
            console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot Connected Successfully! ✅`))
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            startXeonBotInc()
        }
    })

    XeonBotInc.ev.on('creds.update', saveCreds)
    
    XeonBotInc.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(XeonBotInc, update);
    });

    XeonBotInc.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
            await handleStatus(XeonBotInc, m);
        }
    });

    XeonBotInc.ev.on('status.update', async (status) => {
        await handleStatus(XeonBotInc, status);
    });

    XeonBotInc.ev.on('messages.reaction', async (status) => {
        await handleStatus(XeonBotInc, status);
    });

    return XeonBotInc
}


// Start the bot with error handling
startXeonBotInc().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})

// === Keep Alive Server ===
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Root route
app.get("/", (req, res) => {
  res.send("✅ Gura-io bot is alive!");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Keep-alive server running on port ${PORT}`);
});