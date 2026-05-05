require("dotenv").config();

const { 
  Client, 
  GatewayIntentBits, 
  Events, 
  Collection, 
  Partials 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel]
});

// ✅ commands init
client.commands = new Collection();

/* ================= COMMANDS ================= */
const panelCommand = require("./commands/hidalgo-panel");
client.commands.set(panelCommand.data.name, panelCommand);

/* ================= HANDLERS ================= */
const roleRequestHandler = require("./interactions/roleRequest");

/* ================= LOGS ================= */
// 👉 keep all logs here (easy to manage)
[
  "./logs/voiceLogs",
  "./logs/messageLogs",
  "./logs/memberLogs",
  "./logs/leaveLogs",
  "./logs/joinLogs" // ✅ ADDED
].forEach(file => {
  require(file)(client);
});

/* ================= READY ================= */
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ================= INTERACTIONS ================= */
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
    console.error("Interaction error:", err);
  }
});

client.login(process.env.TOKEN);