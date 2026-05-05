const { Events, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

function buildEmbed(guild, user, title, description, color) {
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: "HIDALGO SECURITY",
      iconURL: guild.iconURL({ dynamic: true }) || undefined
    })
    .setTitle(title)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setDescription(description)
    .setFooter({
      text: "RORA SYSTEM"
    })
    .setTimestamp();
}

module.exports = (client) => {

  const getChannel = (guild) =>
    guild.channels.cache.get(config.logChannels.message);

  // ✏️ EDIT MESSAGE
  client.on(Events.MessageUpdate, async (oldMsg, newMsg) => {
    try {
      if (!newMsg.guild) return;

      // 🔥 HANDLE PARTIALS
      if (oldMsg.partial) await oldMsg.fetch().catch(() => {});
      if (newMsg.partial) await newMsg.fetch().catch(() => {});

      const author = newMsg.author || oldMsg.author;
      if (!author || author.bot) return;

      // ✅ FIX: use safe values instead of direct compare
      const before = oldMsg.content ?? "";
      const after = newMsg.content ?? "";

      if (before === after) return;

      const logChannel = getChannel(newMsg.guild);
      if (!logChannel) return;

      const embed = buildEmbed(
        newMsg.guild,
        author,
        "EDIT MESSAGE LOGS",
`DETAILS:

FROM: ${author}
CHANNEL: ${newMsg.channel}

BEFORE:
\`${before || "No content"}\`

AFTER:
\`${after || "No content"}\`

🔗 [Jump to Message](${newMsg.url})`,
        "#f1c40f"
      );

      logChannel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Edit log error:", err);
    }
  });

  // 🗑️ DELETE MESSAGE
  client.on(Events.MessageDelete, async (message) => {
    try {
      if (!message.guild) return;

      if (message.partial) await message.fetch().catch(() => {});

      const author = message.author;
      if (!author || author.bot) return;

      const logChannel = getChannel(message.guild);
      if (!logChannel) return;

      const embed = buildEmbed(
        message.guild,
        author,
        "DELETED MESSAGE LOGS",
`DETAILS:

FROM: ${author}
CHANNEL: ${message.channel}

DELETED MESSAGE:
\`${message.content || "No content"}\``,
        "#e74c3c"
      );

      logChannel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Delete log error:", err);
    }
  });

};