// commands/url.js
const axios = require("axios");
const FormData = require("form-data");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

// 🔑 Put your ImgBB key here
const IMGBB_API_KEY = "c7427b69f5258372a34457ff92d7e642";

async function urlCommand(sock, chatId, message) {
    try {
        let quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let targetMsg = message.message?.imageMessage
            ? message
            : quoted?.imageMessage
            ? { message: quoted }
            : null;

        if (!targetMsg) {
            return await sock.sendMessage(
                chatId,
                { text: "❌ Reply to or send an image with `.url`" },
                { quoted: message }
            );
        }

        // ✅ download image buffer
        const buffer = await downloadMediaMessage(targetMsg, "buffer", {}, { 
            reuploadRequest: sock.updateMediaMessage 
        });

        // try Catbox first
        try {
            let form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", buffer, {
                filename: "upload.jpg",
                contentType: "image/jpeg"
            });

            const res = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders(),
            });

            if (res.data.startsWith("http")) {
                return await sock.sendMessage(
                    chatId,
                    { text: `✅ Uploaded (Catbox):\n${res.data}` },
                    { quoted: message }
                );
            } else {
                throw new Error("Catbox error: " + res.data);
            }
        } catch (catboxErr) {
            console.warn("Catbox failed, falling back to ImgBB:", catboxErr.message);

            // fallback: ImgBB
            const form = new URLSearchParams();
            form.append("image", buffer.toString("base64"));
            form.append("key", IMGBB_API_KEY);

            const imgbbRes = await axios.post("https://api.imgbb.com/1/upload", form);
            const imageUrl = imgbbRes.data?.data?.url;

            if (!imageUrl) throw new Error("ImgBB upload failed.");

            return await sock.sendMessage(
                chatId,
                { text: `✅ Uploaded (ImgBB fallback):\n${imageUrl}` },
                { quoted: message }
            );
        }
    } catch (err) {
        console.error("Error in .url command:", err);
        await sock.sendMessage(chatId, { text: "❌ Failed to upload image!" }, { quoted: message });
    }
}

module.exports = { urlCommand };
