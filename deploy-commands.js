require("dotenv").config();

const { REST, Routes } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("hidalgo-panel")
    .setDescription("Send Hidalgo role request panel")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("⏳ Registering commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Commands registered.");
  } catch (error) {
    console.error(error);
  }
})();