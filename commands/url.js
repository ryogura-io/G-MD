// commands/url.js
const axios = require("axios");
const FormData = require("form-data");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

async function urlCommand(sock, chatId, message) {
    try {
        let quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let targetMsg = message.message?.imageMessage ? message : 
                        quoted?.imageMessage ? { message: quoted } : null;

        if (!targetMsg) {
            await sock.sendMessage(chatId, { text: "❌ Reply to or send an image with `.url`" }, { quoted: message });
            return;
        }

        // ✅ download image buffer
        const buffer = await downloadMediaMessage(targetMsg, "buffer", {}, { 
            reuploadRequest: sock.updateMediaMessage 
        });

        // prepare form data
        let form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", buffer, {
            filename: "upload.jpg",
            contentType: "image/jpeg"
        });

        // upload to Catbox
        const res = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
        });

        if (!res.data.startsWith("http")) {
            throw new Error("Upload failed: " + res.data);
        }

        await sock.sendMessage(chatId, { text: `✅ Uploaded:\n${res.data}` }, { quoted: message });
    } catch (err) {
        console.error("Error in .url command:", err);
        await sock.sendMessage(chatId, { text: "❌ Failed to upload image!" }, { quoted: message });
    }
}

module.exports = { urlCommand };
