const settings = require('../settings');
const fs = require('fs');
const { addSudo, removeSudo, getSudoList } = require('../lib/index');

// --- Helper: normalize JID so comparisons always work ---
function normalizeJid(jid) {
    return jid ? jid.trim().toLowerCase() : '';
}

// --- Extract target user JID from message ---
function extractTargetJid(message) {
    // Check for mentioned user
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length > 0) return normalizeJid(mentioned[0]);

    // Check for replied message
    if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        return normalizeJid(message.message.extendedTextMessage.contextInfo.participant);
    }

    // Fallback: number in text
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const match = text.match(/\b(\d{7,15})\b/);
    if (match) return normalizeJid(match[1] + '@s.whatsapp.net');

    return null;
}

// --- Load owners from owner.json ---
const data = JSON.parse(fs.readFileSync('./data/owner.json'));

async function sudoCommand(sock, chatId, message) {
    const senderJid = normalizeJid(message.key.participant || message.key.remoteJid);
    const ownerJid = normalizeJid(settings.ownerNumber + '@s.whatsapp.net');

    // --- Ownership check (fromMe, ownerNumber, or owner.json list) ---
    const isOwner =
        message.key.fromMe ||
        senderJid === ownerJid ||
        data.some(j => normalizeJid(j) === senderJid);

    console.log('Sender:', JSON.stringify(senderJid));
    console.log('Owner.json list:', data);

    const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = rawText.trim().split(' ').slice(1);
    const sub = (args[0] || '').toLowerCase();

    if (!sub || !['add', 'del', 'remove', 'list'].includes(sub)) {
        await sock.sendMessage(chatId, { 
            text: 'Usage:\n.sudo add <@user|reply|number>\n.sudo del <@user|reply|number>\n.sudo list' 
        });
        return;
    }

    if (sub === 'list') {
        const list = await getSudoList();
        if (list.length === 0) {
            await sock.sendMessage(chatId, { text: 'No sudo users set.' });
            return;
        }
        const text = list.map((j, i) => `${i + 1}. @${j.split('@')[0]}`).join('\n');
        await sock.sendMessage(chatId, { 
            text: `Sudo users:\n${text}`,
            mentions: list
        });
        return;
    }

    if (!isOwner) {
        await sock.sendMessage(chatId, { 
            text: '❌ Only owner can add/remove sudo users. Use .sudo list to view.' 
        });
        return;
    }

    const targetJid = extractTargetJid(message);
    if (!targetJid) {
        await sock.sendMessage(chatId, { text: 'Please mention, reply to, or provide a number.' });
        return;
    }

    if (sub === 'add') {
        const ok = await addSudo(targetJid);
        await sock.sendMessage(chatId, { 
            text: ok ? `✅ Added sudo: @${targetJid.split('@')[0]}` : '❌ Failed to add sudo',
            mentions: [targetJid]
        });
        return;
    }

    if (sub === 'del' || sub === 'remove') {
        if (targetJid === ownerJid) {
            await sock.sendMessage(chatId, { text: '❌ Owner cannot be removed.' });
            return;
        }
        const ok = await removeSudo(targetJid);
        await sock.sendMessage(chatId, { 
            text: ok ? `✅ Removed sudo: @${targetJid.split('@')[0]}` : '❌ Failed to remove sudo',
            mentions: [targetJid]
        });
        return;
    }
}

module.exports = sudoCommand;
