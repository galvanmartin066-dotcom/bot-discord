require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const api = require('./api');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Carga automaticamente todos los archivos de la carpeta /commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);

  // Si configuraste un CHANNEL_ID, mandamos un resumen de los partidos del dia todos los dias a las 10:00 (hora Argentina).
  if (process.env.CHANNEL_ID) {
    cron.schedule(
      '0 10 * * *',
      async () => {
        try {
          const hoy = new Date().toISOString().slice(0, 10);
          const fixtures = await api.getFixturesBetween(hoy, hoy);
          const canal = await client.channels.fetch(process.env.CHANNEL_ID);

          if (!fixtures.length) {
            await canal.send('Hoy no hay partidos programados en el torneo.');
            return;
          }

          const lineas = fixtures.map((f) => {
            const hora = new Date(f.fixture.date).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            return `${hora} — **${f.teams.home.name}** vs **${f.teams.away.name}**`;
          });

          const embed = new EmbedBuilder()
            .setTitle('Partidos de hoy')
            .setDescription(lineas.join('\n'))
            .setColor(0x2ecc71);

          await canal.send({ embeds: [embed] });
        } catch (error) {
          console.error('Error mandando el resumen diario:', error);
        }
      },
      { timezone: 'America/Argentina/Buenos_Aires' }
    );
    console.log('Resumen diario automatico activado (10:00 hora Argentina).');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const mensaje = 'Hubo un error ejecutando ese comando.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: mensaje, ephemeral: true });
    } else {
      await interaction.reply({ content: mensaje, ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
