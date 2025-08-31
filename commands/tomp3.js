// tomp3Command.js
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// 🔹 Tell fluent-ffmpeg where ffmpeg is
ffmpeg.setFfmpegPath(ffmpegPath);

async function tomp3Command(sock, chatId, message) {
    try {
        // Check if user replied to a video
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.videoMessage) {
            return sock.sendMessage(chatId, { text: "❌ Please reply to a video with `.tomp3`." }, { quoted: message });
        }

        // 🔹 Download quoted video
        const stream = await downloadContentFromMessage(quoted.videoMessage, "video");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Temp file paths
        const tempVideo = path.join(__dirname, "temp_video.mp4");
        const tempAudio = path.join(__dirname, "temp_audio.mp3");

        fs.writeFileSync(tempVideo, buffer);

        // 🔹 Convert video → mp3 using ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tempVideo)
                .toFormat("mp3")
                .on("end", resolve)
                .on("error", reject)
                .save(tempAudio);
        });

        // Read converted audio
        const mp3Buffer = fs.readFileSync(tempAudio);

        // 🔹 Send audio back
        await sock.sendMessage(
            chatId,
            {
                audio: mp3Buffer,
                mimetype: "audio/mpeg",
                fileName: "converted.mp3",
                ptt: false // true = send as voice note
            },
            { quoted: message }
        );

        // Cleanup
        fs.unlinkSync(tempVideo);
        fs.unlinkSync(tempAudio);

    } catch (err) {
        console.error("Error in tomp3Command:", err);
        await sock.sendMessage(chatId, { text: "❌ Error converting to MP3." }, { quoted: message });
    }
}

module.exports = tomp3Command;
