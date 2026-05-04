const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hidalgo-panel")
    .setDescription("Send Hidalgo Family role request panel"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor("#8b0000") // dark red (family vibe)
      .setTitle("🌸 HIDALGO FAMILY ROLE REQUEST")
      .setDescription(
        "Welcome to **Hidalgo Family**.\n\n" +
        "Click the button below to submit your role request.\n\n" +

      "🦋 **Family Rules:**\n" +

      "• Loyalty above everything\n" +
      "• Respect the family at all times\n" +
      "• No immaturity, no nonsense\n\n"+

      "Failure to comply = instant rejection."
      )

      // 👉 LOGO (RIGHT SIDE)
      .setThumbnail("https://cdn.discordapp.com/attachments/1500438538091626536/1500558362935558164/hdlg.png")

      // 👉 MAIN BANNER / GIF
      .setImage("https://cdn.discordapp.com/attachments/1446053243221446667/1500712348246212648/05041-ezgif.com-video-to-gif-converter_1.gif")

      .setFooter({
        text: "Rora & Teo Bloodline"
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("hidalgo_apply")
        .setLabel("REQUEST ROLE")
        .setEmoji("🎀")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content: "✅ Hidalgo panel sent.",
      ephemeral: true
    });
  }
};