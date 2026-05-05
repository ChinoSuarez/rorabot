const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../config.json");

// 🧠 account age
function getAccountAge(user) {
  const diff = Date.now() - user.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return `${years}y ${months}m`;
}

// 🧠 stayed time
function getStayTime(member) {
  if (!member.joinedAt) return "Unknown";

  const diff = Date.now() - member.joinedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);

  if (days > 0) return `${days}d ${hrs}h`;
  return `${hrs}h`;
}

module.exports = (client) => {

  const getChannel = (guild) =>
    guild.channels.cache.get(config.logChannels.leave);

  // ❌ LEAVE / KICK
  client.on(Events.GuildMemberRemove, async (member) => {
    try {
      const channel = getChannel(member.guild);
      if (!channel) return;

      const user = member.user;
      const accountAge = getAccountAge(user);
      const stay = getStayTime(member);

      let action = `${user} has left the server`;

      // 🔍 CHECK KICK (FIXED)
      const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      });

      const entry = fetchedLogs.entries.first();

      if (entry) {
        const { target, createdTimestamp } = entry;

        // ✅ check if same user + recent log (within 5 seconds)
        if (
          target?.id === user.id &&
          Date.now() - createdTimestamp < 5000
        ) {
          action = `${user} has been kicked from the server`;
        }
      }

      const embed = new EmbedBuilder()
        .setColor("#e74c3c")
        .setAuthor({
          name: "HIDALGO GATEKEEPER",
          iconURL: member.guild.iconURL({ dynamic: true }) || undefined
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
`**🦋 LEAVE LOGS**
**📋 DETAILS:**

> 🦋 DISCORD USER: ${user}
> 🦋 ACCOUNT AGE: ${accountAge}
> 🦋 STAYED FOR: ${stay}

${action}`
        )
        .setFooter({ text: "RORA SYSTEM" })
        .setTimestamp();

      channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Leave error:", err);
    }
  });

  // 🔨 BAN
  client.on(Events.GuildBanAdd, async (ban) => {
    try {
      const channel = getChannel(ban.guild);
      if (!channel) return;

      const user = ban.user;
      const accountAge = getAccountAge(user);

      const embed = new EmbedBuilder()
        .setColor("#c0392b")
        .setAuthor({
          name: "HIDALGO GATEKEEPER",
          iconURL: ban.guild.iconURL({ dynamic: true }) || undefined
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
`**🦋 BAN LOGS**
**📋 DETAILS:**

> 🦋 DISCORD USER: ${user}
> 🦋 ACCOUNT AGE: ${accountAge}
> 🦋 STAYED FOR: Unknown

${user} has been banned from the server`
        )
        .setFooter({ text: "RORA SYSTEM" })
        .setTimestamp();

      channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Ban error:", err);
    }
  });

};