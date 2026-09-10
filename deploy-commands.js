// Este script le avisa a Discord que comandos existen (/proximos, /resultados, etc).
// Se corre UNA VEZ (o cada vez que agregues/cambies un comando), no es parte del bot corriendo 24/7.
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registrando ${commands.length} comandos...`);

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
      body: commands,
    });

    console.log('Comandos registrados con exito.');
  } catch (error) {
    console.error(error);
  }
})();
