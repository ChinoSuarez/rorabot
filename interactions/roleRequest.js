const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const config = require("../config.json");

/* =========================
   ROLES
========================= */

const APPROVER_ROLES = [
  "1500758718050996306",
  "1130192752022388757"
];

const PARENT_ROLES = [
  "1261504441626919035",
  "1500758718050996306",
  "1130192752022388757"
];

/* =========================
   ACCOUNT AGE
========================= */

function getAccountAge(user) {
  const diff = Date.now() - user.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  return `${years} year(s), ${months} month(s)`;
}

/* =========================
   BUILD EMBED
========================= */

function buildEmbed(user, ign, accountAge, guild) {
  return new EmbedBuilder()
    .setColor("#8b0000")
    .setAuthor({
      name: "🦋 HIDALGO ROLE REQUEST",
      iconURL: guild.iconURL({ dynamic: true })
    })
    .setTitle("HIDALGO ROLE REQUEST")
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setDescription(
`🎀 **USER'S INFORMATION:**

DISCORD USER: ${user}
ACCOUNT AGE: ${accountAge}

🎀 **CHARACTER DETAILS:**

CHARACTER NAME: \`${ign}\`

🎀 **PARENTS:** None

🟡 **PENDING ROLE REQUEST**`
    )
    .setFooter({
      text: "Hidalgo Family",
      iconURL: guild.iconURL({ dynamic: true })
    })
    .setTimestamp();
}

/* =========================
   BUTTONS
========================= */

function buildButtons(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hidalgo_vouch_${userId}`)
      .setLabel("PARENT")
      .setEmoji("🖐️")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`hidalgo_approve_${userId}`)
      .setLabel("ACCEPT")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`hidalgo_deny_${userId}`)
      .setLabel("REJECT")
      .setEmoji("⛔")
      .setStyle(ButtonStyle.Danger)
  );
}

/* =========================
   MAIN HANDLER
========================= */

module.exports = async (interaction) => {

  /* =========================
     OPEN MODAL
  ========================= */

  if (interaction.isButton() && interaction.customId === "hidalgo_apply") {

    const modal = new ModalBuilder()
      .setCustomId("hidalgo_submit")
      .setTitle("Hidalgo Role Request");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("ign")
          .setLabel("In-Game Name")
          .setPlaceholder("Firstname Lastname")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

    return interaction.showModal(modal);
  }

  /* =========================
     SUBMIT
  ========================= */

  if (interaction.isModalSubmit() && interaction.customId === "hidalgo_submit") {

    const ign = interaction.fields.getTextInputValue("ign");

    if (!ign.includes(" ")) {
      return interaction.reply({
        content: "❌ Use proper format: Firstname Lastname",
        ephemeral: true
      });
    }

    const accountAge = getAccountAge(interaction.user);

    const embed = buildEmbed(
      interaction.user,
      ign,
      accountAge,
      interaction.guild
    );

    const buttons = buildButtons(interaction.user.id);

    const channel = interaction.client.channels.cache.get(
      config.hidalgoChannelId
    );

    if (!channel) {
      return interaction.reply({
        content: "❌ Hidalgo channel not found.",
        ephemeral: true
      });
    }

    await channel.send({
      embeds: [embed],
      components: [buttons]
    });

    return interaction.reply({
      content: "✅ Application submitted.",
      ephemeral: true
    });
  }

  /* =========================
     PARENT / VOUCH
  ========================= */

  if (
    interaction.isButton() &&
    interaction.customId.startsWith("hidalgo_vouch_")
  ) {

    const hasRole = PARENT_ROLES.some(role =>
      interaction.member.roles.cache.has(role)
    );

    if (!hasRole) {
      return interaction.reply({
        content: "❌ Only authorized parents can vouch.",
        ephemeral: true
      });
    }

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    let desc = embed.data.description || "";

    let current =
      desc.match(/🎀 \*\*PARENTS:\*\* (.*)/)?.[1] || "None";

    let list = current === "None"
      ? []
      : current.split(", ");

    const tag = `<@${interaction.user.id}>`;

    if (list.includes(tag)) {
      list = list.filter(v => v !== tag);
    } else {
      list.push(tag);
    }

    const updated = list.length
      ? list.join(", ")
      : "None";

    desc = desc.replace(
      /🎀 \*\*PARENTS:\*\* .*/,
      `🎀 **PARENTS:** ${updated}`
    );

    embed.setDescription(desc);

    await interaction.update({
      embeds: [embed]
    });

    return;
  }

  /* =========================
     APPROVE
  ========================= */

  if (
    interaction.isButton() &&
    interaction.customId.startsWith("hidalgo_approve_")
  ) {

    const hasRole = APPROVER_ROLES.some(role =>
      interaction.member.roles.cache.has(role)
    );

    if (!hasRole) {
      return interaction.reply({
        content: "❌ You cannot approve requests.",
        ephemeral: true
      });
    }

    const userId = interaction.customId.split("_")[2];

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    embed.setDescription(
      embed.data.description.replace(
        "🟡 **PENDING ROLE REQUEST**",
        `✅ **APPROVED BY:** ${interaction.user}`
      )
    );

    embed.setColor("#2ecc71");

    await interaction.message.edit({
      embeds: [embed],
      components: []
    });

    const member = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);

    if (member) {

      /* AUTO CHANGE NICKNAME */

      const match = embed.data.description.match(
        /CHARACTER NAME: `(.*?)`/
      );

      const ign = match ? match[1] : null;

      if (ign) {
        await member.setNickname(ign).catch(() => {});
      }

      /* ADD ROLE */

      await member.roles
        .add("1261504441626919035")
        .catch(() => {});
    }

    return interaction.reply({
      content: "✅ Approved successfully.",
      ephemeral: true
    });
  }

  /* =========================
     DENY
  ========================= */

  if (
    interaction.isButton() &&
    interaction.customId.startsWith("hidalgo_deny_")
  ) {

    const hasRole = APPROVER_ROLES.some(role =>
      interaction.member.roles.cache.has(role)
    );

    if (!hasRole) {
      return interaction.reply({
        content: "❌ You cannot deny requests.",
        ephemeral: true
      });
    }

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    embed.setDescription(
      embed.data.description.replace(
        "🟡 **PENDING ROLE REQUEST**",
        `❌ **DENIED BY:** ${interaction.user}`
      )
    );

    embed.setColor("#e74c3c");

    await interaction.message.edit({
      embeds: [embed],
      components: []
    });

    return interaction.reply({
      content: "❌ Denied successfully.",
      ephemeral: true
    });
  }
};