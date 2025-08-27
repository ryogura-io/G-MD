const settings = require('../settings');
const { isSudo } = require('./index');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/owner.json'));

async function isOwnerOrSudo(senderId) {
    // Get owner number from settings
    const ownerJid = settings.ownerNumber + "@s.whatsapp.net" || data.includes(senderJid);
    if (senderId === ownerJid) return true;
    try {
        return await isSudo(senderId);
    } catch (e) {
        return false;
    }
}

module.exports = isOwnerOrSudo;
