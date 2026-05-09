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
   CONFIG ROLES
========================= */

const APPROVER_ROLES = config.approverRoles;
const PARENT_ROLES = config.parentRoles;
const ADD_ROLE_ID = config.addRoleId;

/* =========================
   ACCOUNT AGE
========================= */

function getAccountAge(user) {

  const diff = Date.now() - user.createdAt;

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  const years = Math.floor(days / 365);

  const months = Math.floor(
    (days % 365) / 30
  );

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

    .setThumbnail(
      user.displayAvatarURL({ dynamic: true })
    )

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

  return new ActionRowBuilder()

    .addComponents(

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
     APPLY BUTTON
  ========================= */

  if (
    interaction.isButton() &&
    interaction.customId === "hidalgo_apply"
  ) {

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
     SUBMIT APPLICATION
  ========================= */

  if (
    interaction.isModalSubmit() &&
    interaction.customId === "hidalgo_submit"
  ) {

    const ign =
      interaction.fields.getTextInputValue("ign");

    if (!ign.includes(" ")) {

      return interaction.reply({
        content:
          "❌ Use proper format: Firstname Lastname",
        ephemeral: true
      });
    }

    const accountAge =
      getAccountAge(interaction.user);

    const embed = buildEmbed(
      interaction.user,
      ign,
      accountAge,
      interaction.guild
    );

    const buttons =
      buildButtons(interaction.user.id);

    const channel =
      interaction.client.channels.cache.get(
        config.hidalgoChannelId
      );

    if (!channel) {

      return interaction.reply({
        content:
          "❌ Hidalgo request channel not found.",
        ephemeral: true
      });
    }

    await channel.send({
      embeds: [embed],
      components: [buttons]
    });

    return interaction.reply({
      content:
        "✅ Your application has been submitted.",
      ephemeral: true
    });
  }

  /* =========================
     PARENT / VOUCH
  ========================= */

  if (
    interaction.isButton() &&
    interaction.customId.startsWith(
      "hidalgo_vouch_"
    )
  ) {

    const hasRole =
      interaction.member.roles.cache.some(
        role =>
          PARENT_ROLES.includes(role.id)
      );

    if (!hasRole) {

      return interaction.reply({
        content:
          "❌ Only authorized parents can vouch.",
        ephemeral: true
      });
    }

    const embed =
      EmbedBuilder.from(
        interaction.message.embeds[0]
      );

    let desc =
      embed.data.description || "";

    let current =
      desc.match(
        /🎀 \*\*PARENTS:\*\* (.*)/
      )?.[1] || "None";

    let list =
      current === "None"
        ? []
        : current.split(", ");

    const tag =
      `<@${interaction.user.id}>`;

    if (list.includes(tag)) {

      list =
        list.filter(v => v !== tag);

    } else {

      list.push(tag);
    }

    const updated =
      list.length
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
    interaction.customId.startsWith(
      "hidalgo_approve_"
    )
  ) {

    const hasRole =
      interaction.member.roles.cache.some(
        role =>
          APPROVER_ROLES.includes(role.id)
      );

    if (!hasRole) {

      return interaction.reply({
        content:
          "❌ You are not allowed to approve requests.",
        ephemeral: true
      });
    }

    const userId =
      interaction.customId.replace(
        "hidalgo_approve_",
        ""
      );

    const embed =
      EmbedBuilder.from(
        interaction.message.embeds[0]
      );

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

    const member =
      await interaction.guild.members
        .fetch(userId)
        .catch(() => null);

    if (member) {

      const match =
        embed.data.description.match(
          /CHARACTER NAME: `(.*?)`/
        );

      const ign =
        match ? match[1] : null;

      /* AUTO NICKNAME */

      if (ign) {

        await member
          .setNickname(ign)
          .catch(() => {});
      }

      /* ADD ROLE */

      await member.roles
        .add(ADD_ROLE_ID)
        .catch(() => {});
    }

    return interaction.reply({
      content:
        "✅ Request approved successfully.",
      ephemeral: true
    });
  }

  /* =========================
     DENY
  ========================= */

  if (
    interaction.isButton() &&
    interaction.customId.startsWith(
      "hidalgo_deny_"
    )
  ) {

    const hasRole =
      interaction.member.roles.cache.some(
        role =>
          APPROVER_ROLES.includes(role.id)
      );

    if (!hasRole) {

      return interaction.reply({
        content:
          "❌ You are not allowed to deny requests.",
        ephemeral: true
      });
    }

    const embed =
      EmbedBuilder.from(
        interaction.message.embeds[0]
      );

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
      content:
        "❌ Request denied successfully.",
      ephemeral: true
    });
  }
};