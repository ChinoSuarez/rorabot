const { Events, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

// store join timestamps
const vcTime = new Map();

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);

  const s = seconds % 60;
  const m = mins % 60;

  if (hrs > 0) return `${hrs}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function buildEmbed(guild, user, description) {
  return new EmbedBuilder()
    .setColor("#8b0000")

    // 🔥 SERVER ICON + TITLE
    .setAuthor({
      name: "HIDALGO SECURITY",
      iconURL: guild.iconURL({ dynamic: true }) || undefined
    })

    .setTitle("VOICECALL LOGS")

    // 👤 USER AVATAR (RIGHT SIDE)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))

    .setDescription(`Details:\n${description}`)

    .setFooter({
      text: "RORA SYSTEM"
    })

    .setTimestamp();
}

module.exports = (client) => {

  client.on(Events.VoiceStateUpdate, (oldState, newState) => {

    const guild = newState.guild;
    if (!guild) return;

    const logChannel = guild.channels.cache.get(config.logChannels.voice);
    if (!logChannel) return;

    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const user = member.user;

    // 🎧 JOIN
    if (!oldState.channel && newState.channel) {

      vcTime.set(user.id, Date.now());

      const embed = buildEmbed(
        guild,
        user,
        `> 🎀 ${user} joined the voice channel ${newState.channel}`
      );

      return logChannel.send({ embeds: [embed] });
    }

    // 🔇 LEAVE
    if (oldState.channel && !newState.channel) {

      const joinTime = vcTime.get(user.id);
      const duration = joinTime
        ? formatDuration(Date.now() - joinTime)
        : "Unknown";

      vcTime.delete(user.id);

      const embed = buildEmbed(
        guild,
        user,
        `> 🎀 ${user} has left the voice channel ${oldState.channel}\n> 🎀 Stayed for: ${duration}`
      );

      return logChannel.send({ embeds: [embed] });
    }

    // 🔁 SWITCH CHANNEL
    if (
      oldState.channel &&
      newState.channel &&
      oldState.channel.id !== newState.channel.id
    ) {

      const joinTime = vcTime.get(user.id);
      const duration = joinTime
        ? formatDuration(Date.now() - joinTime)
        : "Unknown";

      // reset timer
      vcTime.set(user.id, Date.now());

      const embed = buildEmbed(
        guild,
        user,
        `> 🎀 ${user} switched VC\n\n> From: ${oldState.channel}\n> To: ${newState.channel}\n\n> 🎀 Time in previous: ${duration}`
      );

      return logChannel.send({ embeds: [embed] });
    }

  });

};