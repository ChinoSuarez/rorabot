require("dotenv").config();

const { Client, GatewayIntentBits, Events, Collection } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

/* LOAD COMMAND */
const panelCommand = require("./commands/hidalgo-panel");
client.commands.set(panelCommand.data.name, panelCommand);

/* LOAD HANDLER */
const roleRequestHandler = require("./interactions/roleRequest");

/* READY */
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* INTERACTIONS */
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    }

    if (interaction.isButton() || interaction.isModalSubmit()) {
      await roleRequestHandler(interaction);
    }

  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);