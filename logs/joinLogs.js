const { Events, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

// 🧠 account age
function getAccountAge(user) {
  const diff = Date.now() - user.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return `${years}y ${months}m`;
}

module.exports = (client) => {

  const getChannel = (guild) =>
    guild.channels.cache.get(config.logChannels.join);

  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      const channel = getChannel(member.guild);
      if (!channel) return;

      const user = member.user;
      const accountAge = getAccountAge(user);

      const embed = new EmbedBuilder()
        .setColor("#2ecc71")
        .setAuthor({
          name: "HIDALGO GATEKEEPER",
          iconURL: member.guild.iconURL({ dynamic: true }) || undefined
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
`**🦋 JOIN LOGS**
**📋 DETAILS:**

> 🦋 DISCORD USER: ${user}
> 🦋 ACCOUNT AGE: ${accountAge}

${user} has joined the server.`
        )
        .setFooter({ text: "RORA SYSTEM" })
        .setTimestamp();

      channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Join log error:", err);
    }
  });

};