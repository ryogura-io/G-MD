const { TwitterDL } = require("twitter-downloader");

module.exports = async (XeonBotInc, from, mek, args) => {
  if (!args[1]) {
    return XeonBotInc.sendMessage(from, {
      text: "❌ Please provide a Twitter/X post link!"
    }, { quoted: mek });
  }

  const url = args[1];
  try {
    const res = await TwitterDL(url);

    if (!res || res.status !== "success" || !res.result?.media?.length) {
      return XeonBotInc.sendMessage(from, {
        text: "❌ Could not extract media from the link."
      }, { quoted: mek });
    }

    for (const media of res.result.media) {
      if (!media.url) continue; // ✅ Skip invalid entries

      if (media.type === "video") {
        await XeonBotInc.sendMessage(from, {
          video: { url: media.url.toString() },
          caption: `▶ Downloaded video from Twitter`
        }, { quoted: mek });
      } else if (media.type === "photo") {
        await XeonBotInc.sendMessage(from, {
          image: { url: media.url.toString() },
          caption: `🖼 Twitter image`
        }, { quoted: mek });
      }
    }
  } catch (err) {
    console.error("Twitter DL error:", err);
    await XeonBotInc.sendMessage(from, {
      text: "❌ Error downloading media. The link may not be supported."
    }, { quoted: mek });
  }
};
