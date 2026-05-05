const { Events, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

// 🧠 account age formatter
function getAccountAge(user) {
  const diff = Date.now() - user.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  return `${years}y ${months}m`;
}

module.exports = (client) => {

  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      // ✅ USE CONFIG CHANNEL (FIXED)
      const channel = member.guild.channels.cache.get(config.logChannels.member);
      if (!channel) return console.log("❌ Welcome channel not found");

      const user = member.user;
      const accountAge = getAccountAge(user);

      const embed = new EmbedBuilder()
        .setColor("#8b0000")

        .setAuthor({
          name: "HIDALGO GATEKEEPER",
          iconURL: member.guild.iconURL({ dynamic: true }) || undefined
        })

        .setThumbnail(user.displayAvatarURL({ dynamic: true }))

        .setDescription(
        `Welcome to **Hidalgo Family** ${user}

        **User's Details:**
        > Discord User: ${user}
        > Account Age: ${accountAge}

        You’ve stepped into the Hidalgo Family where loyalty is everything and respect is earned.
        Carry the name with pride. Make your presence known.`
        )

        .setImage("https://cdn.discordapp.com/attachments/1449013641000124437/1500945905761779773/05041-ezgif.com-video-to-gif-converter_1.gif")

        .setFooter({
          text: "Rora & Teo Bloodline"
        })

        .setTimestamp();

      channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Welcome error:", err);
    }
  });

};