const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")

const settings = require('./settings');
const pino = require('pino');
const express = require("express");
const fs = require("fs");
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const cors = require("cors");

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

async function startBot(number) {
    let code = null
    try {
        console.log('🤖 Starting Gura Bot...');

        const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
        let { version, isLatest } = await fetchLatestBaileysVersion()

        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
            },
            logger: pino({ level: 'silent' }),
            syncFullHistory: false,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            getMessage: async () => undefined,
        });

store.bind(sock.ev);

        if (!state.creds.registered) {
            console.log(`⏳ Generating pairing code for: ${number} ...`);
            await delay(4000); // ✅ use baileys built-in delay instead of setTimeout
            try {
                const pairingCode = await sock.requestPairingCode(number.trim());
                console.log(`\n🔑 Your WhatsApp Pairing Code: ${pairingCode}`);
                console.log("👉 Open WhatsApp > Linked Devices > Link with phone number and enter this code.\n");
                code = pairingCode; // ✅ assign directly, no async nesting
            } catch (err) {
                console.error("❌ Failed to generate pairing code:", err);
            }
        }


        // --- Connection Handling ---
        sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

            if (connection == "open") {
                console.info('✅ WhatsApp bot connected successfully!');

                if (!sock.__welcomeSent) {
                    const owner = settings.ownerNumber + '@s.whatsapp.net';
                    const msg = `✅ *Gura Bot Connected!*\n\n` +
                        `⏰ Connected at: ${new Date().toLocaleString()}\n` +
                        `📱 Status: Ready` 

                    try {
                        await sock.sendMessage(owner, { text: msg });
                        console.info(`✅ Success message sent to owner: ${owner}`);
                        sock.__welcomeSent = true; // prevent spamming
                    } catch (err) {
                        console.error(`❌ Failed to send message to ${owner}:`, err);
                    }
                }
            }
            if (
                connection === "close" &&
                lastDisconnect &&
                lastDisconnect.error &&
                lastDisconnect.error.output.statusCode != 401
            ) {
                startBot(number)
            };
        })
        sock.ev.on('creds.update', saveCreds);

        // --- Message Handling ---
        sock.ev.on('messages.upsert', async (m) => {
    const mek = m.messages[0];
    if (!mek.message) return;

    mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage')
        ? mek.message.ephemeralMessage.message
        : mek.message;

    const from = mek.key.remoteJid;
    const msgText = mek.message.conversation ||
                    mek.message.extendedTextMessage?.text || "";
    const isStatus = from === 'status@broadcast'

    // Normal commands
    const prefix = settings.prefix;
    if (msgText.startsWith(prefix)) {
        const args = msgText.trim().split(/ +/g);
        const command = args[0].slice(prefix.length).toLowerCase();
        const reactionMap = require("./utils/reactionMap");
        if (reactionMap[command]) {
            await sock.sendMessage(from, {
                react: { text: reactionMap[command], key: mek.key }
            });
        }
    }

    try {
        await handleMessages(sock, m, true);
    } catch (err) {
        console.error("Error in handleMessages:", err);
        await sock.sendMessage(from, { text: '❌ An error occurred while processing your message.' });
    }
});

        // --- Group Participants Update Handling ---
        sock.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(sock, update);

sock.ev.on("status.update", async (status) => {
  await handleStatus(sock, status);
});

    });

    } catch (error) {
        console.error('❌ Error starting bot:', error);
    }

    return code
}

// === Keep Alive Server ===
const app = express();
app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.get("/", (req, res) => res.send("✅ Gura Bot backend is running!"));

// --- PAIR ENDPOINT ---
app.post("/pair", async (req, res) => {
    try {
        const { number } = req.body;
        if (!number) return res.status(400).json({ error: "Phone number required." });

        // remove old session
        if (fs.existsSync("./auth_info")) {
            fs.rmSync("./auth_info", { recursive: true, force: true });
            console.log("🧹 Old auth_info folder removed.");
        }
        fs.mkdirSync("./auth_info", { recursive: true });
        const code = await startBot(number);

        // return success if valid string
        if (typeof code === "string" && code.trim().length > 0) {
            console.log("📦 Pair response code:", code);
            return res.status(200).json({ code });
        }

        // helpful error for frontend & logs
        const reason = code === null ? "No code generated (maybe already linked or timed out)" : "Invalid code returned";
        console.error("❌ startBot did not return a usable code:", reason);
        return res.status(500).json({ error: reason });

    } catch (err) {
        console.error("❌ Error generating pairing code:", err);
        return res.status(500).json({ error: err.message || "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
    console.log(`🌐 GURA Bot Backend running on port ${PORT}`)
);

// Print to terminal every 5 minutes
setInterval(() => {
    console.log("💓 Keep alive... " + new Date().toLocaleString());
}, 5 * 60 * 1000); // 5 minutes