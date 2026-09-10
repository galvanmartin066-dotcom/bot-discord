          const hoy = new Date().toISOString().slice(0, 10);
          const proximos = await api.getProximosPartidos();
          const deHoy = proximos.filter((p) => p.dateEvent === hoy);
          const canal = await client.channels.fetch(process.env.CHANNEL_ID);

          if (!deHoy.length) {
            await canal.send('Hoy no hay partidos programados en el torneo.');
            return;
          }

          const lineas = deHoy.map((p) => {
            return `${p.strTime || ''} — **${p.strHomeTeam}** vs **${p.strAwayTeam}**`;
          });

// Servidor web minimo. Render necesita que el proyecto responda en un puerto para
// considerarlo "activo", y este mismo endpoint es al que le va a hacer ping UptimeRobot
// cada 5 minutos para que el servicio no se duerma. No tiene ninguna otra funcion.
const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('El bot esta corriendo.');
  })
  .listen(PORT, () => console.log(`Servidor de estado escuchando en el puerto ${PORT}`));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Carga automaticamente todos los archivos de la carpeta /commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`Bot conectado como ${client.user.tag}`);

  // Le avisa a Discord que comandos existen (/proximos, /tabla, etc). Se repite en
  // cada arranque, pero eso no genera problemas ni duplicados.
  try {
    const commandsData = commandFiles.map((file) => require(path.join(commandsPath, file)).data.toJSON());
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), {
      body: commandsData,
    });
    console.log('Comandos registrados correctamente.');
  } catch (error) {
    console.error('Error registrando comandos:', error);
  }

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
