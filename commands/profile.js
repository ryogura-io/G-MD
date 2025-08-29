// profile.js

async function profileCommand(sock, chatId, message) {
    try {
        let targets = [];

        // mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            targets = message.message.extendedTextMessage.contextInfo.mentionedJid;
        }
        // quoted
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targets = [message.message.extendedTextMessage.contextInfo.participant];
        }
        // fallback: sender
        else {
            targets = [message.key.participant || message.key.remoteJid];
        }

        for (let raw of targets) {
            let jid = raw;

            // 🟢 Try to resolve @lid into a real WhatsApp JID
            if (jid.endsWith("@lid")) {
                try {
                    const lookup = await sock.onWhatsApp(jid);
                    if (lookup && lookup[0]?.jid) {
                        jid = lookup[0].jid; // real xxx@s.whatsapp.net
                    }
                } catch {
                    // ignore if cannot resolve
                }
            }

            // profile pic
            let profilePic;
            try {
                profilePic = await sock.profilePictureUrl(jid, "image");
            } catch {
                profilePic = "https://telegra.ph/file/9dc748dfd1fa76933dc09.jpg"; // fallback
            }

            // bio
            let bio = "Not available";
            try {
                const status = await sock.fetchStatus(jid);
                bio = status?.status || "Not available";
            } catch {}

            // name
            let pushName =
                sock.contacts?.[jid]?.name ||
                sock.contacts?.[jid]?.notify ||
                message.pushName ||
                "Unknown";

            await sock.sendMessage(
                chatId,
                {
                    image: { url: profilePic },
                    caption: `
┌──「 *USER INFO* 」
▢ *🔖USER JID*: 
• ${jid}
▢ *🙎‍♂️ SENDER:*
• ${pushName}`},
                { quoted: message }
            );
        }
    } catch (err) {
        console.error("❌ Error in profileCommand:", err);
        await sock.sendMessage(chatId, { text: "❌ Failed to fetch profile." }, { quoted: message });
    }
}

module.exports = profileCommand;
