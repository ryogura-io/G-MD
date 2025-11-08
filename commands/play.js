const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        // Extract query from message
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        // Validate input with styled message
        if (!searchQuery) {
            return await sock.sendMessage(chatId, {
                text: `Please specify a song!\nExample: Play faded`
            });
        }

        // Send initial processing message
        await sock.sendMessage(chatId, {
            text: `🔍 *Searching for:* "${searchQuery}"`,
            react: { text: '🔎', key: message.key }
        });

        // Fetch from API
        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(searchQuery)}`;
        const { data } = await axios.get(apiUrl, { timeout: 30000 });

        // Validate API response
        if (!data?.status || !data?.result) {
            return await sock.sendMessage(chatId, {
                text: `❌ Song not found!`
            });
        }

        const songData = data.result;
        const downloadUrl = songData.download_url;
        const thumbnail = songData.thumbnail?.trim();

        // Format views count
        const formattedViews = songData.views 
            ? parseInt(songData.views).toLocaleString() 
            : 'N/A';

        // Create styled box message
        const boxMessage = `SONG FOUND \n🎵 Title: ${songData.title || 'Unknown'}`;

        // Send metadata with thumbnail
        await sock.sendMessage(chatId, {
            image: { url: thumbnail },
            caption: boxMessage
        });

        // Send the audio
        await sock.sendMessage(chatId, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${songData.title.replace(/[^\w\s]/gi, '') || 'audio'}.mp3`,
            ptt: false
        });

        

    } catch (error) {
        console.error('Play Command Error:', error);
        
        // Create error box
        const errorBox = `❌ Failed to process your request`;

        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = playCommand;