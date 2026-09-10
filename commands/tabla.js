const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../api');

module.exports = {
  data: new SlashCommandBuilder().setName('tabla').setDescription('Muestra la tabla de posiciones actual'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const tabla = await api.getTabla(process.env.SEASON);

      if (!tabla.length) {
        await interaction.editReply('No encontre la tabla de posiciones para esta temporada.');
        return;
      }

      const lineas = tabla.map(
        (equipo) =>
          `${String(equipo.intRank).padStart(2, ' ')}. ${equipo.strTeam} — ${equipo.intPoints} pts (PJ: ${equipo.intPlayed})`
      );

      let descripcion = '```\n' + lineas.join('\n') + '\n```';
      if (descripcion.length > 4000) {
        descripcion = descripcion.slice(0, 3990) + '\n...```';
      }

      const embed = new EmbedBuilder().setTitle('Tabla de posiciones').setDescription(descripcion).setColor(0xe67e22);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Hubo un error consultando la tabla. Intenta de nuevo en un rato.');
    }
  },
};
